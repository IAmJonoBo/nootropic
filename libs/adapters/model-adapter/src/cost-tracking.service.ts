import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/shared";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

@Injectable()
export class CostTrackingService {
  private readonly logger: Logger;
  private readonly costPerToken: Record<string, number> = {};

  constructor() {
    this.logger = new Logger();
  }

  async track(modelId: string, usage: TokenUsage): Promise<void> {
    try {
      const cost = this.calculateCost(modelId, usage);
      this.logger.info(`Cost for model ${modelId}: ${cost}`);
    } catch (error) {
      this.logger.error(`Error tracking cost for model ${modelId}: ${error}`);
    }
  }

  private calculateCost(modelId: string, usage: TokenUsage): number {
    const costPerToken = this.costPerToken[modelId] || 0.0001; // Default cost per token
    return usage.totalTokens * costPerToken;
  }

  setCostPerToken(modelId: string, cost: number): void {
    this.costPerToken[modelId] = cost;
  }
} 