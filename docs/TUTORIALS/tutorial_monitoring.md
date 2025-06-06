# Tutorial: Monitoring and Observability

## Overview

This tutorial covers monitoring and observability strategies for nootropic, including metrics collection, logging, tracing, and alerting.

## Metrics Collection

### 1. Application Metrics

1. **Performance Metrics**
   ```typescript
   // libs/monitoring/src/lib/performance-metrics.ts
   export class PerformanceMetrics {
     private readonly metrics: Map<string, Metric> = new Map();

     recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
       const metric = this.metrics.get(name) || {
         name,
         type: 'gauge',
         values: new Map()
       };

       const key = this.getLabelKey(labels);
       metric.values.set(key, value);
       this.metrics.set(name, metric);
     }

     getMetrics(): Metric[] {
       return Array.from(this.metrics.values());
     }

     private getLabelKey(labels: Record<string, string>): string {
       return Object.entries(labels)
         .sort(([a], [b]) => a.localeCompare(b))
         .map(([k, v]) => `${k}="${v}"`)
         .join(',');
     }
   }
   ```

2. **Business Metrics**
   ```typescript
   // libs/monitoring/src/lib/business-metrics.ts
   export class BusinessMetrics {
     private readonly metrics: PerformanceMetrics;

     constructor(metrics: PerformanceMetrics) {
       this.metrics = metrics;
     }

     recordUserActivity(userId: string, action: string): void {
       this.metrics.recordMetric('user_activity', 1, {
         user_id: userId,
         action
       });
     }

     recordModelUsage(modelId: string, tokens: number): void {
       this.metrics.recordMetric('model_tokens', tokens, {
         model_id: modelId
       });
     }

     recordWorkflowCompletion(workflowId: string, duration: number): void {
       this.metrics.recordMetric('workflow_duration', duration, {
         workflow_id: workflowId
       });
     }
   }
   ```

### 2. System Metrics

1. **Resource Metrics**
   ```typescript
   // libs/monitoring/src/lib/resource-metrics.ts
   export class ResourceMetrics {
     private readonly metrics: PerformanceMetrics;

     constructor(metrics: PerformanceMetrics) {
       this.metrics = metrics;
     }

     async recordCPUUsage(): Promise<void> {
       const usage = await this.getCPUUsage();
       this.metrics.recordMetric('cpu_usage', usage, {
         type: 'system'
       });
     }

     async recordMemoryUsage(): Promise<void> {
       const usage = await this.getMemoryUsage();
       this.metrics.recordMetric('memory_usage', usage, {
         type: 'system'
       });
     }

     async recordDiskUsage(): Promise<void> {
       const usage = await this.getDiskUsage();
       this.metrics.recordMetric('disk_usage', usage, {
         type: 'system'
       });
     }
   }
   ```

2. **Network Metrics**
   ```typescript
   // libs/monitoring/src/lib/network-metrics.ts
   export class NetworkMetrics {
     private readonly metrics: PerformanceMetrics;

     constructor(metrics: PerformanceMetrics) {
       this.metrics = metrics;
     }

     recordRequestLatency(endpoint: string, latency: number): void {
       this.metrics.recordMetric('request_latency', latency, {
         endpoint
       });
     }

     recordRequestCount(endpoint: string, status: number): void {
       this.metrics.recordMetric('request_count', 1, {
         endpoint,
         status: status.toString()
       });
     }

     recordBandwidth(bytes: number, direction: 'in' | 'out'): void {
       this.metrics.recordMetric('bandwidth', bytes, {
         direction
       });
     }
   }
   ```

## Logging

### 1. Application Logging

