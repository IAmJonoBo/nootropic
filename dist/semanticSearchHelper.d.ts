interface SemanticIndexEntry {
    file: string;
    line: number;
    text: string;
    embedding: number[];
    score?: number;
    source?: string;
    capability?: string;
}
declare function semanticSearch(query: string, topN?: number, opts?: {
    source?: string;
    capability?: string;
}): Promise<SemanticIndexEntry[]>;
export { semanticSearch };
