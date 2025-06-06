// TODO: Implement memory agent interfaces
import { Episode, KnowledgeUpdate, RetrievalResult } from './types';

export interface MemoryService {
  storeEpisode(episode: Episode): Promise<void>;
  retrieveSimilar(query: string, k: number): Promise<Episode[]>;
  updateKnowledge(update: KnowledgeUpdate): Promise<void>;
}

export interface MemoryConfig {
  maxEpisodes: number;
  embeddingModel: string;
  similarityThreshold: number;
  retentionPolicy: RetentionPolicy;
}

export interface RetentionPolicy {
  maxAge: number;
  maxSize: number;
  priority: Priority;
}

export interface MemoryStats {
  totalEpisodes: number;
  storageSize: number;
  lastUpdate: Date;
  performance: Performance;
}

export interface Performance {
  retrievalTime: number;
  storageTime: number;
  hitRate: number;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
} 