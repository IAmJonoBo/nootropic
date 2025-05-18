import fetch from 'node-fetch';
const HF_API_URL = 'https://api-inference.huggingface.co/models/';
export class HuggingFaceLLMAdapter {
    name = 'HuggingFaceLLMAdapter';
    async generateText(prompt, model = 'bigscience/bloom-560m', options) {
        const apiKey = (options && options['apiKey']) ?? process.env['HUGGINGFACE_API_KEY'];
        if (!apiKey)
            throw new Error('HuggingFace API key required');
        const url = `${HF_API_URL}${model}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt, parameters: options && options['parameters'] ? options['parameters'] : {} })
        });
        if (!res.ok)
            throw new Error(`HuggingFace API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (Array.isArray(data) && typeof data[0]?.generated_text === 'string')
            return data[0].generated_text;
        if (typeof data === 'object' && data !== null && 'generated_text' in data && typeof data['generated_text'] === 'string') {
            return data['generated_text'];
        }
        throw new Error('Unexpected HuggingFace API response');
    }
    async embedText(text, model = 'sentence-transformers/all-MiniLM-L6-v2', options) {
        const apiKey = (options && options['apiKey']) ?? process.env['HUGGINGFACE_API_KEY'];
        if (!apiKey)
            throw new Error('HuggingFace API key required');
        const url = `${HF_API_URL}${model}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ inputs: text })
        });
        if (!res.ok)
            throw new Error(`HuggingFace API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0]?.embedding))
            return data[0].embedding;
        if (typeof data === 'object' && data !== null && 'embedding' in data && Array.isArray(data['embedding'])) {
            return data['embedding'];
        }
        return [];
    }
    async getModelInfo(model) {
        const url = `https://huggingface.co/api/models/${model}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok)
            throw new Error(`HuggingFace model info error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        return data;
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    describe() {
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
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'HuggingFaceLLMAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; }
