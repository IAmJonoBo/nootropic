// TODO: Implement critic agent types
export interface AnalysisResult {
  issues: Issue[];
  metrics: Metrics;
  suggestions: Suggestion[];
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: Severity;
  message: string;
  location: Location;
  fix?: Fix;
}

export interface Metrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  securityScore: number;
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  description: string;
  impact: Impact;
  effort: Effort;
}

export interface Location {
  file: string;
  line: number;
  column: number;
}

export interface Fix {
  description: string;
  changes: Change[];
}

export interface Change {
  type: ChangeType;
  line: number;
  content: string;
}

export interface TestResult {
  passed: boolean;
  coverage: Coverage;
  failures: TestFailure[];
}

export interface Coverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestFailure {
  test: string;
  message: string;
  stack?: string;
}

export enum IssueType {
  BUG = 'BUG',
  VULNERABILITY = 'VULNERABILITY',
  CODE_SMELL = 'CODE_SMELL',
  PERFORMANCE = 'PERFORMANCE'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SuggestionType {
  REFACTOR = 'REFACTOR',
  OPTIMIZE = 'OPTIMIZE',
  SECURITY = 'SECURITY',
  TEST = 'TEST'
}

export enum Impact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Effort {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum ChangeType {
  ADD = 'ADD',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE'
} 