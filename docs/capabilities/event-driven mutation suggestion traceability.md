# event-driven mutation suggestion traceability

Implements full traceability for all mutation/refactor suggestions via structured event emission. Every suggestion (schema drift, TODO, test gap) emits a v1.mutationSuggested event, which is logged, replayable, and observable via the event bus. Events are schema-validated, versioned, and compatible with distributed backends (NATS, Kafka, Dapr, JSONL).

