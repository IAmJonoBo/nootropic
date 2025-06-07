import { PruneReport } from "./types";
import { MemoryService } from "./interfaces";
import { Episode, KnowledgeUpdate } from "./types";
export declare class MemoryServiceImpl implements MemoryService {
  private readonly logger;
  private readonly chromaClient;
  private readonly collectionName;
  constructor();
  storeEpisode(episode: Episode): Promise<void>;
  retrieveSimilar(query: string, k: number): Promise<Episode[]>;
  updateKnowledge(update: KnowledgeUpdate): Promise<void>;
  pruneEpisodes(): Promise<PruneReport>;
  private computeEmbedding;
  private clusterEpisodes;
  private archiveEpisodes;
}
