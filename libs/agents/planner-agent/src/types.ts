// TODO: Implement planner agent types
export interface TaskGraph {
  id: string;
  tasks: Task[];
  dependencies: Dependency[];
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: number;
}

export interface Dependency {
  from: string;
  to: string;
  type: DependencyType;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum DependencyType {
  BLOCKS = 'BLOCKS',
  REQUIRES = 'REQUIRES',
  RELATED = 'RELATED'
} 