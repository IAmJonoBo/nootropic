// @ts-ignore
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { z } from 'zod';

export type ChunkingStrategy = 'fixed' | 'sentence' | 'paragraph' | 'semantic' | 'recursive' | 'agentic';

export interface ChunkingOptions {
  strategy: ChunkingStrategy;
  chunkSize?: number; // for fixed/recursive
  overlap?: number; // for overlap/sliding window
  sentencesPerChunk?: number; // for sentence-based
  paragraphsPerChunk?: number; // for paragraph-based
  semanticThreshold?: number; // for semantic
  agenticTask?: string; // for agentic
}

export class ChunkingUtility implements Capability {
  public readonly name = 'ChunkingUtility';

  static schema = z.object({
    text: z.string(),
    options: z.object({
      strategy: z.enum(['fixed', 'sentence', 'paragraph', 'semantic', 'recursive', 'agentic']),
      chunkSize: z.number().int().positive().optional(),
      overlap: z.number().int().nonnegative().optional(),
      sentencesPerChunk: z.number().int().positive().optional(),
      paragraphsPerChunk: z.number().int().positive().optional(),
      semanticThreshold: z.number().min(0).max(1).optional(),
      agenticTask: z.string().optional()
    })
  });

  async chunk(text: string, options: ChunkingOptions): Promise<string[]> {
    switch (options.strategy) {
      case 'fixed':
        return this.fixedSizeChunking(text, options.chunkSize ?? 200, options.overlap ?? 0);
      case 'sentence':
        return this.sentenceChunking(text, options.sentencesPerChunk ?? 3);
      case 'paragraph':
        return this.paragraphChunking(text, options.paragraphsPerChunk ?? 1);
      case 'semantic':
        return this.semanticChunking(text);
      case 'recursive':
        return this.recursiveChunking(text, options.chunkSize ?? 512, options.overlap ?? 0);
      case 'agentic':
        return this.agenticChunking(text);
      default:
        throw new Error('Unknown chunking strategy');
    }
  }

  fixedSizeChunking(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }
    return chunks;
  }

  sentenceChunking(text: string, sentencesPerChunk: number): string[] {
    // Simple sentence split (replace with NLP for production)
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
      const chunk = sentences.slice(i, i + sentencesPerChunk).join(' ');
      chunks.push(chunk);
    }
    return chunks;
  }

  paragraphChunking(text: string, paragraphsPerChunk: number): string[] {
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < paragraphs.length; i += paragraphsPerChunk) {
      const chunk = paragraphs.slice(i, i + paragraphsPerChunk).join('\n\n');
      chunks.push(chunk);
    }
    return chunks;
  }

  async semanticChunking(text: string): Promise<string[]> {
    // Stub: Replace with embedding-based semantic chunking
    // For now, fallback to sentence chunking
    return this.sentenceChunking(text, 3);
  }

  async recursiveChunking(text: string, maxChunkSize: number, overlap: number): Promise<string[]> {
    // Stub: Recursive chunking by section/paragraph/sentence
    // For now, fallback to fixed-size chunking
    return this.fixedSizeChunking(text, maxChunkSize, overlap);
  }

  async agenticChunking(text: string): Promise<string[]> {
    // Stub: Agentic chunking for task-specific segmentation
    // For now, fallback to sentence chunking
    return this.sentenceChunking(text, 2);
  }

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  describe(): CapabilityDescribe {
    return {
      name: 'ChunkingUtility',
      description: 'Modular chunking utility supporting fixed-size, sentence, paragraph, semantic, recursive, and agentic chunking strategies. Registry-driven and describe/health compliant.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://zilliz.com/learn/guide-to-chunking-strategies-for-rag',
      methods: [
        { name: 'chunk', signature: '(text: string, options: ChunkingOptions) => Promise<string[]>', description: 'Chunk text using the selected strategy.' },
        { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' },
        { name: 'describe', signature: '() => CapabilityDescribe', description: 'Describe this utility.' }
      ],
      usage: "import ChunkingUtility from 'nootropic/utils/context/chunking'; const util = new ChunkingUtility(); await util.chunk(text, { strategy: 'fixed', chunkSize: 200 });",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://zilliz.com/learn/guide-to-chunking-strategies-for-rag',
        'https://superlinked.com/vectorhub/articles/advanced-retrieval-augmented-generation',
        'https://arxiv.org/html/2404.01037v1'
      ],
      schema: ChunkingUtility.schema
    };
  }
}

const ChunkingUtilityCapability = {
  name: 'ChunkingUtility',
  describe: () => ChunkingUtility.prototype.describe(),
  schema: ChunkingUtility.schema
};

export default ChunkingUtilityCapability; 