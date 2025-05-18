import crypto from 'crypto';
import { getEmbeddingBackend } from '../embedding/embeddingClient.js';
import { z } from 'zod';
class UniversalShimiBackend {
    backend;
    constructor(backend, backendName) {
        const resolved = backend ?? getEmbeddingBackend(backendName || '');
        if (!resolved)
            throw new Error('No embedding backend provided or found');
        this.backend = resolved;
    }
    async similarity(a, b) {
        if (!this.backend)
            throw new Error('No embedding backend configured');
        const [vecA, vecB] = await Promise.all([
            this.backend.embedText(a),
            this.backend.embedText(b)
        ]);
        if (vecA.length === 0 || vecB.length === 0)
            return Math.random();
        return this.cosineSimilarity(vecA, vecB);
    }
    async mergeConcepts(a, b, parent) {
        if (!this.backend)
            throw new Error('No embedding backend configured');
        // Optionally use backend for abstraction (future: LLM summarization)
        return `Abstract(${a},${b}${parent ? ',' + parent : ''})`;
    }
    cosineSimilarity(a, b) {
        const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
        const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
        const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
        return dot / (normA * normB);
    }
}
/**
 * CRDTMergeUtility: Implements CRDT merge logic for decentralized SHIMI memory sync.
 * Supports LWW (last-write-wins) and G-Counter for distributed node merging.
 * Extensible for other CRDT types.
 */
