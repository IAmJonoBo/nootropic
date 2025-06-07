export abstract class StorageAdapter {
  abstract storeDocument(document: any): Promise<void>;
  abstract getDocument(id: string): Promise<any>;
  abstract updateDocument(document: any): Promise<void>;
  abstract deleteDocument(id: string): Promise<void>;
  // TODO: Add more abstract methods as needed
} 