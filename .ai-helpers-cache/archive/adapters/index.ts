import { KafkaEventBus } from './KafkaEventBus.js';
import { NatsEventBus } from './NatsEventBus.js';
import { DaprEventBus } from './DaprEventBus.js';
import { SemanticKernelAdapter } from './semanticKernelAdapter.js';
import { CrewAIAdapter } from './crewAIAdapter.js';
import { LangChainAdapter } from './langchainAdapter.js';

// Provide required constructor args for Kafka and NATS
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const kafkaBrokers = (process.env['KAFKA_BROKERS']?.split(',') ?? ['localhost:9092']);
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const kafkaClientId = process.env['KAFKA_CLIENT_ID'] ?? 'nootropic';

// Export a function to register all adapters
export function registerAllAdapters(registry: typeof import('../capabilities/registry.js').default) {
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new KafkaEventBus(kafkaBrokers, kafkaClientId));
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new NatsEventBus());
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new DaprEventBus());
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new SemanticKernelAdapter());
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new CrewAIAdapter());
  // @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
  registry.register(new LangChainAdapter());
}

// Only export concrete classes and values, not interfaces or types
export { KafkaEventBus } from './KafkaEventBus.js';
export * from './NatsEventBus.js';
export * from './DaprEventBus.js';
export * from './semanticKernelAdapter.js';
export * from './crewAIAdapter.js';
export * from './langchainAdapter.js';

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'adapters', description: 'Stub lifecycle hooks for registry compliance.' }; } 