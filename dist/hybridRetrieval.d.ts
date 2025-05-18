import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
export type RetrievalStrategy = 'vector' | 'keyword' | 'graph' | 'hybrid';
export interface HybridRetrievalOptions {
    strategy: RetrievalStrategy;
    query: string;
    topK?: number;
    alpha?: number;
}
export declare class HybridRetrievalUtility implements Capability {
    readonly name = "HybridRetrievalUtility";
    retrieve(options: HybridRetrievalOptions): Promise<string[]>;
    vectorSearch(query: string, topK: number): Promise<string[]>;
    keywordSearch(query: string, topK: number): Promise<string[]>;
    graphSearch(query: string, topK: number): Promise<string[]>;
    hybridSearch(query: string, topK: number, alpha: number): Promise<string[]>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
export default HybridRetrievalUtility;
