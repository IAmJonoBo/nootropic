import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/shared";
import { AgentError } from "@nootropic/runtime";
import { ModelConfig, ModelResponse } from "../model.adapter.js";

@Injectable()
export class OllamaProvider {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    this.logger = new Logger("OllamaProvider");
    this.logger.info(`OllamaProvider initialized with endpoint: ${this.baseUrl}`);
  }

  async generateText(
    prompt: string,
    config: ModelConfig,
  ): Promise<ModelResponse> {
    try {
      this.logger.info('Generating text with OllamaProvider');

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          prompt,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          frequency_penalty: config.frequencyPenalty,
          presence_penalty: config.presencePenalty,
          stop: config.stopSequences,
        }),
      });

      if (!response.ok) {
        throw new AgentError(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.response,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
      };
    } catch (error) {
      this.logger.error("Failed to generate text with Ollama", error);
      throw new AgentError("Failed to generate text with Ollama");
    }
  }

  async listModels(): Promise<string[]> {
    try {
      this.logger.info('Listing models from OllamaProvider');
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new AgentError(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models.map((model: any) => model.name);
    } catch (error) {
      this.logger.error("Failed to list Ollama models", error);
      throw new AgentError("Failed to list Ollama models");
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      this.logger.info(`Pulling model ${model} from OllamaProvider`);
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: model }),
      });

      if (!response.ok) {
        throw new AgentError(`Ollama API error: ${response.statusText}`);
      }

      // Wait for pull to complete
      const reader = response.body?.getReader();
      if (!reader) {
        throw new AgentError("Failed to get response reader");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Process streaming response if needed
      }
    } catch (error) {
      this.logger.error("Failed to pull Ollama model", error);
      throw new AgentError("Failed to pull Ollama model");
    }
  }
}
