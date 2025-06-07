import { Injectable } from '@nestjs/common';
import { Logger } from '@nootropic/shared';
import { AgentError } from '@nootropic/runtime';
import { ModelAdapter } from '@nootropic/adapters/model-adapter';
import { StorageAdapter } from '@nootropic/adapters/storage-adapter';
import { ProjectContextService } from '@nootropic/context';
import { ObservabilityAdapter } from '@nootropic/adapters/observability-adapter';
import { Metric, Trace, Span, Alert } from './types';
import { IObservabilityService } from './interfaces';

@Injectable()
export class ObservabilityService implements IObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    private readonly modelAdapter: ModelAdapter,
    private readonly storageAdapter: StorageAdapter,
    private readonly projectContext: ProjectContextService,
    private readonly observabilityAdapter: ObservabilityAdapter
  ) {}

  async recordMetric(metric: Omit<Metric, 'timestamp'>): Promise<void> {
    try {
      this.logger.debug('Recording metric', { name: metric.name });
      await this.observabilityAdapter.recordMetric({
        ...metric,
        timestamp: new Date()
      });
    } catch (error) {
      throw new AgentError('Failed to record metric', { cause: error });
    }
  }

  async startTrace(name: string, metadata: Record<string, any> = {}): Promise<Trace> {
    try {
      this.logger.debug('Starting trace', { name });
      const trace = await this.observabilityAdapter.startTrace(name, metadata);
      return trace;
    } catch (error) {
      throw new AgentError('Failed to start trace', { cause: error });
    }
  }

  async endTrace(traceId: string, status: 'success' | 'error' = 'success'): Promise<void> {
    try {
      this.logger.debug('Ending trace', { traceId, status });
      await this.observabilityAdapter.endTrace(traceId, status);
    } catch (error) {
      throw new AgentError('Failed to end trace', { cause: error });
    }
  }

  async startSpan(traceId: string, name: string, metadata: Record<string, any> = {}): Promise<Span> {
    try {
      this.logger.debug('Starting span', { traceId, name });
      const span = await this.observabilityAdapter.startSpan(traceId, name, metadata);
      return span;
    } catch (error) {
      throw new AgentError('Failed to start span', { cause: error });
    }
  }

  async endSpan(spanId: string, status: 'success' | 'error' = 'success'): Promise<void> {
    try {
      this.logger.debug('Ending span', { spanId, status });
      await this.observabilityAdapter.endSpan(spanId, status);
    } catch (error) {
      throw new AgentError('Failed to end span', { cause: error });
    }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    try {
      this.logger.info('Creating alert', { name: alert.name, severity: alert.severity });
      const newAlert = await this.observabilityAdapter.createAlert({
        ...alert,
        id: `alert_${Date.now()}`,
        timestamp: new Date()
      });

      // Store alert in storage for persistence
      await this.storageAdapter.storeDocument({
        id: newAlert.id,
        content: JSON.stringify(newAlert),
        metadata: {
          type: 'alert',
          severity: newAlert.severity,
          status: newAlert.status,
          timestamp: newAlert.timestamp
        }
      });

      return newAlert;
    } catch (error) {
      throw new AgentError('Failed to create alert', { cause: error });
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      this.logger.info('Resolving alert', { alertId });
      await this.observabilityAdapter.resolveAlert(alertId);

      // Update alert status in storage
      const alert = await this.storageAdapter.getDocument(alertId);
      if (alert) {
        const updatedAlert = { ...JSON.parse(alert.content), status: 'resolved' };
        await this.storageAdapter.updateDocument(alertId, {
          content: JSON.stringify(updatedAlert),
          metadata: {
            ...alert.metadata,
            status: 'resolved'
          }
        });
      }
    } catch (error) {
      throw new AgentError('Failed to resolve alert', { cause: error });
    }
  }

  async getMetrics(query: import('./interfaces').MetricQuery): Promise<Metric[]> {
    try {
      this.logger.debug('Getting metrics', { query });
      return await this.observabilityAdapter.getMetrics(query);
    } catch (error) {
      throw new AgentError('Failed to get metrics', { cause: error });
    }
  }

  async getTraces(query: import('./interfaces').TraceQuery): Promise<Trace[]> {
    try {
      this.logger.debug('Getting traces', { query });
      return await this.observabilityAdapter.getTraces(query);
    } catch (error) {
      throw new AgentError('Failed to get traces', { cause: error });
    }
  }

  async getAlerts(params: {
    severity?: string;
    status?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<Alert[]> {
    try {
      this.logger.debug('Getting alerts', { params });
      return await this.observabilityAdapter.getAlerts(params);
    } catch (error) {
      throw new AgentError('Failed to get alerts', { cause: error });
    }
  }

  async analyzePerformance(params: {
    startTime: number;
    endTime: number;
    metrics?: string[];
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      this.logger.info('Analyzing performance', { params });

      // Get relevant metrics
      const metrics = await this.getMetrics({
        startTime: params.startTime,
        endTime: params.endTime,
        name: params.metrics ? { $in: params.metrics } : undefined
      });

      // Get relevant traces
      const traces = await this.getTraces({
        startTime: params.startTime,
        endTime: params.endTime
      });

      // Generate analysis using model
      const prompt = this.buildAnalysisPrompt(metrics, traces);
      const response = await this.modelAdapter.generateText(prompt, {
        provider: 'ollama',
        model: 'mistral',
        temperature: 0.3
      });

      // Parse analysis results
      const analysis = this.parseAnalysisResponse(response.text);

      return analysis;
    } catch (error) {
      throw new AgentError('Failed to analyze performance', { cause: error });
    }
  }

  private buildAnalysisPrompt(metrics: Metric[], traces: Trace[]): string {
    return `
      Analyze the following performance data:
      
      Metrics:
      ${metrics.map(m => `
        Name: ${m.name}
        Value: ${m.value}
        Type: ${m.type}
        Labels: ${JSON.stringify(m.labels)}
      `).join('\n')}
      
      Traces:
      ${traces.map(t => `
        Name: ${t.name}
        Duration: ${t.duration}ms
        Status: ${t.status}
        Spans: ${t.spans.length}
      `).join('\n')}
      
      Please provide:
      1. A summary of the performance
      2. Key insights
      3. Specific recommendations
      
      Format the response as:
      SUMMARY:
      // Summary here
      
      INSIGHTS:
      // List of insights
      
      RECOMMENDATIONS:
      // List of recommendations
    `;
  }

  private parseAnalysisResponse(response: string): {
    summary: string;
    insights: string[];
    recommendations: string[];
  } {
    try {
      const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=INSIGHTS:|RECOMMENDATIONS:|$)/);
      const insightsMatch = response.match(/INSIGHTS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/);
      const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/);

      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      const insights = insightsMatch ? insightsMatch[1].trim().split('\n').filter(Boolean) : [];
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim().split('\n').filter(Boolean) : [];

      return {
        summary,
        insights,
        recommendations
      };
    } catch (error) {
      throw new AgentError('Failed to parse analysis response', { cause: error });
    }
  }
} 