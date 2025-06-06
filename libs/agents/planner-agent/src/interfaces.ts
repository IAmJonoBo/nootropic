// TODO: Implement planner agent interfaces
import { TaskGraph, Task } from './types';

export interface PlannerService {
  generatePlan(spec: ProjectSpec): Promise<TaskGraph>;
  replanSubtree(taskId: string, context: ReplanContext): Promise<TaskGraph>;
  validatePlan(graph: TaskGraph): Promise<ValidationResult>;
}

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  requirements: Requirement[];
  constraints: Constraint[];
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

export interface ReplanContext {
  taskId: string;
  reason: string;
  affectedTasks: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export enum ConstraintType {
  TIME = 'TIME',
  RESOURCE = 'RESOURCE',
  DEPENDENCY = 'DEPENDENCY'
}

export interface ValidationError {
  code: string;
  message: string;
  location?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
} 