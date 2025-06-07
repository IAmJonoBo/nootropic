import { vi } from 'vitest';

export class CostTrackingService {
  trackCost = vi.fn();
  getTotalCost = vi.fn();
  resetCosts = vi.fn();
}

export class ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];

  constructor(config: Partial<ModelConfig> = {}) {
    this.model = config.model || '';
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.topP = config.topP;
    this.frequencyPenalty = config.frequencyPenalty;
    this.presencePenalty = config.presencePenalty;
    this.stopSequences = config.stopSequences;
  }
}

export class ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  constructor(text: string, usage: { promptTokens: number; completionTokens: number; totalTokens: number }) {
    this.text = text;
    this.usage = usage;
  }
} 