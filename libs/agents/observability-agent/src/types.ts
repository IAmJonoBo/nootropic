// TODO: Implement observability agent types
export interface Metric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
  metadata: MetricMetadata;
}

export interface MetricMetadata {
  type: MetricType;
  unit: string;
  description: string;
  aggregation: AggregationType;
}

export interface Log {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  context: LogContext;
  metadata: LogMetadata;
}

export interface LogContext {
  service: string;
  component: string;
  traceId: string;
  spanId: string;
}

export interface LogMetadata {
  source: string;
  tags: string[];
  correlation: string[];
}

export interface Trace {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  spans: Span[];
  metadata: TraceMetadata;
}

export interface Span {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  parentId?: string;
  attributes: Record<string, any>;
  events: Event[];
}

export interface Event {
  id: string;
  name: string;
  timestamp: Date;
  attributes: Record<string, any>;
}

export interface TraceMetadata {
  service: string;
  environment: string;
  version: string;
}

export enum MetricType {
  COUNTER = 'COUNTER',
  GAUGE = 'GAUGE',
  HISTOGRAM = 'HISTOGRAM',
  SUMMARY = 'SUMMARY'
}

export enum AggregationType {
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface Alert {
  id: string;
  name: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  status: 'active' | 'resolved';
  metadata: Record<string, any>;
} 