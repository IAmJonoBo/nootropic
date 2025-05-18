import fetch from 'node-fetch';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/';
export class OpenRouterLLMAdapter {
    name = 'OpenRouterLLMAdapter';
    async generateText(prompt, model = 'openai/gpt-3.5-turbo', options) {
        const apiKey = (options && options['apiKey']) ?? process.env['OPENROUTER_API_KEY'];
        if (!apiKey)
            throw new Error('OpenRouter API key required');
        const url = `${OPENROUTER_API_URL}chat/completions`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
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
        if (!res.ok)
            throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (typeof data === 'object' &&
            data !== null &&
            'choices' in data &&
            Array.isArray(data['choices'])) {
            const choices = data['choices'];
            if (choices[0] &&
                typeof choices[0] === 'object' &&
                choices[0] !== null &&
                'message' in choices[0] &&
                typeof choices[0]['message'] === 'object' &&
                choices[0]['message'] !== null &&
                'content' in choices[0]['message'] &&
                typeof choices[0]['message']['content'] === 'string') {
                return choices[0]['message']['content'];
            }
        }
        throw new Error('Unexpected OpenRouter API response');
    }
    async embedText(text, model = 'openai/text-embedding-ada-002', options) {
        const apiKey = (options && options['apiKey']) ?? process.env['OPENROUTER_API_KEY'];
        if (!apiKey)
            throw new Error('OpenRouter API key required');
        const url = `${OPENROUTER_API_URL}embeddings`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                model,
                input: text
            })
        });
        if (!res.ok)
            throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (typeof data === 'object' &&
            data !== null &&
            'data' in data &&
            Array.isArray(data['data'])) {
            const dataArr = data['data'];
            if (dataArr[0] &&
                typeof dataArr[0] === 'object' &&
                dataArr[0] !== null &&
                'embedding' in dataArr[0] &&
                Array.isArray(dataArr[0]['embedding'])) {
                return dataArr[0]['embedding'];
            }
        }
        return [];
    }
    async getModelInfo(model) {
        // OpenRouter does not have a public model info endpoint; return model name and reference
        return { model, reference: 'https://openrouter.ai/docs' };
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    describe() {
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
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'OpenRouterLLMAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; }
