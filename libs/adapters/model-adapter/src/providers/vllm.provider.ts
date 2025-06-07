import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/shared";
import { ModelConfig, ModelResponse } from "../model.adapter.js";

@Injectable()
export class VllmProvider {
  private readonly logger: Logger;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: Record<string, any>, logger: Logger) {
    this.logger = logger;
    this.baseUrl = config.baseUrl || "http://localhost:8000/v1";
    this.apiKey = config.apiKey;
    this.logger.info(`VLLMProvider initialized with endpoint: ${this.baseUrl}`);
  }

  async connect(): Promise<void> {
    this.logger.info("Connecting to vLLM provider");
    // Verify vLLM server is running
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error("vLLM server is not healthy");
      }
    } catch (error: unknown) {
      throw new Error(`Failed to connect to vLLM server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info("Disconnecting from vLLM provider");
    // No cleanup needed for vLLM
  }

  async generateText(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      this.logger.info(`Generating text with VLLMProvider: ${JSON.stringify(config)}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          frequency_penalty: config.frequencyPenalty,
          presence_penalty: config.presencePenalty,
          stop: config.stopSequences
        })
      });

      if (!response.ok) {
        throw new Error(`vLLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        text: choice.message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      this.logger.error("Error generating text with vLLM", error);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/models`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`vLLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      this.logger.error("Error listing vLLM models", error);
      throw error;
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      // vLLM models are typically pre-loaded on the server
      // This method could be used to trigger a model reload
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/models/reload`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model })
      });

      if (!response.ok) {
        throw new Error(`vLLM API error: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error("Error reloading vLLM model", error);
      throw error;
    }
  }
} 