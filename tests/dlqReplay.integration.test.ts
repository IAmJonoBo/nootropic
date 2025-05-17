/**
 * Integration test for the DLQ replay CLI utility (scripts/dlqReplay.ts).
 *
 * - Produces a valid DLQ event to a test DLQ topic.
 * - Runs the CLI in dry-run mode and verifies output.
 * - Asserts correct validation, dry-run output, and summary.
 * - Tests error handling with an invalid DLQ event.
 * - Skips if Kafka is not available (set TEST_KAFKA_BROKERS env var to enable).
 *
 * WIP: Full integration may require a running Kafka cluster and is best run in CI with proper setup.
 */
import { spawn } from 'child_process';
import { Kafka, logLevel, Producer } from 'kafkajs';
// @ts-ignore
import { DLQEventSchema } from '../src/schemas/AgentOrchestrationEngineSchema.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const TEST_BROKERS = process.env['TEST_KAFKA_BROKERS']?.split(',') ?? ['localhost:9092'];
const DLQ_TOPIC = 'test-dlqReplay.DLQ';
const MAIN_TOPIC = 'test-dlqReplay';

const shouldRun = !!process.env['TEST_KAFKA_BROKERS'];
(shouldRun ? describe : describe.skip)('dlqReplay CLI integration', () => {
  let kafka: Kafka;
  let producer: Producer;
  let skip = false;

  beforeAll(async () => {
    if (!shouldRun) {
      skip = true;
      return;
    }
    kafka = new Kafka({ brokers: TEST_BROKERS, logLevel: logLevel.WARN });
    producer = kafka.producer();
    await producer.connect();
  });

  afterAll(async () => {
    await producer.disconnect();
  });

  it('should dry-run replay a valid DLQ event and print summary', async () => {
    if (skip) return;
    const validDlqEvent = DLQEventSchema.parse({
      type: 'DLQ',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      originalEvent: { type: 'TestEvent', agentId: 'test-agent', timestamp: new Date().toISOString() },
      error: { errorType: 'TestError', message: 'Test error', stack: 'stacktrace' },
      metadata: { topic: MAIN_TOPIC, partition: 0, offset: 0, originalTimestamp: new Date().toISOString(), traceContext: { traceId: 't', spanId: 's', parentSpanId: 'p' } },
      traceId: 't',
      spanId: 's',
      parentSpanId: 'p',
      version: '1.0.0',
    });
    await producer.send({ topic: DLQ_TOPIC, messages: [{ value: JSON.stringify(validDlqEvent) }] });

    await new Promise<void>((resolve, reject) => {
      const cli = spawn('pnpm', [
        'tsx',
        'scripts/dlqReplay.ts',
        '--brokers', TEST_BROKERS.join(','),
        '--dlq-topic', DLQ_TOPIC,
        '--main-topic', MAIN_TOPIC,
        '--dry-run',
        '--limit', '1',
      ]);
      let stdout = '';
      cli.stdout.on('data', (data) => { stdout += data.toString(); });
      cli.on('close', (code) => {
        try {
          expect(code).toBe(0);
          expect(stdout).toContain('[dry-run] Would replay event to');
          expect(stdout).toContain('Replay Summary');
          resolve();
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  }, 20000);

  it('should log error for invalid DLQ event', async () => {
    if (skip) return;
    await producer.send({ topic: DLQ_TOPIC, messages: [{ value: JSON.stringify({ foo: 'bar' }) }] });
    await new Promise<void>((resolve, reject) => {
      const cli = spawn('pnpm', [
        'tsx',
        'scripts/dlqReplay.ts',
        '--brokers', TEST_BROKERS.join(','),
        '--dlq-topic', DLQ_TOPIC,
        '--main-topic', MAIN_TOPIC,
        '--dry-run',
        '--limit', '1',
      ]);
      let stdout = '';
      cli.stdout.on('data', (data) => { stdout += data.toString(); });
      cli.on('close', (code) => {
        try {
          expect(code).toBe(0);
          expect(stdout).toContain('Invalid DLQ event');
          resolve();
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  }, 20000);
}); 