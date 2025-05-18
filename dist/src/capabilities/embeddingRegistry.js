import { pipeline } from '@xenova/transformers';
import { Ollama } from 'ollama';
import fetch from 'node-fetch';
// --- Hash-based stub provider (fallback/offline/dev) ---
class HashEmbeddingProvider {
    name = 'hash-stub';
    async embed(text) {
        const arr = Array.isArray(text) ? text : [text];
        return arr.map(t => [this.hash(t)]);
    }
    hash(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++)
            hash = (hash * 31 + text.charCodeAt(i)) % 1e6;
        return hash;
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    describe() {
        return {
            name: this.name,
            description: 'Stub hash-based embedding provider for offline/dev mode.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Returns a fake embedding (hash) for each input.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: "import { getEmbeddingProvider } from 'nootropic/capabilities/embeddingRegistry'; const provider = getEmbeddingProvider(); await provider.embed('hello');",
            docsFirst: true,
            aiFriendlyDocs: true,
            references: []
        };
    }
}
// --- HuggingFace Transformers.js provider (local ONNX) ---
class HuggingFaceEmbeddingProvider {
    name = 'huggingface';
    extractor;
    model;
    constructor() {
        this.model = process.env['HUGGINGFACE_MODEL'] ?? 'Xenova/all-MiniLM-L6-v2';
    }
    async ensureLoaded() {
        if (!this.extractor) {
            this.extractor = await pipeline('feature-extraction', this.model);
        }
    }
    async embed(text) {
        await this.ensureLoaded();
        const arr = Array.isArray(text) ? text : [text];
        // Type guard for extractor
        if (typeof this.extractor !== 'function')
            throw new Error('Extractor is not loaded or not a function');
        const res = await this.extractor(arr, { pooling: 'mean', normalize: true });
        if (typeof res.tolist === 'function')
            return res.tolist();
        if (Array.isArray(res.data))
            return arr.map((_, i) => Array.isArray(res.data[i]) ? res.data[i] : []);
        return arr.map(() => []);
    }
    async health() {
        try {
            await this.ensureLoaded();
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    describe() {
        return {
            name: this.name,
            description: 'HuggingFace Transformers.js local embedding provider (ONNX, runs in Node.js, no API key needed).',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/xenova/transformers.js',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Embeds text(s) using a local ONNX model.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: `Set HUGGINGFACE_MODEL env var to select model. Example: 'Xenova/all-MiniLM-L6-v2'.`,
            docsFirst: true,
            aiFriendlyDocs: true,
            references: ['https://github.com/xenova/transformers.js']
        };
    }
}
// --- Ollama embedding provider (local REST API) ---
class OllamaEmbeddingProvider {
    name = 'ollama';
    model;
    client;
    constructor() {
        this.model = process.env['OLLAMA_MODEL'] ?? 'mxbai-embed-large';
        this.client = new Ollama();
    }
    async embed(text) {
        const arr = Array.isArray(text) ? text : [text];
        // Ollama JS API: ollama.embed({ model, input }) returns { embedding: number[] } or { embeddings: number[][] }
        const results = await Promise.all(arr.map(async (t) => {
            const res = await this.client.embed({ model: this.model, input: t });
            if ('embeddings' in res && Array.isArray(res.embeddings))
                return res.embeddings[0] ?? [];
            if ('embedding' in res && Array.isArray(res.embedding))
                return res.embedding;
            return [];
        }));
        return results;
    }
    async health() {
        try {
            // Try a dummy embed
            await this.embed('hello');
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    describe() {
        return {
            name: this.name,
            description: 'Ollama embedding provider (local REST API, supports open and HuggingFace models).',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/jmorganca/ollama',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Embeds text(s) using Ollama local API.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: `Set OLLAMA_MODEL env var to select model. Example: 'mxbai-embed-large'. Ollama must be running locally.`,
            docsFirst: true,
            aiFriendlyDocs: true,
            references: ['https://ollama.com/blog/embedding-models', 'https://www.npmjs.com/package/ollama']
        };
    }
}
// --- Custom embedding provider stub (for user extension) ---
class CustomEmbeddingProvider {
    name = 'custom';
    async embed() {
        // User should implement this method for their custom provider
        throw new Error('CustomEmbeddingProvider.embed() not implemented. Please extend this class.');
    }
    async health() {
        return { status: 'error', timestamp: new Date().toISOString() };
    }
    describe() {
        return {
            name: this.name,
            description: 'Custom embedding provider stub. Extend this class to add your own provider.',
            license: 'UNLICENSED',
            isOpenSource: false,
            provenance: 'User extension required',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'User-implemented embedding method.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: 'Extend CustomEmbeddingProvider and register in embeddingRegistry.ts.',
            docsFirst: true,
            aiFriendlyDocs: true,
            references: []
        };
    }
}
// --- Petals distributed embedding provider ---
class PetalsEmbeddingProvider {
    name = 'petals';
    url;
    model;
    constructor() {
        this.url = process.env['PETALS_URL'] ?? 'http://localhost:8080/embed';
        this.model = process.env['PETALS_MODEL'] ?? 'bigscience/bloom-petals';
    }
    async embed(text) {
        const arr = Array.isArray(text) ? text : [text];
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.model, inputs: arr })
        });
        const data = await res.json();
        function hasEmbedding(obj) {
            return typeof obj === 'object' && obj !== null && 'embedding' in obj;
        }
        if (typeof data === 'object' &&
            data !== null &&
            'data' in data &&
            Array.isArray(data['data'])) {
            // (Removed unused @ts-expect-error directive)
            return data['data'].map((d) => hasEmbedding(d) && Array.isArray(d.embedding)
                ? d.embedding
                : []);
        }
        if (typeof data === 'object' &&
            data !== null &&
            'embeddings' in data &&
            Array.isArray(data['embeddings'])) {
            return data['embeddings'];
        }
        return arr.map(() => []);
    }
    async health() {
        try {
            await this.embed('hello');
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    describe() {
        return {
            name: this.name,
            description: 'Petals distributed embedding provider (HTTP endpoint, supports large models).',
            license: 'Apache-2.0',
            isOpenSource: true,
            provenance: 'https://github.com/bigscience-workshop/petals',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Embeds text(s) using Petals HTTP API.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: `Set PETALS_URL and PETALS_MODEL env vars. Default: http://localhost:8080/embed, bigscience/bloom-petals.`,
            docsFirst: true,
            aiFriendlyDocs: true,
            references: ['https://petals.ml/', 'https://github.com/bigscience-workshop/petals']
        };
    }
}
// --- LM Studio embedding provider (OpenAI-compatible REST API) ---
class LMStudioEmbeddingProvider {
    name = 'lmstudio';
    url;
    model;
    constructor() {
        this.url = process.env['LMSTUDIO_URL'] ?? 'http://localhost:1234/v1/embeddings';
        this.model = process.env['LMSTUDIO_MODEL'] ?? 'all-MiniLM-L6-v2';
    }
    async embed(text) {
        const arr = Array.isArray(text) ? text : [text];
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.model, input: arr })
        });
        const data = await res.json();
        if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data['data'])) {
            return data['data'].map((d) => (typeof d === 'object' && d !== null && 'embedding' in d ? d['embedding'] : []));
        }
        return arr.map(() => []);
    }
    async health() {
        try {
            await this.embed('hello');
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    describe() {
        return {
            name: this.name,
            description: 'LM Studio embedding provider (OpenAI-compatible REST API, local server).',
            license: 'AGPL-3.0',
            isOpenSource: true,
            provenance: 'https://github.com/lmstudio-ai',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Embeds text(s) using LM Studio REST API.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: `Set LMSTUDIO_URL and LMSTUDIO_MODEL env vars. Default: http://localhost:1234/v1/embeddings, all-MiniLM-L6-v2.`,
            docsFirst: true,
            aiFriendlyDocs: true,
            references: ['https://lmstudio.ai/', 'https://github.com/lmstudio-ai']
        };
    }
}
// --- Generic HTTP embedding provider ---
class HttpEmbeddingProvider {
    name = 'http';
    url;
    model;
    constructor() {
        this.url = process.env['HTTP_EMBEDDING_URL'] || '';
        this.model = process.env['HTTP_EMBEDDING_MODEL'] || '';
    }
    async embed(text) {
        if (!this.url)
            throw new Error('HTTP_EMBEDDING_URL not set');
        const arr = Array.isArray(text) ? text : [text];
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.model, input: arr })
        });
        const data = await res.json();
        if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data['data'])) {
            return data['data'].map((d) => (typeof d === 'object' && d !== null && 'embedding' in d ? d['embedding'] : []));
        }
        if (typeof data === 'object' && data !== null && 'embeddings' in data && Array.isArray(data['embeddings'])) {
            return data['embeddings'];
        }
        if (Array.isArray(data.data))
            return data.data.map((d) => Array.isArray(d.embedding) ? d.embedding : []);
        if (Array.isArray(data.embeddings))
            return data.embeddings;
        if (Array.isArray(data.embedding))
            return [data.embedding];
        return arr.map(() => []);
    }
    async health() {
        try {
            await this.embed('hello');
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    describe() {
        return {
            name: this.name,
            description: 'HTTP embedding provider (OpenAI-compatible REST API, generic).',
            license: 'UNLICENSED',
            isOpenSource: false,
            provenance: 'User extension required',
            methods: [
                { name: 'embed', signature: '(text: string | string[]) => Promise<number[][]>', description: 'Embeds text(s) using a generic HTTP API.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' }
            ],
            usage: `Set HTTP_EMBEDDING_URL and HTTP_EMBEDDING_MODEL env vars.`,
            docsFirst: true,
            aiFriendlyDocs: true,
            references: []
        };
    }
}
// --- Registry/factory ---
const providers = {
    'hash-stub': new HashEmbeddingProvider(),
    'huggingface': new HuggingFaceEmbeddingProvider(),
    'ollama': new OllamaEmbeddingProvider(),
    'custom': new CustomEmbeddingProvider(),
    'petals': new PetalsEmbeddingProvider(),
    'lmstudio': new LMStudioEmbeddingProvider(),
    'http': new HttpEmbeddingProvider(),
};
export function getEmbeddingProvider() {
    const selected = process.env['EMBEDDING_PROVIDER'] ?? 'hash-stub';
    const provider = providers[selected];
    if (provider)
        return provider;
    return providers['hash-stub'];
}