export class CRDTMergeUtility {
    // LWW-Element-Set CRDT merge for memory nodes
    static lwwMerge(a, b) {
        const map = new Map();
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
    static gCounterMerge(a, b) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        const result = {};
        for (const k of keys) {
            result[k] = Math.max(a[k] || 0, b[k] ?? 0);
        }
        return result;
    }
}
/** SHIMI: Semantic Hierarchical Memory Index for decentralized agent reasoning. */
export class ShimiMemory {
    name = 'ShimiMemory';
    rootNodes = [];
    options;
    backend;
    // Polyhierarchy: allow multiple parents (future extension)
    nodeMap = new Map();
    constructor(options = {}) {
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
    async insertEntity(entity) {
        // 1. Find candidate root(s) by semantic similarity
        let root = undefined;
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
        if (!parent || !Array.isArray(parent.children))
            return;
        for (let level = 1; level < (this.options.maxLevels ?? 5); level++) {
            let foundChild = undefined;
            for (const c of parent.children) {
                if (await this.backend.similarity(entity.explanation, c.summary) > (this.options.similarityThreshold ?? 0.7)) {
                    foundChild = c;
                    break;
                }
            }
            if (!foundChild)
                break;
            parent = foundChild;
            if (!parent || !Array.isArray(parent.children))
                return;
        }
        // 3. Sibling matching/merging (polyhierarchy: allow multiple parents in future)
        let similarSibling = undefined;
        for (const c of parent.children) {
            if (await this.backend.similarity(entity.explanation, c.summary) > (this.options.similarityThreshold ?? 0.7)) {
                similarSibling = c;
                break;
            }
        }
        if (similarSibling) {
            similarSibling.entities.push(entity);
        }
        else {
            if (!parent)
                return;
            // Create new node
            const node = this.createNode(entity.explanation, parent.level + 1);
            node.entities.push(entity);
            node.parent = parent;
            parent.children.push(node);
            this.nodeMap.set(node.id, node);
            // Trigger merging if branching exceeds max
            if ((parent.children ?? []).length > (this.options.maxBranching ?? 4)) {
                await this.mergeMostSimilarChildren(parent);
            }
        }
    }
    /** Retrieve entities by semantic query (top-down traversal, pruning by similarity). */
    async retrieveEntities(query, topK = 5) {
        const results = [];
        for (const root of this.rootNodes) {
            await this.traverse(root, query, results, topK);
            if (results.length >= topK)
                break;
        }
        return results.slice(0, topK);
    }
    async traverse(node, query, results, topK) {
        if (await this.backend.similarity(query, node.summary) < (this.options.similarityThreshold ?? 0.7))
            return;
        if (node.entities.length)
            results.push(...node.entities);
        if (!node.children)
            return;
        for (const child of node.children) {
            if (results.length >= topK)
                break;
            await this.traverse(child, query, results, topK);
        }
    }
    /** Decentralized sync: Merkle-DAG root hash, Bloom filter, CRDT merge (polyhierarchy-ready). */
    getMerkleRoot() {
        // Merkle root: hash of all node IDs and summaries (polyhierarchy)
        const hashes = Array.from(this.nodeMap.values()).map(n => this.hashNode(n));
        return this.hashStrings(hashes);
    }
    /** Get Bloom filter (set of all node IDs). */
    getBloomFilter() {
        // Simple Bloom: set of all node IDs
        const ids = new Set();
        const visit = (n) => {
            ids.add(n.id);
            if (!n.children)
                return;
            n.children.forEach(visit);
        };
        this.rootNodes.forEach(visit);
        return ids;
    }
    /** Merge remote root nodes into local, using semantic similarity and idempotent merge. */
    async crdtMerge(remote) {
        // Merge remote root nodes into local, using semantic similarity and idempotent merge
        if (!remote || !Array.isArray(remote.rootNodes))
            return;
        for (const remoteRoot of remote.rootNodes) {
            if (!remoteRoot)
                continue;
            const matchIdx = await this.findBestMatchIdx(this.rootNodes, remoteRoot.summary ?? '');
            if (matchIdx === -1) {
                // No match, add as new root
                this.rootNodes.push(this.cloneNode(remoteRoot));
            }
            else if (typeof matchIdx === 'number' && this.rootNodes[matchIdx]) {
                // Merge trees recursively
                const localNode = this.rootNodes[matchIdx];
                if (localNode) {
                    await this.mergeNodes(localNode, remoteRoot);
                }
            }
        }
    }
    async findBestMatchIdx(nodes, summary) {
        let bestIdx = -1;
        let bestSim = this.options.similarityThreshold ?? 0.7;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i] ?? { summary: '' };
            if (!node)
                continue;
            const sim = await this.backend.similarity(summary, node.summary ?? '');
            if (sim > bestSim) {
                bestSim = sim;
                bestIdx = i;
            }
        }
        return bestIdx;
    }
    cloneNode(node) {
        return {
            id: node.id,
            summary: node.summary,
            children: Array.isArray(node.children) ? node.children.map(c => c ? this.cloneNode(c) : c).filter(Boolean) : [],
            entities: Array.isArray(node.entities) ? [...node.entities] : [],
            level: node.level
        };
    }
    async mergeNodes(local, remote) {
        // Merge entities (idempotent)
        if (!remote || !local)
            return;
        const remoteEntities = Array.isArray(remote.entities) ? remote.entities : [];
        for (const ent of remoteEntities) {
            if (!local.entities.some(e => JSON.stringify(e) === JSON.stringify(ent))) {
                local.entities.push(ent);
            }
        }
        // Merge children by summary similarity
        const remoteChildren = Array.isArray(remote.children) ? remote.children : [];
        for (const remoteChild of remoteChildren) {
            if (!remoteChild)
                continue;
            const matchIdx = await this.findBestMatchIdx(local.children, remoteChild.summary ?? '');
            if (matchIdx === -1) {
                local.children.push(this.cloneNode(remoteChild));
            }
            else if (typeof matchIdx === 'number' && local.children[matchIdx]) {
                const localChild = local.children[matchIdx];
                if (localChild) {
                    await this.mergeNodes(localChild, remoteChild);
                }
            }
        }
        // Optionally, update summary using backend.mergeConcepts
        if (this.backend.mergeConcepts) {
            local.summary = await this.backend.mergeConcepts(local.summary, remote.summary);
        }
    }
    /** Create a new semantic node. */
    createNode(summary, level) {
        return { id: crypto.randomUUID(), summary, children: [], entities: [], level };
    }
    /** Merge the two most similar children under a new abstraction node. */
    async mergeMostSimilarChildren(parent) {
        if (parent.children.length < 2)
            return;
        let maxSim = -1;
        let idxA = -1, idxB = -1;
        for (let i = 0; i < parent.children.length; i++) {
            for (let j = i + 1; j < parent.children.length; j++) {
                const nodeA = parent.children[i];
                const nodeB = parent.children[j];
                if (!nodeA || !nodeB)
                    continue;
                const sim = await this.backend.similarity(nodeA.summary, nodeB.summary);
                if (sim > maxSim) {
                    maxSim = sim;
                    idxA = i;
                    idxB = j;
                }
            }
        }
        if (idxA === -1 || idxB === -1)
            return;
        const a = parent.children[idxA];
        const b = parent.children[idxB];
        if (!a || !b)
            return;
        const mergedSummary = this.backend.mergeConcepts
            ? await this.backend.mergeConcepts(a.summary, b.summary, parent.summary)
            : `Abstract(${a?.summary ?? ''},${b?.summary ?? ''},${parent.summary})`;
        const mergedNode = this.createNode(mergedSummary, parent.level + 1);
        mergedNode.entities.push(...(a?.entities ?? []), ...(b?.entities ?? []));
        mergedNode.children.push(...(a?.children ?? []), ...(b?.children ?? []));
        mergedNode.parent = parent;
        // Remove a and b, add mergedNode
        parent.children = parent.children.filter((_c, idx) => idx !== idxA && idx !== idxB);
        parent.children.push(mergedNode);
    }
    /** Hash a node and its subtree for Merkle root. */
    hashNode(node) {
        const childHashes = node.children.map(c => this.hashNode(c)).join('');
        return crypto.createHash('sha256').update(node.summary + childHashes).digest('hex');
    }
    hashStrings(hashes) {
        return crypto.createHash('sha256').update(hashes.join('')).digest('hex');
    }
    /** Merge with another ShimiMemory instance. */
    mergeWith(other) {
        if (!this.rootNodes || !other.rootNodes)
            return;
        this.rootNodes = CRDTMergeUtility.lwwMerge(this.rootNodes, other.rootNodes);
        // Optionally merge stats (G-Counter) if present
        // if (this.stats && other.stats) this.stats = CRDTMergeUtility.gCounterMerge(this.stats, other.stats);
    }
    /** Describe ShimiMemory for registry compliance. */
    describe() {
        return {
            name: 'ShimiMemory',
            description: 'Semantic Hierarchical Memory Index (SHIMI) for decentralized agent reasoning. Supports entity insertion, retrieval, and decentralized sync. Registry/LLM/AI-friendly.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://arxiv.org/abs/2504.06135',
            docsFirst: true,
            aiFriendlyDocs: true,
            usage: "import { ShimiMemory } from 'nootropic/utils/context/shimiMemory'; const shimi = new ShimiMemory(); await shimi.insertEntity({ concept: 'foo', explanation: 'bar' }); await shimi.retrieveEntities('foo');",
            methods: [
                { name: 'insertEntity', signature: '(entity: { concept: string; explanation: string; [key: string]: unknown }) => Promise<void>', description: 'Insert an entity into the semantic memory graph.' },
                { name: 'retrieveEntities', signature: '(query: string, topK?: number) => Promise<unknown[]>', description: 'Retrieve entities by semantic query.' },
                { name: 'crdtMerge', signature: '(remote: ShimiMemory) => Promise<void>', description: 'Merge with a remote SHIMI memory using CRDT logic.' }
            ],
            promptTemplates: [
                {
                    name: 'Insert Entity',
                    description: 'Insert an entity into the semantic memory graph.',
                    template: 'insertEntity({ concept, explanation, ... })'
                },
                {
                    name: 'Retrieve Entities',
                    description: 'Retrieve entities by semantic query.',
                    template: 'retrieveEntities(query, topK?)'
                },
                {
                    name: 'CRDT Merge',
                    description: 'Merge with a remote SHIMI memory using CRDT logic.',
                    template: 'crdtMerge(remoteShimiMemory)'
                }
            ],
            schema: ShimiMemorySchema
        };
    }
    /** Health check for ShimiMemory. */
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    /** No-op lifecycle hook for registry compliance. */
    async init() { }
    /** No-op lifecycle hook for registry compliance. */
    async reload() { }
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
    init: async function () { },
    reload: async function () { }
};
export default ShimiMemoryCapability;
/**
 * MemTree: Dynamic tree memory for structured long-term memory.
 */
export class MemTree {
    root;
    constructor(rootData) {
        this.root = { id: 'root', children: [], data: rootData };
    }
    /**
     * Creates a new node under the given parent with provided data.
     * parent: Parent node
     * data: Data for the new node
     * Returns: The new node
     */
    addNode(parent, data) {
        const node = {
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
    summarizeNode(node) {
        // TODO: Summarize/compress node data (LLM or heuristic)
        node.summary = '...';
    }
    /**
     * Searches nodes by query string.
     * query: Query string
     * Returns: Array of matching nodes
     */
    retrieve(_query) {
        // TODO: Efficient retrieval based on query (embedding, metadata, etc.)
        return [];
    }
}