1. **Structured Logging**
   ```typescript
   // libs/monitoring/src/lib/logger.ts
   export class Logger {
     private readonly context: Record<string, any>;

     constructor(context: Record<string, any> = {}) {
       this.context = context;
     }

     info(message: string, data: Record<string, any> = {}): void {
       this.log('info', message, data);
     }

     error(message: string, error: Error, data: Record<string, any> = {}): void {
       this.log('error', message, {
         ...data,
         error: {
           message: error.message,
           stack: error.stack
         }
       });
     }

     private log(level: string, message: string, data: Record<string, any>): void {
       const logEntry = {
         timestamp: new Date().toISOString(),
         level,
         message,
         ...this.context,
         ...data
       };

       console.log(JSON.stringify(logEntry));
     }
   }
   ```

2. **Request Logging**
   ```typescript
   // libs/monitoring/src/lib/request-logger.ts
   export class RequestLogger {
     private readonly logger: Logger;

     constructor(logger: Logger) {
       this.logger = logger;
     }

     logRequest(req: Request, res: Response, duration: number): void {
       this.logger.info('Request completed', {
         method: req.method,
         url: req.url,
         status: res.statusCode,
         duration,
         userAgent: req.headers['user-agent'],
         ip: req.ip
       });
     }

     logError(req: Request, error: Error): void {
       this.logger.error('Request failed', error, {
         method: req.method,
         url: req.url,
         userAgent: req.headers['user-agent'],
         ip: req.ip
       });
     }
   }
   ```

### 2. System Logging

1. **System Events**
   ```typescript
   // libs/monitoring/src/lib/system-logger.ts
   export class SystemLogger {
     private readonly logger: Logger;

     constructor(logger: Logger) {
       this.logger = logger;
     }

     logStartup(): void {
       this.logger.info('System starting', {
         version: process.env.npm_package_version,
         nodeVersion: process.version,
         environment: process.env.NODE_ENV
       });
     }

     logShutdown(): void {
       this.logger.info('System shutting down', {
         uptime: process.uptime()
       });
     }

     logError(error: Error): void {
       this.logger.error('System error', error, {
         uptime: process.uptime()
       });
     }
   }
   ```

2. **Resource Events**
   ```typescript
   // libs/monitoring/src/lib/resource-logger.ts
   export class ResourceLogger {
     private readonly logger: Logger;

     constructor(logger: Logger) {
       this.logger = logger;
     }

     logResourceWarning(resource: string, usage: number, threshold: number): void {
       this.logger.info('Resource warning', {
         resource,
         usage,
         threshold
       });
     }

     logResourceError(resource: string, error: Error): void {
       this.logger.error('Resource error', error, {
         resource
       });
     }
   }
   ```

## Tracing

### 1. Request Tracing

1. **Trace Context**
   ```typescript
   // libs/monitoring/src/lib/trace-context.ts
   export class TraceContext {
     private readonly traceId: string;
     private readonly spanId: string;
     private readonly parentId?: string;

     constructor(traceId?: string, spanId?: string, parentId?: string) {
       this.traceId = traceId || this.generateId();
       this.spanId = spanId || this.generateId();
       this.parentId = parentId;
     }

     createChild(): TraceContext {
       return new TraceContext(this.traceId, this.generateId(), this.spanId);
     }

     private generateId(): string {
       return crypto.randomBytes(16).toString('hex');
     }
   }
   ```

2. **Span Management**
   ```typescript
   // libs/monitoring/src/lib/span-manager.ts
   export class SpanManager {
     private readonly spans: Map<string, Span> = new Map();

     startSpan(name: string, context: TraceContext): Span {
       const span = {
         name,
         traceId: context.traceId,
         spanId: context.spanId,
         parentId: context.parentId,
         startTime: Date.now(),
         events: []
       };

       this.spans.set(context.spanId, span);
       return span;
     }

     endSpan(spanId: string): Span {
       const span = this.spans.get(spanId);
       if (!span) {
         throw new Error(`Span ${spanId} not found`);
       }

       span.endTime = Date.now();
       span.duration = span.endTime - span.startTime;
       return span;
     }
   }
   ```

### 2. Distributed Tracing

