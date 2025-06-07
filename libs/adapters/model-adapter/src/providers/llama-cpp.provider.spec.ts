import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from "@nootropic/shared";
import { LlamaCppProvider } from "./llama-cpp.provider";
import * as fs from "fs";
import * as child_process from "child_process";

vi.mock("fs");
vi.mock("child_process");

interface MockSpawn {
  stdout: {
    on: (event: string, callback: (data: Buffer) => void) => MockSpawn["stdout"];
  };
  stderr: {
    on: (event: string, callback: (data: Buffer) => void) => MockSpawn["stderr"];
  };
  on: (event: string, callback: (code: number) => void) => MockSpawn;
}

describe("LlamaCppProvider", () => {
  let provider: LlamaCppProvider;
  let logger: Logger;

  beforeEach(() => {
    logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    provider = new LlamaCppProvider({}, logger);
    (fs.existsSync as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(true);
  });

  describe("connect", () => {
    it("should verify llama.cpp executable exists", async () => {
      await provider.connect();
      expect(fs.existsSync).toHaveBeenCalled();
    });

    it("should throw error if executable not found", async () => {
      (fs.existsSync as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(false);
      await expect(provider.connect()).rejects.toThrow("llama.cpp executable not found");
    });
  });

  describe("disconnect", () => {
    it("should kill process if running", async () => {
      const mockProcess = {
        kill: vi.fn(),
      };
      (provider as any).process = mockProcess;

      await provider.disconnect();
      expect(mockProcess.kill).toHaveBeenCalled();
    });

    it("should not throw if no process is running", async () => {
      (provider as any).process = undefined;
      await expect(provider.disconnect()).resolves.not.toThrow();
    });
  });

  describe("generateText", () => {
    it("should generate text using llama.cpp", async () => {
      const mockResponse = {
        text: "test response",
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      const mockSpawn: MockSpawn = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(JSON.stringify(mockResponse)));
            }
            return mockSpawn.stdout;
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
          return mockSpawn;
        }),
      };

      (child_process.spawn as vi.Mock).mockReturnValue(mockSpawn);

      const result = await provider.generateText("test prompt", { model: "test-model" });

      expect(child_process.spawn).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors from llama.cpp", async () => {
      const mockSpawn: MockSpawn = {
        stdout: {
          on: vi.fn(),
        },
        stderr: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from("Error message"));
            }
            return mockSpawn.stderr;
          }),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(1);
          }
          return mockSpawn;
        }),
      };

      (child_process.spawn as vi.Mock).mockReturnValue(mockSpawn);

      await expect(provider.generateText("test prompt", { model: "test-model" }))
        .rejects.toThrow("Failed to generate text with llama.cpp");
    });
  });

  describe("listModels", () => {
    it("should list models in model path", async () => {
      const mockFiles = ["model1.bin", "model2.bin"];
      (fs.readdirSync as unknown as { mockReturnValue: (v: string[]) => void }).mockReturnValue(mockFiles);

      const result = await provider.listModels();

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(result).toEqual(["model1", "model2"]);
    });

    it("should handle empty model directory", async () => {
      (fs.readdirSync as unknown as { mockReturnValue: (v: string[]) => void }).mockReturnValue([]);

      const result = await provider.listModels();

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("pullModel", () => {
    it("should throw error as not implemented", async () => {
      await expect(provider.pullModel("test-model"))
        .rejects.toThrow("Model pulling not implemented for llama.cpp");
    });
  });
}); 