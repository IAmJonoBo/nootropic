import { EpisodeRecord, EpisodeMetadata } from "./types";
export declare class EpisodicStore {
  private readonly logger;
  private readonly chromaClient;
  private readonly collectionName;
  constructor();
  initialize(): Promise<void>;
  storeEpisode(episode: Omit<EpisodeRecord, "id">): Promise<string>;
  getEpisode(id: string): Promise<EpisodeRecord | null>;
  deleteEpisode(id: string): Promise<void>;
  archiveEpisodes(ids: string[]): Promise<void>;
  clusterEpisodes(episodes: EpisodeRecord[]): Promise<any[]>;
  queryMetadata(query: Partial<EpisodeMetadata>): Promise<EpisodeRecord[]>;
  healthCheck(): Promise<boolean>;
}
