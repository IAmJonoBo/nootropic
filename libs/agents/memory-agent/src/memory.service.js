var MemoryServiceImpl_1;
import { __decorate, __metadata } from "tslib";
import { Injectable, Logger } from "@nestjs/common";
import { AgentError } from "@nootropic/shared";
import { ChromaClient } from "chromadb";
let MemoryServiceImpl = (MemoryServiceImpl_1 = class MemoryServiceImpl {
  constructor() {
    this.logger = new Logger(MemoryServiceImpl_1.name);
    this.collectionName = "episodes";
    this.chromaClient = new ChromaClient();
  }
  async storeEpisode(episode) {
    // TODO: Implement episode storage logic
    throw new Error("Method not implemented.");
  }
  async retrieveSimilar(query, k) {
    // TODO: Implement similar episode retrieval logic
    throw new Error("Method not implemented.");
  }
  async updateKnowledge(update) {
    // TODO: Implement knowledge update logic
    throw new Error("Method not implemented.");
  }
  async pruneEpisodes() {
    try {
      this.logger.debug("Starting episode pruning");
      const report = {
        timestamp: new Date().toISOString(),
        episodesRemoved: [],
        episodesArchived: [],
        clustersCreated: 0,
        durationMs: 0,
      };
      const startTime = Date.now();
      // Get all episodes
      const episodes = await this.chromaClient
        .collection(this.collectionName)
        .get();
      // Group by project
      const projectGroups = episodes.metadatas.reduce((acc, metadata, i) => {
        const projectID = metadata.projectID;
        if (!acc[projectID]) {
          acc[projectID] = [];
        }
        acc[projectID].push({
          id: episodes.ids[i],
          metadata,
          embedding: episodes.embeddings[i],
        });
        return acc;
      }, {});
      // Process each project group
      for (const [projectID, projectEpisodes] of Object.entries(
        projectGroups,
      )) {
        // Cluster similar episodes
        const clusters = await this.clusterEpisodes(projectEpisodes);
        report.clustersCreated += clusters.length;
        // Archive old episodes
        const oldEpisodes = projectEpisodes.filter(
          (ep) =>
            Date.now() - new Date(ep.metadata.timestamp).getTime() >
            90 * 24 * 60 * 60 * 1000,
        );
        if (oldEpisodes.length > 0) {
          await this.archiveEpisodes(oldEpisodes.map((ep) => ep.id));
          report.episodesArchived.push(...oldEpisodes.map((ep) => ep.id));
        }
        // Remove archived episodes from ChromaDB
        if (report.episodesArchived.length > 0) {
          await this.chromaClient
            .collection(this.collectionName)
            .delete({ ids: report.episodesArchived });
        }
      }
      report.durationMs = Date.now() - startTime;
      this.logger.debug("Episode pruning completed", report);
      return report;
    } catch (error) {
      throw new AgentError("Failed to prune episodes", { cause: error });
    }
  }
  async computeEmbedding(text) {
    // TODO: Implement embedding computation using configured model
    // For now, return a dummy embedding
    return Array(1536)
      .fill(0)
      .map(() => Math.random());
  }
  async clusterEpisodes(episodes) {
    // TODO: Implement episode clustering
    // For now, return empty array
    return [];
  }
  async archiveEpisodes(ids) {
    // TODO: Implement episode archiving
    // For now, just log
    this.logger.debug("Archiving episodes", { ids });
  }
});
MemoryServiceImpl = MemoryServiceImpl_1 = __decorate(
  [Injectable(), __metadata("design:paramtypes", [])],
  MemoryServiceImpl,
);
export { MemoryServiceImpl };
//# sourceMappingURL=memory.service.js.map
