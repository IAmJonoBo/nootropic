import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from "@nootropic/shared";
import { LocalModelProvider } from "./local-model.provider";
import { OllamaProvider } from "./ollama.provider";
import { LlamaCppProvider } from "./llama-cpp.provider";
import { VllmProvider } from "./vllm.provider";
import { TabbyProvider } from "./tabby.provider";
import * as fs from "fs";
import * as child_process from "child_process";

// Mock the providers
vi.mock("./ollama.provider");
vi.mock("./llama-cpp.provider");
vi.mock("./vllm.provider");
vi.mock("./tabby.provider");

vi.mock("fs");
vi.mock("child_process");

describe("LocalModelProvider", () => {
  let provider: LocalModelProvider;
  let logger: Logger;

  beforeEach(() => {
    logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    provider = new LocalModelProvider({}, logger);
    (fs.existsSync as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(true);
  });

  describe("constructor", () => {
    it("should create OllamaProvider by default", () => {
      new LocalModelProvider({}, logger);
      expect(OllamaProvider).toHaveBeenCalled();
    });

    it("should create LlamaCppProvider when specified", () => {
      new LocalModelProvider({ backend: "llama.cpp" }, logger);
      expect(LlamaCppProvider).toHaveBeenCalled();
    });

    it("should create VllmProvider when specified", () => {
      new LocalModelProvider({ backend: "vllm" }, logger);
      expect(VllmProvider).toHaveBeenCalled();
    });

    it("should create TabbyProvider when specified", () => {
      new LocalModelProvider({ backend: "tabby" }, logger);
      expect(TabbyProvider).toHaveBeenCalled();
    });

    it("should throw error for unsupported backend", () => {
      expect(() => {
        new LocalModelProvider({ backend: "unsupported" }, logger);
      }).toThrow("Unsupported local backend: unsupported");
    });
  });

  describe("connect", () => {
    it("should call connect on provider if available", async () => {
      const mockProvider = {
        connect: vi.fn(),
        generateText: vi.fn(),
        listModels: vi.fn(),
        pullModel: vi.fn(),
      };
      (LlamaCppProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({ backend: "llama.cpp" }, logger);
      await provider.connect();

      expect(mockProvider.connect).toHaveBeenCalled();
    });

    it("should not throw if connect is not available", async () => {
      const mockProvider = {
        generateText: vi.fn(),
        listModels: vi.fn(),
        pullModel: vi.fn(),
      };
      (OllamaProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({}, logger);
      await expect(provider.connect()).resolves.not.toThrow();
    });
  });

  describe("disconnect", () => {
    it("should call disconnect on provider if available", async () => {
      const mockProvider = {
        disconnect: vi.fn(),
        generateText: vi.fn(),
        listModels: vi.fn(),
        pullModel: vi.fn(),
      };
      (LlamaCppProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({ backend: "llama.cpp" }, logger);
      await provider.disconnect();

      expect(mockProvider.disconnect).toHaveBeenCalled();
    });

    it("should not throw if disconnect is not available", async () => {
      const mockProvider = {
        generateText: vi.fn(),
        listModels: vi.fn(),
        pullModel: vi.fn(),
      };
      (OllamaProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({}, logger);
      await expect(provider.disconnect()).resolves.not.toThrow();
    });
  });

  describe("generate", () => {
    it("should call generateText on provider", async () => {
      const mockResponse = {
        text: "test response",
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };
      const mockProvider = {
        generateText: vi.fn().mockResolvedValue(mockResponse),
        listModels: vi.fn(),
        pullModel: vi.fn(),
      };
      (OllamaProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({}, logger);
      const result = await provider.generate("test prompt", { model: "test-model" });

      expect(mockProvider.generateText).toHaveBeenCalledWith("test prompt", {
        model: "test-model",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("listModels", () => {
    it("should call listModels on provider", async () => {
      const mockModels = ["model1", "model2"];
      const mockProvider = {
        generateText: vi.fn(),
        listModels: vi.fn().mockResolvedValue(mockModels),
        pullModel: vi.fn(),
      };
      (OllamaProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({}, logger);
      const result = await provider.listModels();

      expect(mockProvider.listModels).toHaveBeenCalled();
      expect(result).toEqual(mockModels);
    });
  });

  describe("pullModel", () => {
    it("should call pullModel on provider", async () => {
      const mockProvider = {
        generateText: vi.fn(),
        listModels: vi.fn(),
        pullModel: vi.fn().mockResolvedValue(undefined),
      };
      (OllamaProvider as vi.Mock).mockImplementation(() => mockProvider);

      const provider = new LocalModelProvider({}, logger);
      await provider.pullModel("test-model");

      expect(mockProvider.pullModel).toHaveBeenCalledWith("test-model");
    });
  });
}); 