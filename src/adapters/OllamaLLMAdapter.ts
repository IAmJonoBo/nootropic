// @ts-ignore
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
import fetch from 'node-fetch';

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

export class OllamaLLMAdapter implements Capability {
  public readonly name = 'OllamaLLMAdapter';

  getOllamaUrl(options?: Record<string, unknown>): string {
    return (options && options['apiUrl'] as string) ?? (process.env['OLLAMA_API_URL'] || DEFAULT_OLLAMA_URL);
  }

  async generateText(prompt: string, model = 'llama2', options?: Record<string, unknown>): Promise<string> {
    const url = `${this.getOllamaUrl(options)}/api/generate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model, prompt, stream: false, ...(options && options['parameters'] ? options['parameters'] : {}) })
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'response' in data && typeof (data as Record<string, unknown>)['response'] === 'string') {
      return (data as Record<string, unknown>)['response'] as string;
    }
    throw new Error('Unexpected Ollama API response');
  }

  async embedText(text: string, model = 'llama2', options?: Record<string, unknown>): Promise<number[]> {
    const url = `${this.getOllamaUrl(options)}/api/embeddings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model, prompt: text })
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'embedding' in data && Array.isArray((data as Record<string, unknown>)['embedding'])) {
      return (data as Record<string, unknown>)['embedding'] as number[];
    }
    return [];
  }

  async getModelInfo(model: string, options?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const url = `${this.getOllamaUrl(options)}/api/show`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ model })
    });
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
export async function describe() { return new OllamaLLMAdapter().describe(); } 