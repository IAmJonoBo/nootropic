import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/shared";
import { ModelConfig, ModelResponse } from "../model.adapter.js";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LlamaCppProvider {
  private process: any;
  private modelPath: string;
  private executablePath: string;

  constructor(
    private readonly logger: Logger,
    config: { modelPath?: string; executablePath?: string } = {}
  ) {
    this.modelPath = config.modelPath || path.join(process.env.HOME || "", ".nootropic", "models");
    this.executablePath = config.executablePath || "llama.cpp/main";
    this.logger.info(`LlamaCppProvider initialized with executable: ${this.executablePath}`);
  }

  async connect(): Promise<void> {
    this.logger.info(`Connecting to LlamaCppProvider at ${this.executablePath}`);
    // Verify llama.cpp executable exists
    if (!fs.existsSync(this.executablePath)) {
      throw new Error(`llama.cpp executable not found at ${this.executablePath}`);
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info("Disconnecting from llama.cpp provider");
    if (this.process) {
      this.process.kill();
    }
  }

  async generateText(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    try {
      const modelFile = path.join(this.modelPath, `${config.model}.gguf`);
      if (!fs.existsSync(modelFile)) {
        throw new Error(`Model file not found: ${modelFile}`);
      }

      const args = [
        "-m", modelFile,
        "-p", prompt,
        "--temp", (config.temperature || 0.7).toString(),
        "--n-predict", (config.maxTokens || 2048).toString(),
        "--top-p", (config.topP || 0.9).toString(),
        "--repeat-penalty", (config.frequencyPenalty || 1.1).toString(),
      ];

      if (config.stopSequences?.length) {
        args.push("--stop", config.stopSequences.join(","));
      }

      return new Promise((resolve, reject) => {
        let output = "";
        let error = "";

        this.process = spawn(this.executablePath, args);

        this.process.stdout.on("data", (data: Buffer) => {
          output += data.toString();
        });

        this.process.stderr.on("data", (data: Buffer) => {
          error += data.toString();
        });

        this.process.on("close", (code: number) => {
          if (code !== 0) {
            reject(new Error(`llama.cpp process exited with code ${code}: ${error}`));
            return;
          }

          // Parse token counts from output
          const promptTokens = this.countTokens(prompt);
          const completionTokens = this.countTokens(output);
          
          resolve({
            text: output.trim(),
            usage: {
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens
            }
          });
        });
      });
    } catch (error) {
      this.logger.error("Error generating text with llama.cpp", error);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.modelPath);
      return files
        .filter(file => file.endsWith(".gguf"))
        .map(file => file.replace(".gguf", ""));
    } catch (error) {
      this.logger.error("Error listing llama.cpp models", error);
      throw error;
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      // Implementation would depend on where models are hosted
      // This could be Hugging Face, custom server, etc.
      throw new Error("Model pulling not implemented for llama.cpp yet");
    } catch (error) {
      this.logger.error("Error pulling llama.cpp model", error);
      throw error;
    }
  }

  private countTokens(text: string): number {
    // Simple token counting - in practice, should use the same tokenizer as the model
    return text.split(/\s+/).length;
  }
}