import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/shared";
import { context, trace } from "@opentelemetry/api";

@Injectable()
export class ObservabilityAdapter {
  private readonly logger = new Logger("observability-adapter");

  constructor() {
    this.logger.info("Initializing observability adapter");
  }

  async startSpan(name: string): Promise<void> {
    const tracer = trace.getTracer("nootropic");
    const span = tracer.startSpan(name);
    context.with(trace.setSpan(context.active(), span), () => {
      this.logger.debug(`Started span: ${name}`);
    });
  }

  async endSpan(name: string): Promise<void> {
    const tracer = trace.getTracer("nootropic");
    const span = trace.getSpan(context.active());
    if (span) {
      span.end();
      this.logger.debug(`Ended span: ${name}`);
    }
  }

  async recordMetric(name: string, value: number): Promise<void> {
    this.logger.debug(`Recorded metric: ${name} = ${value}`);
  }

  async recordEvent(name: string, attributes?: Record<string, unknown>): Promise<void> {
    this.logger.debug(`Recorded event: ${name}`, attributes);
  }
}
