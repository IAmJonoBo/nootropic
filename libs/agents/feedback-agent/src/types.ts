// TODO: Implement feedback agent types
export interface Feedback {
  id: string;
  type: FeedbackType;
  content: string;
  rating: number;
  metadata: FeedbackMetadata;
}

export interface FeedbackMetadata {
  timestamp: Date;
  user: string;
  context: Context;
  tags: string[];
}

export interface Context {
  project: string;
  task: string;
  session: string;
}

export interface TrainingData {
  id: string;
  type: TrainingType;
  content: string;
  metadata: TrainingMetadata;
}

export interface TrainingMetadata {
  timestamp: Date;
  source: string;
  quality: number;
}

export interface Preferences {
  id: string;
  user: string;
  settings: PreferenceSettings;
  history: PreferenceHistory[];
}

export interface PreferenceSettings {
  model: string;
  parameters: Record<string, any>;
  constraints: Constraint[];
}

export interface PreferenceHistory {
  timestamp: Date;
  changes: PreferenceChange[];
}

export interface PreferenceChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  value: any;
}

export enum FeedbackType {
  CODE = 'CODE',
  DOCUMENTATION = 'DOCUMENTATION',
  UI = 'UI',
  PERFORMANCE = 'PERFORMANCE'
}

export enum TrainingType {
  CODE = 'CODE',
  DOCUMENTATION = 'DOCUMENTATION',
  CONVERSATION = 'CONVERSATION'
}

export enum ConstraintType {
  MODEL = 'MODEL',
  PARAMETER = 'PARAMETER',
  RESOURCE = 'RESOURCE'
} 