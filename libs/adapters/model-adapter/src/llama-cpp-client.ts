/**
 * Client for interacting with Llama.cpp models
 * @todo Implement full Llama.cpp integration
 */
export class LlamaCppClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
  }

  async generateText(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stopSequences?: string[];
    } = {},
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        stop: options.stopSequences,
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama.cpp API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].text;
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`);
    if (!response.ok) {
      throw new Error(`Llama.cpp API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.map((model: any) => model.id);
  }
}
