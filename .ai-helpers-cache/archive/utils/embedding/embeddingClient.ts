/**
 * Calls the local embedding_service.py HTTP API to get NV-Embed-v2 embeddings for a list of texts.
 * Usage: await embedTexts(["your text"])
 */
import fetch from 'node-fetch';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const EMBED_URL = process.env['EMBED_URL'] ?? 'http://localhost:5000/embed';

// @ts-expect-error TS(6133): 'texts' is declared but its value is never read.
export async function embedTexts(texts: string[]): Promise<number[][]> {
  // @ts-expect-error TS(2448): Block-scoped variable 'res' used before its declar... Remove this comment to see the full error message
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // @ts-expect-error TS(2552): Cannot find name 'texts'. Did you mean 'Text'?
    body: JSON.stringify({ texts })
  });
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!res.ok) throw new Error(`Embedding service error: ${res.status}`);
  const data: unknown = await res.json();
  return data.embeddings as number[][];
}

/**
 * Universal EmbeddingBackend interface for pluggable embedding providers.
 */
export interface EmbeddingBackend {
  name: string;
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
  getInfo?(): Promise<Record<string, unknown>>;
}

// NV-Embed-v2 backend
export class NVEmbedBackend implements EmbeddingBackend {
  name = 'nv-embed';
  private url: string;
  constructor(url?: string) {
    this.url = url ?? (process.env['EMBED_URL'] || 'http://localhost:5000/embed');
  }
  async embedText(text: string): Promise<number[]> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] })
    });
    // @ts-expect-error TS(2304): Cannot find name 'NV'.
    if (!res.ok) throw new Error(`NV-Embed error: ${res.status}`);
    const data: unknown = await res.json();
    return data.embeddings[0] as number[];
  }
  async getInfo() { return { url: this.url }; }
}

// Ollama backend
export class OllamaEmbedBackend implements EmbeddingBackend {
  name = 'ollama';
  private url: string;
  private model: string;
  constructor(url?: string, model?: string) {
    this.url = url ?? (process.env['OLLAMA_API_URL'] || 'http://localhost:11434/api/embeddings');
    this.model = model ?? (process.env['OLLAMA_MODEL'] || 'llama2');
  }
  async embedText(text: string): Promise<number[]> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text })
    });
    // @ts-expect-error TS(2304): Cannot find name 'Ollama'.
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data: unknown = await res.json();
    return data.embedding as number[];
  }
  async getInfo() { return { url: this.url, model: this.model }; }
}

// HuggingFace backend
export class HuggingFaceEmbedBackend implements EmbeddingBackend {
  name = 'huggingface';
  private apiKey: string;
  private model: string;
  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey ?? (process.env['HUGGINGFACE_API_KEY'] || '');
    this.model = model ?? (process.env['HF_EMBED_MODEL'] || 'sentence-transformers/all-MiniLM-L6-v2');
  }
  async embedText(text: string): Promise<number[]> {
    // @ts-expect-error TS(1344): 'A label is not allowed here.
    const url = `https://api-inference.huggingface.co/models/${this.model}`;
    // @ts-expect-error TS(2552): Cannot find name 'url'. Did you mean 'URL'?
    const res = await fetch(url, {
      method: 'POST',
      // @ts-expect-error TS(2349): This expression is not callable.
      headers: {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ inputs: text })
    });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    if (!res.ok) throw new Error(`HuggingFace error: ${res.status}`);
    const data: unknown = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0]?.embedding)) return data[0].embedding;
    if (Array.isArray(data?.embedding)) return data.embedding;
    return [];
  }
  async getInfo() { return { model: this.model }; }
}

// OpenRouter backend
export class OpenRouterEmbedBackend implements EmbeddingBackend {
  name = 'openrouter';
  private apiKey: string;
  private model: string;
  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey ?? (process.env['OPENROUTER_API_KEY'] || '');
    this.model = model ?? (process.env['OPENROUTER_EMBED_MODEL'] || 'openai/text-embedding-ada-002');
  }
  async embedText(text: string): Promise<number[]> {
    const url = 'https://openrouter.ai/api/v1/embeddings';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model: this.model, input: text })
    });
    // @ts-expect-error TS(2304): Cannot find name 'OpenRouter'.
    if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
    const data: unknown = await res.json();
    if (Array.isArray(data?.data) && Array.isArray(data.data[0]?.embedding)) return data.data[0].embedding;
    return [];
  }
  async getInfo() { return { model: this.model }; }
}

// Nomic backend
export class NomicEmbedBackend implements EmbeddingBackend {
  name = 'nomic';
  private apiUrl: string;
  private apiKey: string;
  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl ?? (process.env['NOMIC_API_URL'] || 'https://api-atlas.nomic.ai/v1/embedding/text');
    this.apiKey = apiKey ?? (process.env['NOMIC_API_KEY'] || '');
  }
  async embedText(text: string): Promise<number[]> {
    const body = JSON.stringify({ model: 'nomic-embed-text-v1', texts: [text] });
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    const res = await fetch(this.apiUrl, { method: 'POST', headers, body });
    const data: unknown = await res.json();
    if (Array.isArray(data?.embeddings) && Array.isArray(data.embeddings[0])) return data.embeddings[0];
    return [];
  }
  async getInfo() { return { apiUrl: this.apiUrl }; }
}

// LM Studio backend (example, user must provide endpoint)
export class LMStudioEmbedBackend implements EmbeddingBackend {
  name = 'lmstudio';
  private url: string;
  constructor(url?: string) {
    this.url = url ?? (process.env['LMSTUDIO_EMBED_URL'] || 'http://localhost:1234/embed');
  }
  async embedText(text: string): Promise<number[]> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    // @ts-expect-error TS(2304): Cannot find name 'LM'.
    if (!res.ok) throw new Error(`LM Studio error: ${res.status}`);
    const data: unknown = await res.json();
    return data.embedding as number[];
  }
  async getInfo() { return { url: this.url }; }
}

// Registry and factory
const EMBEDDING_BACKENDS: Record<string, EmbeddingBackend> = {
  'nv-embed': new NVEmbedBackend(),
  'ollama': new OllamaEmbedBackend(),
  'huggingface': new HuggingFaceEmbedBackend(),
  'openrouter': new OpenRouterEmbedBackend(),
  'nomic': new NomicEmbedBackend(),
  'lmstudio': new LMStudioEmbedBackend(),
};

export function getEmbeddingBackend(name?: string): EmbeddingBackend {
  const backend = EMBEDDING_BACKENDS[(name ?? (process.env['EMBED_BACKEND'] || 'nv-embed'))];
  // @ts-expect-error TS(2304): Cannot find name 'Unknown'.
  if (!backend) throw new Error(`Unknown embedding backend: ${name}`);
  return backend;
}

// Usage: const backend = getEmbeddingBackend(); await backend.embedText('your text');
// To add a new backend, implement EmbeddingBackend and add to EMBEDDING_BACKENDS. 