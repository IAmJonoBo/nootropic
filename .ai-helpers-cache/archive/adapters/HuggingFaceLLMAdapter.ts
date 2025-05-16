// @ts-expect-error TS(6196): 'CapabilityDescribe' is declared but never used.
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
import fetch from 'node-fetch';

const HF_API_URL = 'https://api-inference.huggingface.co/models/';

// @ts-expect-error TS(2420): Class 'HuggingFaceLLMAdapter' incorrectly implemen... Remove this comment to see the full error message
export class HuggingFaceLLMAdapter implements Capability {
  public readonly name = 'HuggingFaceLLMAdapter';

  // @ts-expect-error TS(7010): 'generateText', which lacks return-type annotation... Remove this comment to see the full error message
  async generateText(prompt: string, model = 'bigscience/bloom-560m', options?: Record<string, unknown>): Promise<string> {
    // @ts-expect-error TS(2304): Cannot find name 'apiKey'.
    const apiKey = (options && options['apiKey'] as string) ?? process.env['HUGGINGFACE_API_KEY'];
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!apiKey) throw new Error('HuggingFace API key required');
    // @ts-expect-error TS(2552): Cannot find name 'url'. Did you mean 'URL'?
    const url = `${HF_API_URL}${model}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, parameters: options && options['parameters'] ? options['parameters'] : {} })
    });
    // @ts-expect-error TS(2304): Cannot find name 'HuggingFace'.
    if (!res.ok) throw new Error(`HuggingFace API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (Array.isArray(data) && typeof data[0]?.generated_text === 'string') return data[0].generated_text;
    if (typeof data === 'object' && data !== null && 'generated_text' in data && typeof (data as Record<string, unknown>)['generated_text'] === 'string') {
      return (data as Record<string, unknown>)['generated_text'] as string;
    }
    throw new Error('Unexpected HuggingFace API response');
  }

  async embedText(text: string, model = 'sentence-transformers/all-MiniLM-L6-v2', options?: Record<string, unknown>): Promise<number[]> {
    const apiKey = (options && options['apiKey'] as string) ?? process.env['HUGGINGFACE_API_KEY'];
    if (!apiKey) throw new Error('HuggingFace API key required');
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const url = `${HF_API_URL}${model}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ inputs: text })
    });
    // @ts-expect-error TS(2304): Cannot find name 'HuggingFace'.
    if (!res.ok) throw new Error(`HuggingFace API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0]?.embedding)) return data[0].embedding as number[];
    if (typeof data === 'object' && data !== null && 'embedding' in data && Array.isArray((data as Record<string, unknown>)['embedding'])) {
      return (data as Record<string, unknown>)['embedding'] as number[];
    }
    return [];
  }

  async getModelInfo(model: string): Promise<Record<string, unknown>> {
    // @ts-expect-error TS(1344): 'A label is not allowed here.
    const url = `https://huggingface.co/api/models/${model}`;
    // @ts-expect-error TS(2304): Cannot find name 'url'.
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    if (!res.ok) throw new Error(`HuggingFace model info error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    return data as Record<string, unknown>;
  }

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  describe(): CapabilityDescribe {
    return {
      name: 'HuggingFaceLLMAdapter',
      description: 'Adapter for HuggingFace Inference API. Supports text generation, embeddings, and model info. Registry/describe/health compliant.',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://huggingface.co/docs/api-inference/index',
      methods: [
        { name: 'generateText', signature: '(prompt, model?, options?) => Promise<string>', description: 'Generate text using a HuggingFace model.' },
        { name: 'embedText', signature: '(text, model?, options?) => Promise<number[]>', description: 'Get embeddings for text using a HuggingFace model.' },
        { name: 'getModelInfo', signature: '(model) => Promise<Record<string, unknown>>', description: 'Get model metadata from HuggingFace.' },
        { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' },
        { name: 'describe', signature: '() => CapabilityDescribe', description: 'Describe this adapter.' }
      ],
      usage: "import { HuggingFaceLLMAdapter } from 'nootropic/adapters/HuggingFaceLLMAdapter'; const adapter = new HuggingFaceLLMAdapter(); await adapter.generateText('Hello!');",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://huggingface.co/docs/api-inference/index'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'HuggingFaceLLMAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; } 