// Late-initialization of distributed event bus backends to avoid circular dependencies.
// Call this after all core registry setup is complete.
import { KafkaEventBus } from './KafkaEventBus.js';
import { NatsEventBus } from './NatsEventBus.js';
import { DaprEventBus } from './DaprEventBus.js';
export function initEventBusBackends(registry) {
    // Provide required constructor args for Kafka and NATS
    const kafkaBrokers = (process.env['KAFKA_BROKERS']?.split(',') ?? ['localhost:9092']);
    const kafkaClientId = process.env['KAFKA_CLIENT_ID'] ?? 'nootropic';
    registry.register(new KafkaEventBus(kafkaBrokers, kafkaClientId));
    registry.register(new NatsEventBus());
    registry.register(new DaprEventBus());
}
