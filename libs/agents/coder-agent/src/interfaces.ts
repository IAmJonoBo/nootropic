// TODO: Implement coder agent interfaces
import { CodeResult, RefactorResult, TestResult } from './types';

export interface CoderService {
  generateCode(task: Task, context: CodeContext): Promise<CodeResult>;
  refactorCode(file: string, instructions: string): Promise<RefactorResult>;
  generateTests(file: string, coverage: number): Promise<TestResult>;
}

export interface Task {
  id: string;
  description: string;
  requirements: Requirement[];
  constraints: Constraint[];
}

export interface CodeContext {
  projectRoot: string;
  dependencies: string[];
  config: CodeConfig;
}

export interface Requirement {
  id: string;
  description: string;
  priority: number;
}

export interface Constraint {
  id: string;
  description: string;
  type: ConstraintType;
}

export interface CodeConfig {
  language: string;
  framework?: string;
  style: CodeStyle;
  patterns: string[];
}

export interface CodeStyle {
  indentation: number;
  maxLineLength: number;
  namingConvention: string;
}

export enum ConstraintType {
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  MAINTAINABILITY = 'MAINTAINABILITY'
} 