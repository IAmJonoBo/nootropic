import { Analysis, Problem, Context, Reasoning } from "./types";
export interface ReasoningService {
  analyzeProblem(problem: Problem): Promise<Analysis>;
  proposeSolution(context: Context): Promise<Solution>;
  validateReasoning(reasoning: Reasoning): Promise<Validation>;
}
export interface Solution {
  id: string;
  description: string;
  steps: SolutionStep[];
  confidence: number;
  alternatives: Alternative[];
}
export interface SolutionStep {
  id: string;
  action: string;
  rationale: string;
  dependencies: string[];
}
export interface Alternative {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  confidence: number;
}
export interface Validation {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: ValidationSuggestion[];
}
export interface ValidationIssue {
  id: string;
  type: ValidationIssueType;
  description: string;
  severity: Severity;
}
export interface ValidationSuggestion {
  id: string;
  description: string;
  impact: Impact;
  effort: Effort;
}
export declare enum ValidationIssueType {
  LOGICAL = "LOGICAL",
  CONSISTENCY = "CONSISTENCY",
  COMPLETENESS = "COMPLETENESS",
}
export declare enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}
export declare enum Impact {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
export declare enum Effort {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
