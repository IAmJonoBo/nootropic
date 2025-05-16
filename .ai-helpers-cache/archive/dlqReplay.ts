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
import { Kafka, logLevel, Message } from 'kafkajs';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
import { DLQEventSchema } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(6133): 'SpanStatusCode' is declared but its value is neve... Remove this comment to see the full error message
import { SpanStatusCode, trace } from '@opentelemetry/api';

// @ts-expect-error TS(6133): 'tracer' is declared but its value is never read.
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
  if (showHelp) return printUsage('Usage: pnpm tsx scripts/dlqReplay.ts --brokers <brokers> --dlq-topic <dlq> --main-topic <main> [--from-beginning] [--limit N] [--dry-run] [--help] [--json]', options);
  try {
    const brokers: string[] = args['brokers']?.split(',');
    const dlqTopic: string = args['dlq-topic'];
    const mainTopic: string = args['main-topic'];
    // @ts-expect-error TS(6133): 'fromBeginning' is declared but its value is never... Remove this comment to see the full error message
    const fromBeginning: boolean = args['from-beginning'] ?? true;
    const limit: number | undefined = args['limit'];
    const dryRun: boolean = args['dry-run'] ?? false;
    if (!brokers || !dlqTopic || !mainTopic) {
      return printError('Missing required arguments. Use --help for usage.', args['json']);
    }

    const kafka = new Kafka({ brokers, logLevel: logLevel.WARN });
    // @ts-expect-error TS(2349): This expression is not callable.
    const consumer = kafka.consumer({ groupId: `dlq-replay-${Math.random().toString(36).substring(2, 10)}` });
    const producer = kafka.producer();

    let replayed = 0;
    let errors = 0;
    let processed = 0;
    let shuttingDown = false;

    async function shutdown() {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log('\n[dlqReplay] Shutting down...');
      try {
        await consumer.disconnect();
        await producer.disconnect();
      } catch (err) {
        console.error('[dlqReplay] Error during shutdown:', err);
      }
      printSummary(replayed, errors, processed, dryRun);
      process.exit(0);
    }

    function printSummary(replayed: number, errors: number, processed: number, dryRun: boolean) {
      const summary = {
        totalProcessed: processed,
        replayed: replayed,
        errors: errors,
        dryRun: dryRun
      };
      if (args['json']) {
        printResult(JSON.stringify(summary));
      } else {
        console.log('\n[dlqReplay] Replay Summary:');
        // @ts-expect-error TS(2304): Cannot find name 'Total'.
        console.log(`  Total processed: ${processed}`);
        // @ts-expect-error TS(2304): Cannot find name 'Replayed'.
        console.log(`  Replayed:        ${replayed}`);
        // @ts-expect-error TS(2552): Cannot find name 'Errors'. Did you mean 'Error'?
        console.log(`  Errors:          ${errors}`);
        // @ts-expect-error TS(2304): Cannot find name 'Dry'.
        console.log(`  Dry-run:         ${dryRun}`);
      }
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: dlqTopic, fromBeginning });

    // @ts-expect-error TS(2304): Cannot find name 'dlqReplay'.
    console.log(`[dlqReplay] Starting DLQ replay from ${dlqTopic} to ${mainTopic} (dryRun=${dryRun})...`);

    await consumer.run({
      eachMessage: async ({ topic: _topic, partition: _partition, message }: { topic: string; partition: number; message: Message }) => {
        // Suppress unused variable linter warnings for _topic and _partition
        void _topic;
        void _partition;
        if (shuttingDown) return;
        processed++;
        await tracer.startActiveSpan('dlqReplay.consumeDLQ', async (span: unknown) => {
          try {
            const dlqEvent = JSON.parse(message.value!.toString());
            const parsed = DLQEventSchema.safeParse(dlqEvent);
            if (!parsed.success) {
              const offsetStr = (typeof message === 'object' && message !== null && 'offset' in message && message['offset']) ? String((message as Record<string, unknown>)['offset']) : 'unknown';
              // @ts-expect-error TS(2304): Cannot find name 'dlqReplay'.
              console.error(`[dlqReplay] Invalid DLQ event at offset ${offsetStr}:`, parsed.error.issues);
              errors++;
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid DLQ event' });
              return;
            }
            const originalEvent = dlqEvent.originalEvent;
            if (dryRun) {
              // @ts-expect-error TS(2304): Cannot find name 'dry'.
              console.log(`[dry-run] Would replay event to ${mainTopic}:`, originalEvent);
              replayed++;
            } else {
              await tracer.startActiveSpan('dlqReplay.produceReplay', async (produceSpan: unknown) => {
                try {
                  await producer.send({
                    topic: mainTopic,
                    messages: [{ value: JSON.stringify(originalEvent) }],
                  });
                  produceSpan.setStatus({ code: SpanStatusCode.OK });
                  replayed++;
                } catch (produceErr) {
                  // @ts-expect-error TS(2304): Cannot find name 'dlqReplay'.
                  console.error(`[dlqReplay] Error producing to ${mainTopic}:`, produceErr);
                  produceSpan.setStatus({ code: SpanStatusCode.ERROR, message: String(produceErr) });
                  errors++;
                } finally {
                  produceSpan.end();
                }
              });
            }
            span.setStatus({ code: SpanStatusCode.OK });
          } catch (err) {
            // @ts-expect-error TS(2304): Cannot find name 'dlqReplay'.
            console.error(`[dlqReplay] Error processing DLQ event:`, err);
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
            errors++;
          } finally {
            span.end();
          }
        });
        if (limit && replayed >= limit) {
          // @ts-expect-error TS(2304): Cannot find name 'dlqReplay'.
          console.log(`[dlqReplay] Replay limit reached (${limit}). Exiting...`);
          await shutdown();
        }
      },
    });
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

main().catch((err) => {
  printError(err);
  process.exit(1);
}); 