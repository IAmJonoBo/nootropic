export interface VectorDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}
export declare class VectorStore {
  private readonly logger;
  private readonly client;
  private readonly collection;
  constructor();
  storeDocument(document: VectorDocument): Promise<void>;
  searchDocuments(
    query: string,
    options?: {
      limit?: number;
      filter?: Record<string, any>;
    },
  ): Promise<VectorDocument[]>;
  deleteDocument(id: string): Promise<void>;
  updateDocument(document: VectorDocument): Promise<void>;
  getDocument(id: string): Promise<VectorDocument | null>;
}
