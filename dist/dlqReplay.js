/**
 * DLQ Replay CLI Utility (refactored for standard CLI helpers)
 *
 * Usage:
 *   pnpm tsx scripts/dlqReplay.ts --brokers localhost:9092 --dlq-topic my-topic.DLQ --main-topic my-topic [--from-beginning] [--limit N] [--dry-run] [--help] [--json]
 *
 * Flags:
 *   --help         Show usage information and exit
 *   --json         Output results in JSON format
 *   --dry-run      Log what would be replayed, do not produce
 *   --from-beginning  Consume from beginning of DLQ topic (default: true)
 *   --limit N      Max number of DLQ events to replay
 *   --brokers      Comma-separated list of Kafka brokers (required)
 *   --dlq-topic    DLQ topic to consume from (required)
 *   --main-topic   Main topic to replay to (required)
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for dlqReplay script."
 *   - "Replay DLQ events with machine-readable output."
 */
import { Kafka, logLevel } from 'kafkajs';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
// @ts-ignore
import { DLQEventSchema } from './src/schemas/AgentOrchestrationEngineSchema.js';
import { SpanStatusCode, trace } from '@opentelemetry/api';
const tracer = trace.getTracer('dlqReplay');
const options = {
    'help': { desc: 'Show help', type: 'boolean' },
    'json': { desc: 'Output in JSON format', type: 'boolean' },
    'dry-run': { desc: 'Log what would be replayed, do not produce', type: 'boolean' },
    'from-beginning': { desc: 'Consume from beginning of DLQ topic', type: 'boolean', default: true },
    'limit': { desc: 'Max number of DLQ events to replay', type: 'number' },
    'brokers': { desc: 'Comma-separated list of Kafka brokers', type: 'string', required: true },
    'dlq-topic': { desc: 'DLQ topic to consume from', type: 'string', required: true },
    'main-topic': { desc: 'Main topic to replay to', type: 'string', required: true }
};
async function main() {
    const { args, showHelp } = parseCliArgs({ options });
    if (showHelp)
        return printUsage('Usage: pnpm tsx scripts/dlqReplay.ts --brokers <brokers> --dlq-topic <dlq> --main-topic <main> [--from-beginning] [--limit N] [--dry-run] [--help] [--json]', options);
    try {
        const brokers = args['brokers']?.split(',');
        const dlqTopic = args['dlq-topic'];
        const mainTopic = args['main-topic'];
        const fromBeginning = args['from-beginning'] ?? true;
        const limit = args['limit'];
        const dryRun = args['dry-run'] ?? false;
        if (!brokers || !dlqTopic || !mainTopic) {
            return printError('Missing required arguments. Use --help for usage.', args['json']);
        }
        const kafka = new Kafka({ brokers, logLevel: logLevel.WARN });
        const consumer = kafka.consumer({ groupId: `dlq-replay-${Math.random().toString(36).substring(2, 10)}` });
        const producer = kafka.producer();
        let replayed = 0;
        let errors = 0;
        let processed = 0;
        let shuttingDown = false;
        async function shutdown() {
            if (shuttingDown)
                return;
            shuttingDown = true;
            console.log('\n[dlqReplay] Shutting down...');
            try {
                await consumer.disconnect();
                await producer.disconnect();
            }
            catch (err) {
                console.error('[dlqReplay] Error during shutdown:', err);
            }
            printSummary(replayed, errors, processed, dryRun);
            process.exit(0);
        }
        function printSummary(replayed, errors, processed, dryRun) {
            const summary = {
                totalProcessed: processed,
                replayed: replayed,
                errors: errors,
                dryRun: dryRun
            };
            if (args['json']) {
                printResult(JSON.stringify(summary));
            }
            else {
                console.log('\n[dlqReplay] Replay Summary:');
                console.log(`  Total processed: ${processed}`);
                console.log(`  Replayed:        ${replayed}`);
                console.log(`  Errors:          ${errors}`);
                console.log(`  Dry-run:         ${dryRun}`);
            }
        }
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        await consumer.connect();
        await producer.connect();
        await consumer.subscribe({ topic: dlqTopic, fromBeginning });
        console.log(`[dlqReplay] Starting DLQ replay from ${dlqTopic} to ${mainTopic} (dryRun=${dryRun})...`);
        await consumer.run({
            eachMessage: async ({ topic: _topic, partition: _partition, message }) => {
                // Suppress unused variable linter warnings for _topic and _partition
                void _topic;
                void _partition;
                if (shuttingDown)
                    return;
                processed++;
                await tracer.startActiveSpan('dlqReplay.consumeDLQ', async (span) => {
                    try {
                        const dlqEvent = JSON.parse(message.value.toString());
                        const parsed = DLQEventSchema.safeParse(dlqEvent);
                        if (!parsed.success) {
                            const offsetStr = (typeof message === 'object' && message !== null && 'offset' in message && message['offset']) ? String(message['offset']) : 'unknown';
                            console.error(`[dlqReplay] Invalid DLQ event at offset ${offsetStr}:`, parsed.error.issues);
                            errors++;
                            if (isSpan(span))
                                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid DLQ event' });
                            return;
                        }
                        const originalEvent = dlqEvent.originalEvent;
                        if (dryRun) {
                            console.log(`[dry-run] Would replay event to ${mainTopic}:`, originalEvent);
                            replayed++;
                        }
                        else {
                            await tracer.startActiveSpan('dlqReplay.produceReplay', async (produceSpan) => {
                                try {
                                    await producer.send({
                                        topic: mainTopic,
                                        messages: [{ value: JSON.stringify(originalEvent) }],
                                    });
                                    if (isSpan(produceSpan))
                                        produceSpan.setStatus({ code: SpanStatusCode.OK });
                                    replayed++;
                                }
                                catch (produceErr) {
                                    console.error(`[dlqReplay] Error producing to ${mainTopic}:`, produceErr);
                                    if (isSpan(produceSpan))
                                        produceSpan.setStatus({ code: SpanStatusCode.ERROR, message: String(produceErr) });
                                    errors++;
                                }
                                finally {
                                    if (isSpan(produceSpan))
                                        produceSpan.end();
                                }
                            });
                        }
                        if (isSpan(span))
                            span.setStatus({ code: SpanStatusCode.OK });
                    }
                    catch (err) {
                        console.error(`[dlqReplay] Error processing DLQ event:`, err);
                        if (isSpan(span))
                            span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
                        errors++;
                    }
                    finally {
                        if (isSpan(span))
                            span.end();
                    }
                });
                if (limit && replayed >= limit) {
                    console.log(`[dlqReplay] Replay limit reached (${limit}). Exiting...`);
                    await shutdown();
                }
            },
        });
    }
    catch (err) {
        printError(err);
        process.exit(1);
    }
}
main().catch((err) => {
    printError(err);
    process.exit(1);
});
// Type guard for OpenTelemetry Span
function isSpan(obj) {
    return typeof obj === 'object' && obj !== null && typeof obj.setStatus === 'function' && typeof obj.end === 'function';
}
