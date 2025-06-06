// TODO: Implement critic agent interfaces
import { AnalysisResult, TestResult } from './types';

export interface CriticService {
  analyzeCode(code: string): Promise<AnalysisResult>;
  runTests(tests: TestSuite): Promise<TestResult>;
  applyFixes(issues: Issue[]): Promise<FixResult>;
}

export interface TestSuite {
  id: string;
  name: string;
  tests: Test[];
  config: TestConfig;
}

export interface Test {
  id: string;
  name: string;
  content: string;
  type: TestType;
}

export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
}

export interface FixResult {
  success: boolean;
  changes: Change[];
  errors?: Error[];
}

export interface Change {
  file: string;
  changes: FileChange[];
}

export interface FileChange {
  type: ChangeType;
  line: number;
  content: string;
}

export interface Error {
  code: string;
  message: string;
  stack?: string;
}

export enum TestType {
  UNIT = 'UNIT',
  INTEGRATION = 'INTEGRATION',
  E2E = 'E2E'
}

export enum ChangeType {
  ADD = 'ADD',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE'
} 