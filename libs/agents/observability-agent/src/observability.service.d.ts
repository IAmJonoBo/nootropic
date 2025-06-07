import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
import { ObservabilityAdapter } from "@nootropic/adapters/observability-adapter";
import { Metric, Trace, Span, Alert } from "./types";
import { IObservabilityService } from "./interfaces";
export declare class ObservabilityService implements IObservabilityService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly observabilityAdapter;
  private readonly logger;
  constructor(
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
    observabilityAdapter: ObservabilityAdapter,
  );
  recordMetric(metric: Omit<Metric, "timestamp">): Promise<void>;
  startTrace(name: string, metadata?: Record<string, any>): Promise<Trace>;
  endTrace(traceId: string, status?: "success" | "error"): Promise<void>;
  startSpan(
    traceId: string,
    name: string,
    metadata?: Record<string, any>,
  ): Promise<Span>;
  endSpan(spanId: string, status?: "success" | "error"): Promise<void>;
  createAlert(alert: Omit<Alert, "id" | "timestamp">): Promise<Alert>;
  resolveAlert(alertId: string): Promise<void>;
  getMetrics(query: import("./interfaces").MetricQuery): Promise<Metric[]>;
  getTraces(query: import("./interfaces").TraceQuery): Promise<Trace[]>;
  getAlerts(params: {
    severity?: string;
    status?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<Alert[]>;
  analyzePerformance(params: {
    startTime: number;
    endTime: number;
    metrics?: string[];
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }>;
  private buildAnalysisPrompt;
  private parseAnalysisResponse;
}
