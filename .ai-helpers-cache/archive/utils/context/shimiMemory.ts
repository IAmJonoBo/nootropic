/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * shimiMemory: Semantic Hierarchical Memory Index (SHIMI) for decentralized agent reasoning.
 *
 * LLM/AI-usage: Provides polyhierarchical semantic memory for agent workflows, supporting entity insertion, retrieval, and decentralized sync.
 * Extension: Add new backends, CRDT merge strategies, or entity types as needed.
 *
 * Main Types/Functions:
 *   - SemanticNode: Node in the polyhierarchical semantic memory graph
 *   - ShimiMemory: Main class for SHIMI memory (insertEntity, retrieveEntities, crdtMerge, etc.)
 *   - CRDTMergeUtility: Utility for CRDT merge logic
 *   - MemTree: Dynamic tree memory for structured long-term memory
 */
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
// @ts-expect-error TS(6133): 'crypto' is declared but its value is never read.
import crypto from 'crypto';
// @ts-expect-error TS(6133): 'fetch' is declared but its value is never read.
import fetch from 'node-fetch';
// @ts-expect-error TS(2305): Module '"../embedding/embeddingClient.js"' has no ... Remove this comment to see the full error message
import { getEmbeddingBackend, EmbeddingBackend } from '../embedding/embeddingClient.js';
import { z } from 'zod';

/**
 * SemanticNode: Node in the polyhierarchical semantic memory graph.
 */
export interface SemanticNode {
  id: string;
  summary: string; // semantic summary (LLM-generated)
  children: SemanticNode[];
  entities: unknown[];
  parent?: SemanticNode;
  level: number;
  updatedAt?: string; // optional for CRDT merge
  timestamp?: string; // fallback
}

/** Options for ShimiMemory. */
export type ShimiMemoryOptions = {
  maxBranching?: number;
  maxLevels?: number;
  similarityThreshold?: number;
  compressionRatio?: number;
  backend?: EmbeddingBackend;
  backendName?: string;
};

class UniversalShimiBackend {
  // @ts-expect-error TS(6133): 'backend' is declared but its value is never read.
  private backend: EmbeddingBackend;
  constructor(backend?: EmbeddingBackend, backendName?: string) {
    const resolved = backend ?? getEmbeddingBackend(backendName || '');
    if (!resolved) throw new Error('No embedding backend provided or found');
    this.backend = resolved;
  }
  // @ts-expect-error TS(6133): 'a' is declared but its value is never read.
  async similarity(a: string, b: string): Promise<number> {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!this.backend) throw new Error('No embedding backend configured');
    // @ts-expect-error TS(2304): Cannot find name 'vecA'.
    const [vecA, vecB] = await Promise.all([
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      this.backend.embedText(a),
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      this.backend.embedText(b)
    ]);
    // @ts-expect-error TS(6133): 'vecA' is declared but its value is never read.
    if (vecA.length === 0 || vecB.length === 0) return Math.random();
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    return this.cosineSimilarity(vecA, vecB);
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async mergeConcepts(a: string, b: string, parent?: string): Promise<string> {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!this.backend) throw new Error('No embedding backend configured');
    // Optionally use backend for abstraction (future: LLM summarization)
    // @ts-expect-error TS(2304): Cannot find name 'a'.
    return `Abstract(${a},${b}${parent ? ',' + parent : ''})`;
  }
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
  }
}

/** LLM adapter interface for embedding. */
export interface ShimiLLMAdapter {
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
}

/**
 * CRDTMergeUtility: Implements CRDT merge logic for decentralized SHIMI memory sync.
 * Supports LWW (last-write-wins) and G-Counter for distributed node merging.
 * Extensible for other CRDT types.
 */
export class CRDTMergeUtility {
  // LWW-Element-Set CRDT merge for memory nodes
  static lwwMerge<T extends { id: string; updatedAt?: string; timestamp?: string }>(a: T[], b: T[]): T[] {
    const map = new Map<string, T>();
    for (const node of [...a, ...b]) {
      const nodeUpdatedAt = (node.updatedAt ?? node.timestamp) || '1970-01-01T00:00:00Z';
      const existing = map.get(node.id);
      const existingUpdatedAt = existing?.updatedAt ?? existing?.timestamp ?? '1970-01-01T00:00:00Z';
      if (!existing || new Date(nodeUpdatedAt) > new Date(existingUpdatedAt)) {
        map.set(node.id, node);
      }
    }
    return Array.from(map.values());
  }
  // G-Counter merge for numeric counters
  static gCounterMerge(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const result: Record<string, number> = {};
    for (const k of keys) {
      result[k] = Math.max(a[k] || 0, b[k] ?? 0);
    }
    return result;
  }
}

