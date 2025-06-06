// TODO: Implement project manager agent types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: Task[];
  resources: Resource[];
  timeline: Timeline;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: number;
  assignee?: string;
  dependencies: string[];
  estimates: Estimate;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  capacity: number;
  allocation: Allocation[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  dependencies: Dependency[];
}

export interface Estimate {
  effort: number;
  duration: number;
  confidence: number;
}

export interface Allocation {
  taskId: string;
  startDate: Date;
  endDate: Date;
  percentage: number;
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  deliverables: string[];
}

export interface Dependency {
  from: string;
  to: string;
  type: DependencyType;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum ResourceType {
  HUMAN = 'HUMAN',
  MACHINE = 'MACHINE',
  TOOL = 'TOOL'
}

export enum DependencyType {
  FINISH_TO_START = 'FINISH_TO_START',
  START_TO_START = 'START_TO_START',
  FINISH_TO_FINISH = 'FINISH_TO_FINISH',
  START_TO_FINISH = 'START_TO_FINISH'
} 