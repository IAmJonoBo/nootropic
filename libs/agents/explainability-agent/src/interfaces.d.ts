import { Explanation, Visualization, Trace } from "./types";
export interface ExplainabilityService {
  generateExplanation(context: Context): Promise<Explanation>;
  createVisualization(data: any): Promise<Visualization>;
  traceExecution(process: Process): Promise<Trace>;
}
export interface Context {
  project: string;
  task: string;
  user: string;
  level: ExplanationLevel;
}
export interface Process {
  id: string;
  type: ProcessType;
  steps: ProcessStep[];
}
export interface ProcessStep {
  id: string;
  action: string;
  input: any;
  expectedOutput: any;
}
export interface ExplanationConfig {
  level: ExplanationLevel;
  format: ExplanationFormat;
  audience: Audience;
}
export interface VisualizationConfig {
  type: VisualizationType;
  style: Style;
  interactive: boolean;
}
export interface TraceConfig {
  level: TraceLevel;
  includeInput: boolean;
  includeOutput: boolean;
}
export declare enum ExplanationLevel {
  BASIC = "BASIC",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}
export declare enum ExplanationFormat {
  TEXT = "TEXT",
  MARKDOWN = "MARKDOWN",
  HTML = "HTML",
}
export declare enum Audience {
  USER = "USER",
  DEVELOPER = "DEVELOPER",
  EXPERT = "EXPERT",
}
export declare enum ProcessType {
  DECISION = "DECISION",
  WORKFLOW = "WORKFLOW",
  ERROR = "ERROR",
}
export declare enum TraceLevel {
  BASIC = "BASIC",
  DETAILED = "DETAILED",
  VERBOSE = "VERBOSE",
}
