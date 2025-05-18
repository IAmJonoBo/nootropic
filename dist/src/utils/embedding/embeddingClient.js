/**
 * Calls the local embedding_service.py HTTP API to get NV-Embed-v2 embeddings for a list of texts.
 * Usage: await embedTexts(["your text"])
 */
import fetch from 'node-fetch';
import { z } from 'zod';
const EMBED_URL = process.env['EMBED_URL'] ?? 'http://localhost:5000/embed';
// Zod schemas for embedding responses
const NVEmbedResponse = z.object({ embeddings: z.array(z.array(z.number())) });
const OllamaResponse = z.object({ embedding: z.array(z.number()) });
const HuggingFaceArrayResponse = z.array(z.object({ embedding: z.array(z.number()) }));
const HuggingFaceObjectResponse = z.object({ embedding: z.array(z.number()) });
const OpenRouterResponse = z.object({ data: z.array(z.object({ embedding: z.array(z.number()) })) });
const NomicResponse = z.object({ embeddings: z.array(z.array(z.number())) });
const LMStudioResponse = z.object({ embedding: z.array(z.number()) });
export async function embedTexts(texts) {
    const res = await fetch(EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
    });
    if (!res.ok)
        throw new Error(`Embedding service error: ${res.status}`);
    const data = NVEmbedResponse.parse(await res.json());
    return data.embeddings;
}
// NV-Embed-v2 backend
export class NVEmbedBackend {
    name = 'nv-embed';
    url;
    constructor(url) {
        this.url = url ?? (process.env['EMBED_URL'] || 'http://localhost:5000/embed');
    }
    async embedText(text) {
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: [text] })
        });
        if (!res.ok)
            throw new Error(`NV-Embed error: ${res.status}`);
        const data = NVEmbedResponse.parse(await res.json());
        return data.embeddings[0] ?? [];
    }
    async getInfo() { return { url: this.url }; }
}
// Ollama backend
export class OllamaEmbedBackend {
    name = 'ollama';
    url;
    model;
    constructor(url, model) {
        this.url = url ?? (process.env['OLLAMA_API_URL'] || 'http://localhost:11434/api/embeddings');
        this.model = model ?? (process.env['OLLAMA_MODEL'] || 'llama2');
    }
    async embedText(text) {
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.model, prompt: text })
        });
        if (!res.ok)
            throw new Error(`Ollama error: ${res.status}`);
        const data = OllamaResponse.parse(await res.json());
        return data.embedding;
    }
    async getInfo() { return { url: this.url, model: this.model }; }
}
// HuggingFace backend
export class HuggingFaceEmbedBackend {
    name = 'huggingface';
    apiKey;
    model;
    constructor(apiKey, model) {
        this.apiKey = apiKey ?? (process.env['HUGGINGFACE_API_KEY'] || '');
        this.model = model ?? (process.env['HF_EMBED_MODEL'] || 'sentence-transformers/all-MiniLM-L6-v2');
    }
    async embedText(text) {
        const url = `https://api-inference.huggingface.co/models/${this.model}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ inputs: text })
        });
        if (!res.ok)
            throw new Error(`HuggingFace error: ${res.status}`);
        const raw = await res.json();
        if (Array.isArray(raw)) {
            const arr = HuggingFaceArrayResponse.parse(raw);
            return arr[0]?.embedding ?? [];
        }
        if (typeof raw === 'object' && raw !== null) {
            const obj = HuggingFaceObjectResponse.parse(raw);
            return obj.embedding;
        }
        return [];
    }
    async getInfo() { return { model: this.model }; }
}
// OpenRouter backend
export class OpenRouterEmbedBackend {
    name = 'openrouter';
    apiKey;
    model;
    constructor(apiKey, model) {
        this.apiKey = apiKey ?? (process.env['OPENROUTER_API_KEY'] || '');
        this.model = model ?? (process.env['OPENROUTER_EMBED_MODEL'] || 'openai/text-embedding-ada-002');
    }
    async embedText(text) {
        const url = 'https://openrouter.ai/api/v1/embeddings';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ model: this.model, input: text })
        });
        if (!res.ok)
            throw new Error(`OpenRouter error: ${res.status}`);
        const data = OpenRouterResponse.parse(await res.json());
        return data.data[0]?.embedding ?? [];
    }
    async getInfo() { return { model: this.model }; }
}
// Nomic backend
export class NomicEmbedBackend {
    name = 'nomic';
    apiUrl;
    apiKey;
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl ?? (process.env['NOMIC_API_URL'] || 'https://api-atlas.nomic.ai/v1/embedding/text');
        this.apiKey = apiKey ?? (process.env['NOMIC_API_KEY'] || '');
    }
    async embedText(text) {
        const body = JSON.stringify({ model: 'nomic-embed-text-v1', texts: [text] });
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey)
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        const res = await fetch(this.apiUrl, { method: 'POST', headers, body });
        const data = NomicResponse.parse(await res.json());
        return data.embeddings[0] ?? [];
    }
    async getInfo() { return { apiUrl: this.apiUrl }; }
}
// LM Studio backend (example, user must provide endpoint)
export class LMStudioEmbedBackend {
    name = 'lmstudio';
    url;
    constructor(url) {
        this.url = url ?? (process.env['LMSTUDIO_EMBED_URL'] || 'http://localhost:1234/embed');
    }
    async embedText(text) {
        const res = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok)
            throw new Error(`LM Studio error: ${res.status}`);
        const data = LMStudioResponse.parse(await res.json());
        return data.embedding;
    }
    async getInfo() { return { url: this.url }; }
}
// Registry and factory
const EMBEDDING_BACKENDS = {
    'nv-embed': new NVEmbedBackend(),
    'ollama': new OllamaEmbedBackend(),
    'huggingface': new HuggingFaceEmbedBackend(),
    'openrouter': new OpenRouterEmbedBackend(),
    'nomic': new NomicEmbedBackend(),
    'lmstudio': new LMStudioEmbedBackend(),
};
export function getEmbeddingBackend(name) {
    const backend = EMBEDDING_BACKENDS[(name ?? (process.env['EMBED_BACKEND'] || 'nv-embed'))];
    if (!backend)
        throw new Error(`Unknown embedding backend: ${name}`);
    return backend;
}
// Usage: const backend = getEmbeddingBackend(); await backend.embedText('your text');
// To add a new backend, implement EmbeddingBackend and add to EMBEDDING_BACKENDS. 
