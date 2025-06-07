export interface CodeResult {
  files: GeneratedFile[];
  metadata: CodeMetadata;
}
export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}
export interface CodeMetadata {
  complexity: number;
  dependencies: string[];
  estimatedTime: number;
}
export interface RefactorResult {
  changes: FileChange[];
  summary: string;
}
export interface FileChange {
  path: string;
  changes: Change[];
}
export interface Change {
  type: ChangeType;
  line: number;
  content: string;
}
export interface TestResult {
  tests: Test[];
  coverage: Coverage;
}
export interface Test {
  name: string;
  content: string;
  type: TestType;
}
export interface Coverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}
export declare enum ChangeType {
  ADD = "ADD",
  MODIFY = "MODIFY",
  DELETE = "DELETE",
}
export declare enum TestType {
  UNIT = "UNIT",
  INTEGRATION = "INTEGRATION",
  E2E = "E2E",
}
