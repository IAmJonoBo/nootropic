import { ModelConfig, ModelResponse } from "../model.adapter";
export declare class OllamaProvider {
  private readonly logger;
  private readonly baseUrl;
  constructor();
  generateText(prompt: string, config: ModelConfig): Promise<ModelResponse>;
  listModels(): Promise<string[]>;
  pullModel(model: string): Promise<void>;
}