1. **Trace Propagation**
   ```typescript
   // libs/monitoring/src/lib/trace-propagation.ts
   export class TracePropagation {
     private readonly context: TraceContext;

     constructor(context: TraceContext) {
       this.context = context;
     }

     injectHeaders(headers: Record<string, string>): void {
       headers['x-trace-id'] = this.context.traceId;
       headers['x-span-id'] = this.context.spanId;
       if (this.context.parentId) {
         headers['x-parent-id'] = this.context.parentId;
       }
     }

     extractHeaders(headers: Record<string, string>): TraceContext {
       return new TraceContext(
         headers['x-trace-id'],
         headers['x-span-id'],
         headers['x-parent-id']
       );
     }
   }
   ```

2. **Trace Collection**
   ```typescript
   // libs/monitoring/src/lib/trace-collector.ts
   export class TraceCollector {
     private readonly traces: Map<string, Trace> = new Map();

     addSpan(span: Span): void {
       const trace = this.traces.get(span.traceId) || {
         traceId: span.traceId,
         spans: []
       };

       trace.spans.push(span);
       this.traces.set(span.traceId, trace);
     }

     getTrace(traceId: string): Trace | undefined {
       return this.traces.get(traceId);
     }

     getTraces(): Trace[] {
       return Array.from(this.traces.values());
     }
   }
   ```

## Alerting

### 1. Alert Configuration

1. **Alert Rules**
   ```typescript
   // libs/monitoring/src/lib/alert-rules.ts
   export class AlertRules {
     private readonly rules: AlertRule[] = [];

     addRule(rule: AlertRule): void {
       this.rules.push(rule);
     }

     evaluate(metrics: Metric[]): Alert[] {
       return this.rules
         .map(rule => rule.evaluate(metrics))
         .filter(alert => alert !== null) as Alert[];
     }
   }
   ```

2. **Alert Notifications**
   ```typescript
   // libs/monitoring/src/lib/alert-notifier.ts
   export class AlertNotifier {
     private readonly notifiers: Notifier[];

     constructor(notifiers: Notifier[]) {
       this.notifiers = notifiers;
     }

     async notify(alert: Alert): Promise<void> {
       await Promise.all(
         this.notifiers.map(notifier => notifier.send(alert))
       );
     }
   }
   ```

### 2. Alert Management

1. **Alert State**
   ```typescript
   // libs/monitoring/src/lib/alert-state.ts
   export class AlertState {
     private readonly alerts: Map<string, Alert> = new Map();

     addAlert(alert: Alert): void {
       this.alerts.set(alert.id, alert);
     }

     resolveAlert(alertId: string): void {
       const alert = this.alerts.get(alertId);
       if (alert) {
         alert.status = 'resolved';
         alert.resolvedAt = new Date();
       }
     }

     getActiveAlerts(): Alert[] {
       return Array.from(this.alerts.values())
         .filter(alert => alert.status === 'active');
     }
   }
   ```

2. **Alert History**
   ```typescript
   // libs/monitoring/src/lib/alert-history.ts
   export class AlertHistory {
     private readonly history: Alert[] = [];

     addAlert(alert: Alert): void {
       this.history.push(alert);
     }

     getHistory(duration: number): Alert[] {
       const cutoff = Date.now() - duration;
       return this.history.filter(alert => alert.createdAt.getTime() > cutoff);
     }

     getAlertFrequency(duration: number): number {
       const history = this.getHistory(duration);
       return history.length / (duration / 1000 / 60); // alerts per minute
     }
   }
   ```

## What's Next

- [Tutorial: Performance Optimization](tutorial_performance.md)
- [Tutorial: Security Best Practices](tutorial_security.md)
- [Tutorial: Testing Strategies](tutorial_testing.md)

## Additional Resources

- [Operations Documentation](../OPERATIONS.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Deployment Documentation](../DEPLOYMENT.md) 