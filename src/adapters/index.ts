// @ts-ignore
import { KafkaEventBus } from './KafkaEventBus.js';
// @ts-ignore
import { NatsEventBus } from './NatsEventBus.js';
// @ts-ignore
import { DaprEventBus } from './DaprEventBus.js';
// @ts-ignore
import { SemanticKernelAdapter } from './semanticKernelAdapter.js';
// @ts-ignore
import { CrewAIAdapter } from './crewAIAdapter.js';
// @ts-ignore
import { LangChainAdapter } from './langchainAdapter.js';

// Provide required constructor args for Kafka and NATS
const kafkaBrokers = (process.env['KAFKA_BROKERS']?.split(',') ?? ['localhost:9092']);
const kafkaClientId = process.env['KAFKA_CLIENT_ID'] ?? 'nootropic';

// Export a function to register all adapters
export function registerAllAdapters(registry: typeof import('../capabilities/registry.js').default) {
  registry.register(new KafkaEventBus(kafkaBrokers, kafkaClientId));
  registry.register(new NatsEventBus());
  registry.register(new DaprEventBus());
  registry.register(new SemanticKernelAdapter());
  registry.register(new CrewAIAdapter());
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