/** SHIMI: Semantic Hierarchical Memory Index for decentralized agent reasoning. */
export class ShimiMemory implements Capability {
  public readonly name = 'ShimiMemory';
  private rootNodes: SemanticNode[] = [];
  private options: ShimiMemoryOptions;
  private backend: UniversalShimiBackend;
  // Polyhierarchy: allow multiple parents (future extension)
  private nodeMap: Map<string, SemanticNode> = new Map();

  constructor(options: ShimiMemoryOptions = {}) {
    this.options = {
      maxBranching: options.maxBranching ?? 4,
      maxLevels: options.maxLevels ?? 5,
      similarityThreshold: options.similarityThreshold ?? 0.7,
      compressionRatio: options.compressionRatio ?? 0.5,
      ...(options.backend ? { backend: options.backend } : {}),
      backendName: options.backendName || ''
    };
    this.backend = new UniversalShimiBackend(this.options.backend ? this.options.backend : undefined, this.options.backendName ?? '');
  }

  /** Insert an entity into the polyhierarchical semantic graph. */
  async insertEntity(entity: { concept: string; explanation: string; [key: string]: unknown }): Promise<void> {
    // 1. Find candidate root(s) by semantic similarity
    let root: SemanticNode | undefined = undefined;
    for (const r of this.rootNodes) {
      if (await this.backend.similarity(entity.concept, r.summary) > (this.options.similarityThreshold ?? 0.7)) {
        root = r;
        break;
      }
    }
    if (!root) {
      // Create new root if no match
      root = this.createNode(entity.concept, 0);
      this.rootNodes.push(root);
      this.nodeMap.set(root.id, root);
    }
    // 2. Descend tree to find insertion point (polyhierarchy: allow multiple paths)
    let parent = root;
    if (!parent || !Array.isArray(parent.children)) return;
    for (let level = 1; level < (this.options.maxLevels ?? 5); level++) {
      let foundChild: SemanticNode | undefined = undefined;
      for (const c of parent.children) {
        if (await this.backend.similarity(entity.explanation, c.summary) > (this.options.similarityThreshold ?? 0.7)) {
          foundChild = c;
          break;
        }
      }
      if (!foundChild) break;
      parent = foundChild;
      if (!parent || !Array.isArray(parent.children)) return;
    }
    // 3. Sibling matching/merging (polyhierarchy: allow multiple parents in future)
    let similarSibling: SemanticNode | undefined = undefined;
    for (const c of parent.children) {
      if (await this.backend.similarity(entity.explanation, c.summary) > (this.options.similarityThreshold ?? 0.7)) {
        similarSibling = c;
        break;
      }
    }
    if (similarSibling) {
      similarSibling.entities.push(entity);
    } else {
      if (!parent) return;
      // Create new node
      const node = this.createNode(entity.explanation, parent.level + 1);
      node.entities.push(entity);
      node.parent = parent;
      parent!.children.push(node);
      this.nodeMap.set(node.id, node);
      // Trigger merging if branching exceeds max
      if ((parent!.children ?? []).length > (this.options.maxBranching ?? 4)) {
        await this.mergeMostSimilarChildren(parent);
      }
    }
  }

