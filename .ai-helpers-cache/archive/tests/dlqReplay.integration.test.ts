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
// @ts-expect-error TS(2307): Cannot find module 'child_process' or its correspo... Remove this comment to see the full error message
import { spawn } from 'child_process';
import { Kafka, logLevel, Producer } from 'kafkajs';
import { DLQEventSchema } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(6133): 'expect' is declared but its value is never read.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const TEST_BROKERS = process.env['TEST_KAFKA_BROKERS']?.split(',') ?? ['localhost:9092'];
const DLQ_TOPIC = 'test-dlqReplay.DLQ';
const MAIN_TOPIC = 'test-dlqReplay';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const shouldRun = !!process.env['TEST_KAFKA_BROKERS'];
// @ts-expect-error TS(2349): This expression is not callable.
(shouldRun ? describe : describe.skip)('dlqReplay CLI integration', () => {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let kafka: Kafka;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let producer: Producer;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let skip = false;

  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  beforeAll(async () => {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!shouldRun) {
      // @ts-expect-error TS(2304): Cannot find name 'skip'.
      skip = true;
      return;
    }
    kafka = new Kafka({ brokers: TEST_BROKERS, logLevel: logLevel.WARN });
    // @ts-expect-error TS(2552): Cannot find name 'kafka'. Did you mean 'Kafka'?
    producer = kafka.producer();
    // @ts-expect-error TS(2304): Cannot find name 'producer'.
    await producer.connect();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  afterAll(async () => {
    // @ts-expect-error TS(2304): Cannot find name 'producer'.
    await producer.disconnect();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should dry-run replay a valid DLQ event and print summary', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    // @ts-expect-error TS(2304): Cannot find name 'validDlqEvent'.
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
    // @ts-expect-error TS(2304): Cannot find name 'producer'.
    await producer.send({ topic: DLQ_TOPIC, messages: [{ value: JSON.stringify(validDlqEvent) }] });

    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error TS(2304): Cannot find name 'cli'.
      const cli = spawn('pnpm', [
        'tsx',
        'scripts/dlqReplay.ts',
        '--brokers', TEST_BROKERS.join(','),
        '--dlq-topic', DLQ_TOPIC,
        '--main-topic', MAIN_TOPIC,
        '--dry-run',
        '--limit', '1',
      ]);
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      let stdout = '';
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      cli.stdout.on('data', (data) => { stdout += data.toString(); });
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      cli.on('close', (code) => {
        try {
          // @ts-expect-error TS(6133): 'code' is declared but its value is never read.
          expect(code).toBe(0);
          // @ts-expect-error TS(6133): 'stdout' is declared but its value is never read.
          expect(stdout).toContain('[dry-run] Would replay event to');
          // @ts-expect-error TS(6133): 'stdout' is declared but its value is never read.
          expect(stdout).toContain('Replay Summary');
          resolve();
        // @ts-expect-error TS(7006): Parameter 'err' implicitly has an 'any' type.
        } catch (err) {
          // @ts-expect-error TS(2304): Cannot find name 'reject'.
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
  }, 20000);

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should log error for invalid DLQ event', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    // @ts-expect-error TS(2304): Cannot find name 'producer'.
    await producer.send({ topic: DLQ_TOPIC, messages: [{ value: JSON.stringify({ foo: 'bar' }) }] });
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error TS(2304): Cannot find name 'cli'.
      const cli = spawn('pnpm', [
        'tsx',
        'scripts/dlqReplay.ts',
        '--brokers', TEST_BROKERS.join(','),
        '--dlq-topic', DLQ_TOPIC,
        '--main-topic', MAIN_TOPIC,
        '--dry-run',
        '--limit', '1',
      ]);
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      let stdout = '';
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      cli.stdout.on('data', (data) => { stdout += data.toString(); });
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      cli.on('close', (code) => {
        try {
          // @ts-expect-error TS(6133): 'code' is declared but its value is never read.
          expect(code).toBe(0);
          // @ts-expect-error TS(6133): 'stdout' is declared but its value is never read.
          expect(stdout).toContain('Invalid DLQ event');
          resolve();
        // @ts-expect-error TS(7006): Parameter 'err' implicitly has an 'any' type.
        } catch (err) {
          // @ts-expect-error TS(2304): Cannot find name 'reject'.
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
  }, 20000);
}); 