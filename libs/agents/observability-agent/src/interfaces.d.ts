import { Metric, Log, Trace } from "./types";
export interface IObservabilityService {
  recordMetric(metric: Metric): Promise<void>;
  recordLog(log: Log): Promise<void>;
  recordTrace(trace: Trace): Promise<void>;
  getMetrics(query: MetricQuery): Promise<Metric[]>;
  getLogs(query: LogQuery): Promise<Log[]>;
  getTraces(query: TraceQuery): Promise<Trace[]>;
}
export interface MetricQuery {
  name?: string;
  labels?: Record<string, string>;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}
export interface LogQuery {
  level?: string;
  service?: string;
  component?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}
export interface TraceQuery {
  name?: string;
  service?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}
export interface IObservabilityConfig {
  metrics: {
    enabled: boolean;
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
  logs: {
    enabled: boolean;
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
  traces: {
    enabled: boolean;
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
}