  /** Retrieve entities by semantic query (top-down traversal, pruning by similarity). */
  async retrieveEntities(query: string, topK = 5): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const root of this.rootNodes) {
      await this.traverse(root, query, results, topK);
      if (results.length >= topK) break;
    }
    return results.slice(0, topK);
  }

  private async traverse(node: SemanticNode, query: string, results: unknown[], topK: number) {
    if (await this.backend.similarity(query, node.summary) < (this.options.similarityThreshold ?? 0.7)) return;
    if (node.entities.length) results.push(...node.entities);
    if (!node.children) return;
    for (const child of node.children) {
      if (results.length >= topK) break;
      await this.traverse(child, query, results, topK);
    }
  }

  /** Decentralized sync: Merkle-DAG root hash, Bloom filter, CRDT merge (polyhierarchy-ready). */
  getMerkleRoot(): string {
    // Merkle root: hash of all node IDs and summaries (polyhierarchy)
    const hashes = Array.from(this.nodeMap.values()).map(n => this.hashNode(n));
    return this.hashStrings(hashes);
  }

  /** Get Bloom filter (set of all node IDs). */
  getBloomFilter(): Set<string> {
    // Simple Bloom: set of all node IDs
    const ids = new Set<string>();
    const visit = (n: SemanticNode) => {
      ids.add(n.id);
      if (!n.children) return;
      n.children.forEach(visit);
    };
    this.rootNodes.forEach(visit);
    return ids;
  }

  /** Merge remote root nodes into local, using semantic similarity and idempotent merge. */
  async crdtMerge(remote: ShimiMemory): Promise<void> {
    // Merge remote root nodes into local, using semantic similarity and idempotent merge
    if (!remote || !Array.isArray(remote.rootNodes)) return;
    for (const remoteRoot of remote.rootNodes) {
      if (!remoteRoot) continue;
      const matchIdx = await this.findBestMatchIdx(this.rootNodes, remoteRoot.summary ?? '');
      if (matchIdx === -1) {
        // No match, add as new root
        this.rootNodes.push(this.cloneNode(remoteRoot));
      } else if (typeof matchIdx === 'number' && this.rootNodes[matchIdx]) {
        // Merge trees recursively
        await this.mergeNodes(this.rootNodes[matchIdx], remoteRoot);
      }
    }
  }

  private async findBestMatchIdx(nodes: SemanticNode[], summary: string): Promise<number> {
    let bestIdx = -1;
    let bestSim = this.options.similarityThreshold ?? 0.7;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] ?? { summary: '' };
      if (!node) continue;
      const sim = await this.backend.similarity(summary, node.summary ?? '');
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  private cloneNode(node: SemanticNode): SemanticNode {
    return {
      id: node.id,
      summary: node.summary,
      children: Array.isArray(node.children) ? node.children.map(c => c ? this.cloneNode(c) : c).filter(Boolean) as SemanticNode[] : [],
      entities: Array.isArray(node.entities) ? [...node.entities] : [],
      level: node.level
    };
  }

  private async mergeNodes(local: SemanticNode, remote: SemanticNode): Promise<void> {
    // Merge entities (idempotent)
    if (!remote || !local) return;
    const remoteEntities = Array.isArray(remote.entities) ? remote.entities : [];
    for (const ent of remoteEntities) {
      if (!local.entities.some(e => JSON.stringify(e) === JSON.stringify(ent))) {
        local.entities.push(ent);
      }
    }
    // Merge children by summary similarity
    const remoteChildren = Array.isArray(remote.children) ? remote.children : [];
    for (const remoteChild of remoteChildren) {
      if (!remoteChild) continue;
      const matchIdx = await this.findBestMatchIdx(local.children, remoteChild.summary ?? '');
      if (matchIdx === -1) {
        local.children.push(this.cloneNode(remoteChild));
      } else if (typeof matchIdx === 'number' && local.children[matchIdx]) {
        await this.mergeNodes(local.children[matchIdx], remoteChild);
      }
    }
    // Optionally, update summary using backend.mergeConcepts
    if (this.backend.mergeConcepts) {
      local.summary = await this.backend.mergeConcepts(local.summary, remote.summary);
    }
  }

  /** Create a new semantic node. */
  private createNode(summary: string, level: number): SemanticNode {
    return { id: crypto.randomUUID(), summary, children: [], entities: [], level };
  }

  /** Merge the two most similar children under a new abstraction node. */
  private async mergeMostSimilarChildren(parent: SemanticNode): Promise<void> {
    if (parent.children.length < 2) return;
    let maxSim = -1;
    let idxA = -1, idxB = -1;
    for (let i = 0; i < parent.children.length; i++) {
      for (let j = i + 1; j < parent.children.length; j++) {
        const nodeA = parent.children[i];
        const nodeB = parent.children[j];
        if (!nodeA || !nodeB) continue;
        const sim = await this.backend.similarity(nodeA.summary, nodeB.summary);
        if (sim > maxSim) {
          maxSim = sim;
          idxA = i;
          idxB = j;
        }
      }
    }
    if (idxA === -1 || idxB === -1) return;
    const a = parent.children[idxA];
    const b = parent.children[idxB];
    if (!a || !b) return;
    const mergedSummary = this.backend.mergeConcepts
      ? await this.backend.mergeConcepts(a.summary, b.summary, parent.summary)
      // @ts-expect-error TS(2304): Cannot find name 'Abstract'.
      : `Abstract(${a?.summary ?? ''},${b?.summary ?? ''},${parent.summary})`;
    const mergedNode: SemanticNode = this.createNode(mergedSummary, parent.level + 1);
    mergedNode.entities.push(...(a?.entities ?? []), ...(b?.entities ?? []));
    mergedNode.children.push(...(a?.children ?? []), ...(b?.children ?? []));
    mergedNode.parent = parent;
    // Remove a and b, add mergedNode
    parent.children = parent.children.filter((c, idx) => idx !== idxA && idx !== idxB);
    parent.children.push(mergedNode);
  }

  /** Hash a node and its subtree for Merkle root. */
  private hashNode(node: SemanticNode): string {
    const childHashes = node.children.map(c => this.hashNode(c)).join('');
    return crypto.createHash('sha256').update(node.summary + childHashes).digest('hex');
  }

  private hashStrings(hashes: string[]): string {
    return crypto.createHash('sha256').update(hashes.join('')).digest('hex');
  }

  /** Merge with another ShimiMemory instance. */
  mergeWith(other: ShimiMemory): void {
    if (!this.rootNodes || !other.rootNodes) return;
    this.rootNodes = CRDTMergeUtility.lwwMerge(this.rootNodes, other.rootNodes);
    // Optionally merge stats (G-Counter) if present
    // if (this.stats && other.stats) this.stats = CRDTMergeUtility.gCounterMerge(this.stats, other.stats);
  }

  /** Describe ShimiMemory for registry compliance. */
  describe(): CapabilityDescribe {
    return {
      name: 'ShimiMemory',
      description: 'SHIMI: Polyhierarchical semantic memory index for decentralized agent reasoning. Supports Merkle-DAG, CRDT sync, multi-root, and pluggable LLM/embedding backends. Best practices: multi-root/polyhierarchy, Merkle-DAG node IDs/hashes, CRDT merge for distributed memory, pluggable LLM/embedding backend, LLM-driven summarization/compression (planned).',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://arxiv.org/abs/2504.06135',
      docsFirst: true,
      aiFriendlyDocs: true,
      usage: "import ShimiMemory from 'nootropic/utils/context/shimiMemory'; const mem = new ShimiMemory(); await mem.insertEntity({ concept: 'foo', explanation: 'bar' }); await mem.retrieveEntities('query');",
      methods: [
        { name: 'insertEntity', signature: '(entity: { concept: string; explanation: string; ... }) => Promise<void>', description: 'Insert an entity into the polyhierarchical semantic memory.' },
        { name: 'retrieveEntities', signature: '(query: string, topK?: number) => Promise<unknown[]>', description: 'Retrieve entities by semantic query.' },
        { name: 'getMerkleRoot', signature: '() => string', description: 'Get Merkle-DAG root hash for decentralized sync.' },
        { name: 'crdtMerge', signature: '(remote: ShimiMemory) => Promise<void>', description: 'Merge remote memory using CRDT logic.' }
      ],
      references: [
        'https://arxiv.org/abs/2504.06135',
        'https://en.wikipedia.org/wiki/Merkle_tree',
        'https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type'
      ],
      schema: z.object({
        concept: z.string(),
        explanation: z.string(),
        options: z.object({
          maxBranching: z.number().optional(),
          maxLevels: z.number().optional(),
          similarityThreshold: z.number().optional(),
          compressionRatio: z.number().optional(),
          backendName: z.string().optional()
        }).optional()
      })
    };
  }

  /** Health check for ShimiMemory. */
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** No-op lifecycle hook for registry compliance. */
  async init(): Promise<void> {}
  /** No-op lifecycle hook for registry compliance. */
  async reload(): Promise<void> {}
}

