import { Injectable } from "@nestjs/common";
import { Logger } from "../../../shared/src/logger.js";
import { ModelConfig, ModelResponse } from "../model.adapter.js";

@Injectable()
export class TabbyProvider {
  private readonly logger: Logger;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: Record<string, any>, logger: Logger) {
    this.logger = logger;
    this.baseUrl = config.baseUrl || "http://localhost:8080/v1";
    this.apiKey = config.apiKey;
    this.logger.info(`TabbyProvider initialized with endpoint: ${this.baseUrl}`);
  }

  async connect(): Promise<void> {
    this.logger.info("Connecting to Tabby provider");
    // Verify Tabby server is running
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error("Tabby server is not healthy");
      }
    } catch (error: unknown) {
      throw new Error(`Failed to connect to Tabby server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info("Disconnecting from Tabby provider");
    // No cleanup needed for Tabby
  }

  async generateText(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          prompt,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          frequency_penalty: config.frequencyPenalty,
          presence_penalty: config.presencePenalty,
          stop: config.stopSequences
        })
      });

      if (!response.ok) {
        throw new Error(`Tabby API error: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        text: choice.text,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error: unknown) {
      this.logger.error("Error generating text with Tabby", error);
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
        throw new Error(`Tabby API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error: unknown) {
      this.logger.error("Error listing Tabby models", error);
      throw error;
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      // Tabby models are typically pre-loaded on the server
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
        throw new Error(`Tabby API error: ${response.statusText}`);
      }
    } catch (error: unknown) {
      this.logger.error("Error reloading Tabby model", error);
      throw error;
    }
  }
}
