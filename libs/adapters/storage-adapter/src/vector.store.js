var VectorStore_1;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
import { ChromaClient } from "chromadb";
let VectorStore = (VectorStore_1 = class VectorStore {
  constructor() {
    this.logger = new Logger(VectorStore_1.name);
    const url = process.env.CHROMA_URL || "http://localhost:8000";
    this.client = new ChromaClient({ path: url });
    this.collection = this.client.getOrCreateCollection({
      name: "nootropic",
      metadata: { description: "Nootropic vector store" },
    });
  }
  async storeDocument(document) {
    try {
      this.logger.info("Storing document", { id: document.id });
      await this.collection.add({
        ids: [document.id],
        documents: [document.content],
        metadatas: [document.metadata || {}],
        embeddings: document.embedding ? [document.embedding] : undefined,
      });
    } catch (error) {
      throw new AgentError("Failed to store document", { cause: error });
    }
  }
  async searchDocuments(query, options = {}) {
    try {
      this.logger.info("Searching documents", { query, options });
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: options.limit || 10,
        where: options.filter,
      });
      return results.ids[0].map((id, index) => ({
        id,
        content: results.documents[0][index],
        metadata: results.metadatas[0][index],
        embedding: results.embeddings?.[0][index],
      }));
    } catch (error) {
      throw new AgentError("Failed to search documents", { cause: error });
    }
  }
  async deleteDocument(id) {
    try {
      this.logger.info("Deleting document", { id });
      await this.collection.delete({
        ids: [id],
      });
    } catch (error) {
      throw new AgentError("Failed to delete document", { cause: error });
    }
  }
  async updateDocument(document) {
    try {
      this.logger.info("Updating document", { id: document.id });
      await this.collection.update({
        ids: [document.id],
        documents: [document.content],
        metadatas: [document.metadata || {}],
        embeddings: document.embedding ? [document.embedding] : undefined,
      });
    } catch (error) {
      throw new AgentError("Failed to update document", { cause: error });
    }
  }
  async getDocument(id) {
    try {
      this.logger.info("Getting document", { id });
      const results = await this.collection.get({
        ids: [id],
      });
      if (!results.ids[0].length) {
        return null;
      }
      return {
        id: results.ids[0][0],
        content: results.documents[0][0],
        metadata: results.metadatas[0][0],
        embedding: results.embeddings?.[0][0],
      };
    } catch (error) {
      throw new AgentError("Failed to get document", { cause: error });
    }
  }
});
VectorStore = VectorStore_1 = __decorate(
  [Injectable(), __metadata("design:paramtypes", [])],
  VectorStore,
);
export { VectorStore };
//# sourceMappingURL=vector.store.js.map
