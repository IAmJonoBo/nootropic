import type { EmbeddingProvider } from './EmbeddingProvider.js';
import type { CapabilityDescribe, HealthStatus } from './Capability.js';
import { pipeline } from '@xenova/transformers';
import { Ollama } from 'ollama';
import fetch from 'node-fetch';

// --- Hash-based stub provider (fallback/offline/dev) ---
// @ts-expect-error TS(2420): Class 'HashEmbeddingProvider' incorrectly implemen... Remove this comment to see the full error message
class HashEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'hash-stub';
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    return arr.map(t => [this.hash(t)]);
  }
  // @ts-expect-error TS(2304): Cannot find name 'hash'.
  private hash(text: string): number {
    let hash = 0;
    // @ts-expect-error TS(2552): Cannot find name 'text'. Did you mean 'Text'?
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 1e6;
    return hash;
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'HuggingFaceEmbeddingProvider' incorrectly i... Remove this comment to see the full error message
class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'huggingface';
  private extractor: unknown;
  private model: string;
  constructor() {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.model = process.env['HUGGINGFACE_MODEL'] ?? 'Xenova/all-MiniLM-L6-v2';
  }
  async ensureLoaded() {
    if (!this.extractor) {
      // @ts-expect-error TS(2345): Argument of type '"feature-extraction"' is not ass... Remove this comment to see the full error message
      this.extractor = await pipeline('feature-extraction', this.model);
    }
  }
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    await this.ensureLoaded();
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    const res = await this.extractor(arr, { pooling: 'mean', normalize: true });
    // transformers.js returns a tensor-like object; convert to array
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (typeof res.tolist === 'function') return res.tolist();
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    if (Array.isArray(res.data)) return arr.map((_, i) => res.data[i] ?? []);
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    return arr.map(() => []);
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    try {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      await this.ensureLoaded();
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'OllamaEmbeddingProvider' incorrectly implem... Remove this comment to see the full error message
class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'ollama';
  // @ts-expect-error TS(6133): 'model' is declared but its value is never read.
  private model: string;
  // @ts-expect-error TS(6133): 'client' is declared but its value is never read.
  private client: Ollama;
  constructor() {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.model = process.env['OLLAMA_MODEL'] ?? 'mxbai-embed-large';
    this.client = new Ollama();
  }
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // Ollama JS API: ollama.embed({ model, input }) returns { embedding: number[] } or { embeddings: number[][] }
    // @ts-expect-error TS(2304): Cannot find name 'results'.
    const results = await Promise.all(arr.map(async t => {
      // @ts-expect-error TS(2304): Cannot find name 'res'.
      const res = await this.client.embed({ model: this.model, input: t });
      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      if ('embeddings' in res && Array.isArray(res.embeddings)) return res.embeddings[0] ?? [];
      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      if ('embedding' in res && Array.isArray(res.embedding)) return res.embedding;
      return [];
    }));
    return results;
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    try {
      // Try a dummy embed
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      await this.embed('hello');
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'CustomEmbeddingProvider' incorrectly implem... Remove this comment to see the full error message
class CustomEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'custom';
  async embed(): Promise<number[][]> {
    // User should implement this method for their custom provider
    throw new Error('CustomEmbeddingProvider.embed() not implemented. Please extend this class.');
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'error', timestamp: new Date().toISOString() };
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'PetalsEmbeddingProvider' incorrectly implem... Remove this comment to see the full error message
class PetalsEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'petals';
  // @ts-expect-error TS(6133): 'url' is declared but its value is never read.
  private url: string;
  // @ts-expect-error TS(6133): 'model' is declared but its value is never read.
  private model: string;
  constructor() {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.url = process.env['PETALS_URL'] ?? 'http://localhost:8080/embed';
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.model = process.env['PETALS_MODEL'] ?? 'bigscience/bloom-petals';
  }
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      body: JSON.stringify({ model: this.model, inputs: arr })
    });
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    const data: unknown = await res.json();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
      // @ts-expect-error TS(2304): Cannot find name 'map'.
      return ((data as Record<string, unknown>)['data'] as unknown[]).map((d) => (typeof d === 'object' && d !== null && 'embedding' in d ? (d as Record<string, unknown>)['embedding'] as number[] : []));
    }
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    if (typeof data === 'object' && data !== null && 'embeddings' in data && Array.isArray((data as Record<string, unknown>)['embeddings'])) {
      // @ts-expect-error TS(2352): Conversion of type 'string[]' to type 'number[][]'... Remove this comment to see the full error message
      return (data as Record<string, unknown>)['embeddings'] as number[][];
    }
    return arr.map(() => []);
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    try { await this.embed('hello'); return { status: 'ok', timestamp: new Date().toISOString() }; }
    catch { return { status: 'error', timestamp: new Date().toISOString() }; }
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'LMStudioEmbeddingProvider' incorrectly impl... Remove this comment to see the full error message
class LMStudioEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'lmstudio';
  // @ts-expect-error TS(6133): 'url' is declared but its value is never read.
  private url: string;
  // @ts-expect-error TS(6133): 'model' is declared but its value is never read.
  private model: string;
  constructor() {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.url = process.env['LMSTUDIO_URL'] ?? 'http://localhost:1234/v1/embeddings';
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.model = process.env['LMSTUDIO_MODEL'] ?? 'all-MiniLM-L6-v2';
  }
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      body: JSON.stringify({ model: this.model, input: arr })
    });
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    const data: unknown = await res.json();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
      // @ts-expect-error TS(2304): Cannot find name 'map'.
      return ((data as Record<string, unknown>)['data'] as unknown[]).map((d) => (typeof d === 'object' && d !== null && 'embedding' in d ? (d as Record<string, unknown>)['embedding'] : []));
    }
    return arr.map(() => []);
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    try { await this.embed('hello'); return { status: 'ok', timestamp: new Date().toISOString() }; }
    catch { return { status: 'error', timestamp: new Date().toISOString() }; }
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
// @ts-expect-error TS(2420): Class 'HttpEmbeddingProvider' incorrectly implemen... Remove this comment to see the full error message
class HttpEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'http';
  // @ts-expect-error TS(6133): 'url' is declared but its value is never read.
  private url: string;
  // @ts-expect-error TS(6133): 'model' is declared but its value is never read.
  private model: string;
  constructor() {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.url = process.env['HTTP_EMBEDDING_URL'] || '';
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    this.model = process.env['HTTP_EMBEDDING_MODEL'] || '';
  }
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async embed(text: string | string[]): Promise<number[][]> {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!this.url) throw new Error('HTTP_EMBEDDING_URL not set');
    // @ts-expect-error TS(2304): Cannot find name 'arr'.
    const arr = Array.isArray(text) ? text : [text];
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      body: JSON.stringify({ model: this.model, input: arr })
    });
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    const data: unknown = await res.json();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
      // @ts-expect-error TS(2304): Cannot find name 'map'.
      return ((data as Record<string, unknown>)['data'] as unknown[]).map((d) => (typeof d === 'object' && d !== null && 'embedding' in d ? (d as Record<string, unknown>)['embedding'] : []));
    }
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    if (typeof data === 'object' && data !== null && 'embeddings' in data && Array.isArray((data as Record<string, unknown>)['embeddings'])) {
      return (data as Record<string, unknown>)['embeddings'];
    }
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    if (Array.isArray(data.data)) return data.data.map((d: unknown) => d.embedding ?? []);
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    if (Array.isArray(data.embeddings)) return data.embeddings;
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    if (Array.isArray(data.embedding)) return [data.embedding];
    return arr.map(() => []);
  }
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    try { await this.embed('hello'); return { status: 'ok', timestamp: new Date().toISOString() }; }
    catch { return { status: 'error', timestamp: new Date().toISOString() }; }
  }
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
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
const providers: Record<string, EmbeddingProvider> = {
  'hash-stub': new HashEmbeddingProvider(),
  'huggingface': new HuggingFaceEmbeddingProvider(),
  'ollama': new OllamaEmbeddingProvider(),
  'custom': new CustomEmbeddingProvider(),
  'petals': new PetalsEmbeddingProvider(),
  'lmstudio': new LMStudioEmbeddingProvider(),
  'http': new HttpEmbeddingProvider(),
};

export function getEmbeddingProvider(): EmbeddingProvider {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const selected = process.env['EMBEDDING_PROVIDER'] ?? 'hash-stub';
  const provider = providers[selected];
  if (provider) return provider;
  return providers['hash-stub']!;
} 