import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { z } from 'zod';
import { ShimiMemory } from './src/utils/context/shimiMemory.js';
export type ChunkingStrategy = 'fixed' | 'sentence' | 'paragraph' | 'semantic' | 'recursive' | 'agentic';
export interface ChunkingOptions {
    strategy: ChunkingStrategy;
    chunkSize?: number;
    overlap?: number;
    sentencesPerChunk?: number;
    paragraphsPerChunk?: number;
    semanticThreshold?: number;
    agenticTask?: string;
    hopeThreshold?: number;
}
export declare class ChunkingUtility implements Capability {
    readonly name = "ChunkingUtility";
    private shimi;
    constructor(options?: {
        shimi?: ShimiMemory;
    });
    static schema: z.ZodObject<{
        text: z.ZodString;
        options: z.ZodObject<{
            strategy: z.ZodEnum<["fixed", "sentence", "paragraph", "semantic", "recursive", "agentic"]>;
            chunkSize: z.ZodOptional<z.ZodNumber>;
            overlap: z.ZodOptional<z.ZodNumber>;
            sentencesPerChunk: z.ZodOptional<z.ZodNumber>;
            paragraphsPerChunk: z.ZodOptional<z.ZodNumber>;
            semanticThreshold: z.ZodOptional<z.ZodNumber>;
            agenticTask: z.ZodOptional<z.ZodString>;
            hopeThreshold: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        }, {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        options: {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        };
    }, {
        text: string;
        options: {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        };
    }>;
    chunk(text: string, options: ChunkingOptions): Promise<string[]>;
    fixedSizeChunking(text: string, chunkSize: number, overlap: number): string[];
    sentenceChunking(text: string, sentencesPerChunk: number, overlap: number): string[];
    paragraphChunking(text: string, paragraphsPerChunk: number, overlap: number): string[];
    semanticChunking(text: string, _threshold: number, overlap: number): Promise<string[]>;
    recursiveChunking(text: string, maxChunkSize: number, overlap: number): Promise<string[]>;
    agenticChunking(text: string, _agenticTask: string, overlap: number): Promise<string[]>;
    hopeMetric(_chunk: string): number;
    llmFilter(chunks: string[], _query: string): Promise<string[]>;
    storeChunksInShimi(chunks: string[]): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
declare const ChunkingUtilityCapability: {
    name: string;
    describe: () => CapabilityDescribe;
    schema: z.ZodObject<{
        text: z.ZodString;
        options: z.ZodObject<{
            strategy: z.ZodEnum<["fixed", "sentence", "paragraph", "semantic", "recursive", "agentic"]>;
            chunkSize: z.ZodOptional<z.ZodNumber>;
            overlap: z.ZodOptional<z.ZodNumber>;
            sentencesPerChunk: z.ZodOptional<z.ZodNumber>;
            paragraphsPerChunk: z.ZodOptional<z.ZodNumber>;
            semanticThreshold: z.ZodOptional<z.ZodNumber>;
            agenticTask: z.ZodOptional<z.ZodString>;
            hopeThreshold: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        }, {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        options: {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        };
    }, {
        text: string;
        options: {
            strategy: "fixed" | "recursive" | "semantic" | "sentence" | "paragraph" | "agentic";
            chunkSize?: number | undefined;
            overlap?: number | undefined;
            sentencesPerChunk?: number | undefined;
            paragraphsPerChunk?: number | undefined;
            semanticThreshold?: number | undefined;
            agenticTask?: string | undefined;
            hopeThreshold?: number | undefined;
        };
    }>;
};
export default ChunkingUtilityCapability;
