import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class AnthropicClient {
  private readonly client: Anthropic;

  constructor(options: AnthropicClientOptions = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: options.baseUrl,
    });
  }

  async generateText(prompt: string, options: { model: string; maxTokens?: number; systemPrompt?: string; temperature?: number }) {
    const response = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens ?? 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: options.systemPrompt,
      temperature: options.temperature,
    });
    const contentBlock = response.content?.[0];
    const text = contentBlock && 'text' in contentBlock ? contentBlock.text : '';
    return {
      text,
      usage: response.usage,
      model: options.model,
    };
  }
}
