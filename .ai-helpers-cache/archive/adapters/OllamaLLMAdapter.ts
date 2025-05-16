// @ts-expect-error TS(6196): 'CapabilityDescribe' is declared but never used.
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
// @ts-expect-error TS(6133): 'fetch' is declared but its value is never read.
import fetch from 'node-fetch';

// @ts-expect-error TS(6133): 'DEFAULT_OLLAMA_URL' is declared but its value is ... Remove this comment to see the full error message
const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

// @ts-expect-error TS(2420): Class 'OllamaLLMAdapter' incorrectly implements in... Remove this comment to see the full error message
export class OllamaLLMAdapter implements Capability {
  public readonly name = 'OllamaLLMAdapter';

  // @ts-expect-error TS(7010): 'getOllamaUrl', which lacks return-type annotation... Remove this comment to see the full error message
  getOllamaUrl(options?: Record<string, unknown>): string {
    return (options && options['apiUrl'] as string) ?? (process.env['OLLAMA_API_URL'] || DEFAULT_OLLAMA_URL);
  }

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async generateText(prompt: string, model = 'llama2', options?: Record<string, unknown>): Promise<string> {
    // @ts-expect-error TS(2552): Cannot find name 'url'. Did you mean 'URL'?
    const url = `${this.getOllamaUrl(options)}/api/generate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model, prompt, stream: false, ...(options && options['parameters'] ? options['parameters'] : {}) })
    });
    // @ts-expect-error TS(2304): Cannot find name 'Ollama'.
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'response' in data && typeof (data as Record<string, unknown>)['response'] === 'string') {
      return (data as Record<string, unknown>)['response'] as string;
    }
    throw new Error('Unexpected Ollama API response');
  }

  async embedText(text: string, model = 'llama2', options?: Record<string, unknown>): Promise<number[]> {
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const url = `${this.getOllamaUrl(options)}/api/embeddings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model, prompt: text })
    });
    // @ts-expect-error TS(2304): Cannot find name 'Ollama'.
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'embedding' in data && Array.isArray((data as Record<string, unknown>)['embedding'])) {
      return (data as Record<string, unknown>)['embedding'] as number[];
    }
    return [];
  }

  async getModelInfo(model: string, options?: Record<string, unknown>): Promise<Record<string, unknown>> {
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const url = `${this.getOllamaUrl(options)}/api/show`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model })
    });
    // @ts-expect-error TS(2304): Cannot find name 'Ollama'.
    if (!res.ok) throw new Error(`Ollama model info error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    return data as Record<string, unknown>;
  }

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  describe(): CapabilityDescribe {
    return {
      name: 'OllamaLLMAdapter',
      description: 'Adapter for Ollama local LLM server. Supports text generation, embeddings (if available), and model info. Registry/describe/health compliant.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/jmorganca/ollama',
      methods: [
        { name: 'generateText', signature: '(prompt, model?, options?) => Promise<string>', description: 'Generate text using an Ollama model.' },
        { name: 'embedText', signature: '(text, model?, options?) => Promise<number[]>', description: 'Get embeddings for text using an Ollama model (if supported).' },
        { name: 'getModelInfo', signature: '(model, options?) => Promise<Record<string, unknown>>', description: 'Get model metadata from Ollama.' },
        { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' },
        { name: 'describe', signature: '() => CapabilityDescribe', description: 'Describe this adapter.' }
      ],
      usage: "import { OllamaLLMAdapter } from 'nootropic/adapters/OllamaLLMAdapter'; const adapter = new OllamaLLMAdapter(); await adapter.generateText('Hello!');",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://github.com/jmorganca/ollama'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'OllamaLLMAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; } 