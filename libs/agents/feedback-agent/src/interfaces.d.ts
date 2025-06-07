import { Feedback, TrainingData, Preferences } from "./types";
export interface FeedbackService {
  collectFeedback(feedback: Feedback): Promise<void>;
  scheduleTraining(data: TrainingData): Promise<void>;
  updatePreferences(prefs: Preferences): Promise<void>;
}
export interface FeedbackConfig {
  minRating: number;
  maxFeedbackAge: number;
  trainingSchedule: TrainingSchedule;
}
export interface TrainingSchedule {
  frequency: string;
  batchSize: number;
  priority: Priority;
}
export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  distribution: RatingDistribution;
}
export interface RatingDistribution {
  excellent: number;
  good: number;
  neutral: number;
  poor: number;
}
export declare enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