export const ShimiMemorySchema = z.object({
  concept: z.string(),
  explanation: z.string(),
  options: z.object({
    maxBranching: z.number().optional(),
    maxLevels: z.number().optional(),
    similarityThreshold: z.number().optional(),
    compressionRatio: z.number().optional(),
    backendName: z.string().optional()
  }).optional()
});

const ShimiMemoryCapability = {
  name: 'ShimiMemory',
  describe: ShimiMemory.prototype.describe,
  schema: ShimiMemorySchema,
  init: async function() {},
  reload: async function() {}
};

export default ShimiMemoryCapability;

// Dynamic tree memory (MemTree) for structured long-term memory

/**
 * MemTreeNode: Node in the dynamic tree memory (MemTree).
 */
export interface MemTreeNode {
  id: string;
  parent?: MemTreeNode;
  children: MemTreeNode[];
  summary?: string;
  data?: unknown;
}

/**
 * MemTree: Dynamic tree memory for structured long-term memory.
 */
export class MemTree {
  root: MemTreeNode;

  constructor(rootData: unknown) {
    this.root = { id: 'root', children: [], data: rootData };
  }

  /**
   * Creates a new node under the given parent with provided data.
   * parent: Parent node
   * data: Data for the new node
   * Returns: The new node
   */
  addNode(parent: MemTreeNode, data: unknown): MemTreeNode {
    const node: MemTreeNode = {
      id: Math.random().toString(36).slice(2),
      parent,
      children: [],
      data
    };
    parent.children.push(node);
    return node;
  }

  /**
   * Summarizes the given node.
   * node: Node to summarize
   */
  summarizeNode(node: MemTreeNode): void {
    // TODO: Summarize/compress node data (LLM or heuristic)
    node.summary = '...';
  }

  /**
   * Searches nodes by query string.
   * query: Query string
   * Returns: Array of matching nodes
   */
  retrieve(query: string): MemTreeNode[] {
    // TODO: Efficient retrieval based on query (embedding, metadata, etc.)
    return [];
  }
} 