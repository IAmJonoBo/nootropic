import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from "@nootropic/shared";
import { OllamaProvider } from "./ollama.provider";
import * as fs from "fs";
import * as child_process from "child_process";

vi.mock("fs");
vi.mock("child_process");

// Mock fetch
global.fetch = jest.fn();

describe("OllamaProvider", () => {
  let provider: OllamaProvider;
  let logger: Logger;

  beforeEach(() => {
    logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    provider = new OllamaProvider({}, logger);
    (global.fetch as any).mockReset && (global.fetch as any).mockReset();
    (fs.existsSync as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(true);
  });

  describe("generateText", () => {
    it("should generate text using Ollama", async () => {
      const mockResponse = {
        response: "test response",
        prompt_eval_count: 10,
        eval_count: 20,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.generateText("test prompt", { model: "test-model" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/generate"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("test prompt"),
        })
      );

      expect(result).toEqual({
        text: "test response",
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      });
    });

    it("should handle missing token counts", async () => {
      const mockResponse = {
        response: "test response",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.generateText("test prompt", { model: "test-model" });

      expect(result).toEqual({
        text: "test response",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      });
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.generateText("test prompt", { model: "test-model" }))
        .rejects.toThrow("Failed to generate text with Ollama");
    });
  });

  describe("listModels", () => {
    it("should list available models", async () => {
      const mockResponse = {
        models: [
          { name: "model1" },
          { name: "model2" },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.listModels();

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/tags"));
      expect(result).toEqual(["model1", "model2"]);
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.listModels()).rejects.toThrow("Failed to list Ollama models");
    });
  });

  describe("pullModel", () => {
    it("should pull model from Ollama", async () => {
      const mockReader = {
        read: jest.fn().mockResolvedValueOnce({ done: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      await provider.pullModel("test-model");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/pull"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("test-model"),
        })
      );
    });

    it("should handle missing response reader", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      await expect(provider.pullModel("test-model")).rejects.toThrow("Failed to get response reader");
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.pullModel("test-model")).rejects.toThrow("Failed to pull Ollama model");
    });
  });
}); 