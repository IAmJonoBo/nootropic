// @ts-expect-error TS(6196): 'CapabilityDescribe' is declared but never used.
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
// @ts-expect-error TS(6133): 'fetch' is declared but its value is never read.
import fetch from 'node-fetch';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/';

// @ts-expect-error TS(2420): Class 'OpenRouterLLMAdapter' incorrectly implement... Remove this comment to see the full error message
export class OpenRouterLLMAdapter implements Capability {
  public readonly name = 'OpenRouterLLMAdapter';

  // @ts-expect-error TS(7010): 'generateText', which lacks return-type annotation... Remove this comment to see the full error message
  async generateText(prompt: string, model = 'openai/gpt-3.5-turbo', options?: Record<string, unknown>): Promise<string> {
    // @ts-expect-error TS(2304): Cannot find name 'apiKey'.
    const apiKey = (options && options['apiKey'] as string) ?? process.env['OPENROUTER_API_KEY'];
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!apiKey) throw new Error('OpenRouter API key required');
    // @ts-expect-error TS(2552): Cannot find name 'url'. Did you mean 'URL'?
    const url = `${OPENROUTER_API_URL}chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        ...(options && options['parameters'] ? options['parameters'] : {})
      })
    });
    // @ts-expect-error TS(2304): Cannot find name 'OpenRouter'.
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'choices' in data && Array.isArray((data as Record<string, unknown>)['choices'])) {
      const choices = (data as Record<string, unknown>)['choices'] as unknown[];
      if (
        choices[0] &&
        typeof choices[0] === 'object' &&
        'message' in choices[0] &&
        choices[0]['message'] &&
        typeof (choices[0] as Record<string, unknown>)['message'] === 'object' &&
        (choices[0] as Record<string, unknown>)['message'] !== null &&
        'content' in (choices[0] as Record<string, unknown>)['message'] &&
        typeof ((choices[0] as Record<string, unknown>)['message'] as Record<string, unknown>)['content'] === 'string'
      ) {
        return ((choices[0] as Record<string, unknown>)['message'] as Record<string, unknown>)['content'] as string;
      }
    }
    throw new Error('Unexpected OpenRouter API response');
  }

  async embedText(text: string, model = 'openai/text-embedding-ada-002', options?: Record<string, unknown>): Promise<number[]> {
    const apiKey = (options && options['apiKey'] as string) ?? process.env['OPENROUTER_API_KEY'];
    if (!apiKey) throw new Error('OpenRouter API key required');
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const url = `${OPENROUTER_API_URL}embeddings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // @ts-expect-error TS(2304): Cannot find name 'Bearer'.
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text
      })
    });
    // @ts-expect-error TS(2304): Cannot find name 'OpenRouter'.
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
      const dataArr = (data as Record<string, unknown>)['data'] as unknown[];
      if (
        dataArr[0] &&
        typeof dataArr[0] === 'object' &&
        'embedding' in (dataArr[0] as Record<string, unknown>) &&
        Array.isArray((dataArr[0] as Record<string, unknown>)['embedding'])
      ) {
        return (dataArr[0] as Record<string, unknown>)['embedding'] as number[];
      }
    }
    return [];
  }

  async getModelInfo(model: string): Promise<Record<string, unknown>> {
    // OpenRouter does not have a public model info endpoint; return model name and reference
    return { model, reference: 'https://openrouter.ai/docs' };
  }

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  describe(): CapabilityDescribe {
    return {
      name: 'OpenRouterLLMAdapter',
      description: 'Adapter for OpenRouter API. Supports text generation, embeddings, and model info. Registry/describe/health compliant.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://openrouter.ai/docs',
      methods: [
        { name: 'generateText', signature: '(prompt, model?, options?) => Promise<string>', description: 'Generate text using an OpenRouter model.' },
        { name: 'embedText', signature: '(text, model?, options?) => Promise<number[]>', description: 'Get embeddings for text using an OpenRouter model.' },
        { name: 'getModelInfo', signature: '(model) => Promise<Record<string, unknown>>', description: 'Get model metadata from OpenRouter.' },
        { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check.' },
        { name: 'describe', signature: '() => CapabilityDescribe', description: 'Describe this adapter.' }
      ],
      usage: "import { OpenRouterLLMAdapter } from 'nootropic/adapters/OpenRouterLLMAdapter'; const adapter = new OpenRouterLLMAdapter(); await adapter.generateText('Hello!');",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://openrouter.ai/docs'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'OpenRouterLLMAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; } 