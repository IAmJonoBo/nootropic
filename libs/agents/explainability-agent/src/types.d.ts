export interface Explanation {
  id: string;
  type: ExplanationType;
  content: string;
  metadata: ExplanationMetadata;
  confidence: number;
}
export interface ExplanationMetadata {
  timestamp: Date;
  source: string;
  context: Context;
  tags: string[];
}
export interface Context {
  project: string;
  task: string;
  user: string;
}
export interface Visualization {
  id: string;
  type: VisualizationType;
  data: any;
  config: VisualizationConfig;
}
export interface VisualizationConfig {
  format: string;
  style: Style;
  interactive: boolean;
}
export interface Style {
  theme: string;
  colors: string[];
  layout: Layout;
}
export interface Layout {
  width: number;
  height: number;
  margin: Margin;
}
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface Trace {
  id: string;
  type: TraceType;
  steps: Step[];
  metadata: TraceMetadata;
}
export interface Step {
  id: string;
  action: string;
  input: any;
  output: any;
  timestamp: Date;
}
export interface TraceMetadata {
  startTime: Date;
  endTime: Date;
  duration: number;
  status: TraceStatus;
}
export declare enum ExplanationType {
  DECISION = "DECISION",
  PROCESS = "PROCESS",
  OUTCOME = "OUTCOME",
}
export declare enum VisualizationType {
  GRAPH = "GRAPH",
  CHART = "CHART",
  DIAGRAM = "DIAGRAM",
}
export declare enum TraceType {
  EXECUTION = "EXECUTION",
  DECISION = "DECISION",
  ERROR = "ERROR",
}
export declare enum TraceStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  INCOMPLETE = "INCOMPLETE",
}
