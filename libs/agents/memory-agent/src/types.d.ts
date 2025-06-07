export interface EpisodeMetadata {
  taskID: string;
  timestamp: string;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  generationOutcome: "accepted" | "fixed" | "failed";
  language: string;
  projectID: string;
  filesChanged: string[];
}
export interface EpisodeRecord {
  id: string;
  prompt: string;
  output: string;
  metadata: EpisodeMetadata;
  embedding?: number[];
  summary?: string;
}
export interface RetrievalQuery {
  queryPrompt: string;
  projectID?: string;
  languageFilter?: string;
  maxResults: number;
  minSimilarity?: number;
}
export interface PruneReport {
  timestamp: string;
  episodesRemoved: string[];
  episodesArchived: string[];
  clustersCreated: number;
  durationMs: number;
}
export interface Episode {
  id: string;
  timestamp: Date;
  type: EpisodeType;
  content: EpisodeContent;
  metadata: EpisodeMetadata;
}
export interface EpisodeContent {
  text: string;
  embeddings: number[];
  context: Context;
}
export interface Context {
  project: string;
  user: string;
  environment: string;
  session: string;
}
export interface KnowledgeUpdate {
  id: string;
  type: UpdateType;
  content: string;
  metadata: UpdateMetadata;
}
export interface UpdateMetadata {
  timestamp: Date;
  source: string;
  confidence: number;
}
export interface RetrievalResult {
  episodes: Episode[];
  relevance: number[];
  metadata: RetrievalMetadata;
}
export interface RetrievalMetadata {
  query: string;
  timestamp: Date;
  filters: Filter[];
}
export interface Filter {
  field: string;
  value: string;
  operator: FilterOperator;
}
export declare enum EpisodeType {
  TASK = "TASK",
  SOLUTION = "SOLUTION",
  FEEDBACK = "FEEDBACK",
  ERROR = "ERROR",
}
export declare enum UpdateType {
  ADD = "ADD",
  MODIFY = "MODIFY",
  DELETE = "DELETE",
}
export declare enum FilterOperator {
  EQUALS = "EQUALS",
  CONTAINS = "CONTAINS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
}
