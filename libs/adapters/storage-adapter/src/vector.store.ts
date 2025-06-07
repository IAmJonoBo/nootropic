import { Injectable } from '@nestjs/common';
import { Logger, AgentError } from '../../shared/src/logger.js';
import { ChromaClient } from 'chromadb';
import { StorageAdapter } from './storage-adapter.js';

export interface VectorDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

@Injectable()
export class VectorStore extends StorageAdapter {
  private readonly logger = new Logger(VectorStore.name);
  private readonly client: ChromaClient;
  private readonly collection: any;

  constructor() {
    super();
    const url = process.env.CHROMA_URL || 'http://localhost:8000';
    this.client = new ChromaClient({ path: url });
    this.collection = this.client.getOrCreateCollection({
      name: 'nootropic',
      metadata: { description: 'Nootropic vector store' }
    });
  }

  async storeDocument(document: VectorDocument): Promise<void> {
    try {
      this.logger.info('Storing document', { id: document.id });
      await this.collection.add({
        ids: [document.id],
        documents: [document.content],
        metadatas: [document.metadata || {}],
        embeddings: document.embedding ? [document.embedding] : undefined
      });
    } catch (error) {
      throw new AgentError('Failed to store document');
    }
  }

  async getDocument(id: string): Promise<VectorDocument | null> {
    try {
      this.logger.info('Getting document', { id });
      const result = await this.collection.get({ ids: [id] });
      if (!result || !result.documents.length) return null;
      return {
        id,
        content: result.documents[0],
        metadata: result.metadatas[0],
        embedding: result.embeddings?.[0]
      };
    } catch (error) {
      throw new AgentError('Failed to get document');
    }
  }

  async updateDocument(document: VectorDocument): Promise<void> {
    try {
      this.logger.info('Updating document', { id: document.id });
      await this.collection.update({
        ids: [document.id],
        documents: [document.content],
        metadatas: [document.metadata || {}],
        embeddings: document.embedding ? [document.embedding] : undefined
      });
    } catch (error) {
      throw new AgentError('Failed to update document');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      this.logger.info('Deleting document', { id });
      await this.collection.delete({ ids: [id] });
    } catch (error) {
      throw new AgentError('Failed to delete document');
    }
  }

  async searchDocuments(query: string, options: {
    limit?: number;
    filter?: Record<string, any>;
  } = {}): Promise<VectorDocument[]> {
    try {
      this.logger.info('Searching documents', { query, options });

      const results = await this.collection.query({
        queryTexts: [query],
        nResults: options.limit || 10,
        where: options.filter
      });

      return results.ids[0].map((id: string, index: number) => ({
        id,
        content: results.documents[0][index],
        metadata: results.metadatas[0][index],
        embedding: results.embeddings?.[0][index]
      }));
    } catch (error) {
      throw new AgentError('Failed to search documents');
    }
  }
} 