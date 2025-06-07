export interface Analysis {
  problem: Problem;
  context: Context;
  reasoning: Reasoning[];
  conclusions: Conclusion[];
}
export interface Problem {
  id: string;
  description: string;
  constraints: Constraint[];
  goals: Goal[];
}
export interface Context {
  domain: string;
  assumptions: Assumption[];
  facts: Fact[];
  rules: Rule[];
}
export interface Reasoning {
  id: string;
  type: ReasoningType;
  steps: Step[];
  confidence: number;
}
export interface Conclusion {
  id: string;
  statement: string;
  confidence: number;
  evidence: Evidence[];
}
export interface Constraint {
  id: string;
  description: string;
  type: ConstraintType;
}
export interface Goal {
  id: string;
  description: string;
  priority: number;
}
export interface Assumption {
  id: string;
  statement: string;
  confidence: number;
}
export interface Fact {
  id: string;
  statement: string;
  source: string;
}
export interface Rule {
  id: string;
  condition: string;
  action: string;
}
export interface Step {
  id: string;
  type: StepType;
  content: string;
  justification: string;
}
export interface Evidence {
  id: string;
  type: EvidenceType;
  content: string;
  source: string;
}
export declare enum ReasoningType {
  DEDUCTIVE = "DEDUCTIVE",
  INDUCTIVE = "INDUCTIVE",
  ABDUCTIVE = "ABDUCTIVE",
}
export declare enum ConstraintType {
  TIME = "TIME",
  RESOURCE = "RESOURCE",
  DEPENDENCY = "DEPENDENCY",
}
export declare enum StepType {
  PREMISE = "PREMISE",
  INFERENCE = "INFERENCE",
  CONCLUSION = "CONCLUSION",
}
export declare enum EvidenceType {
  FACT = "FACT",
  RULE = "RULE",
  OBSERVATION = "OBSERVATION",
}
