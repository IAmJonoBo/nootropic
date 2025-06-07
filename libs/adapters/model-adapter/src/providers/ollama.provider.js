var OllamaProvider_1;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
let OllamaProvider = (OllamaProvider_1 = class OllamaProvider {
  constructor() {
    this.logger = new Logger(OllamaProvider_1.name);
    this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }
  async generateText(prompt, config) {
    try {
      this.logger.info("Generating text with Ollama", { model: config.model });
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          prompt,
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens,
        }),
      });
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        text: data.response,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      throw new AgentError("Failed to generate text with Ollama", {
        cause: error,
      });
    }
  }
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.models.map((model) => model.name);
    } catch (error) {
      throw new AgentError("Failed to list Ollama models", { cause: error });
    }
  }
  async pullModel(model) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: model }),
      });
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      // Wait for pull to complete
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Process streaming response if needed
      }
    } catch (error) {
      throw new AgentError("Failed to pull Ollama model", { cause: error });
    }
  }
});
OllamaProvider = OllamaProvider_1 = __decorate(
  [Injectable(), __metadata("design:paramtypes", [])],
  OllamaProvider,
);
export { OllamaProvider };
//# sourceMappingURL=ollama.provider.js.map
