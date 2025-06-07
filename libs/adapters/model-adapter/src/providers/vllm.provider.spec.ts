import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from "@nootropic/shared";
import { VllmProvider } from "./vllm.provider";
import * as fs from "fs";
import * as child_process from "child_process";

// Mock fetch
global.fetch = jest.fn();

vi.mock("fs");
vi.mock("child_process");

describe("VllmProvider", () => {
  let provider: VllmProvider;
  let logger: Logger;

  beforeEach(() => {
    logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    provider = new VllmProvider({}, logger);
    (global.fetch as any).mockReset && (global.fetch as any).mockReset();
    (fs.existsSync as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(true);
  });

  describe("connect", () => {
    it("should verify vLLM server is healthy", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await provider.connect();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/health"));
    });

    it("should throw error if server is not healthy", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "Server Error",
      });

      await expect(provider.connect()).rejects.toThrow("vLLM server is not healthy");
    });

    it("should throw error if server is unreachable", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(provider.connect()).rejects.toThrow("Failed to connect to vLLM server");
    });
  });

  describe("disconnect", () => {
    it("should not throw", async () => {
      await expect(provider.disconnect()).resolves.not.toThrow();
    });
  });

  describe("generateText", () => {
    it("should generate text using vLLM", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "test response",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.generateText("test prompt", { model: "test-model" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
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

    it("should include API key in headers if provided", async () => {
      const provider = new VllmProvider({ apiKey: "test-key" }, logger);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: "test" } }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        }),
      });

      await provider.generateText("test prompt", { model: "test-model" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
          }),
        })
      );
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.generateText("test prompt", { model: "test-model" }))
        .rejects.toThrow("vLLM API error: API Error");
    });
  });

  describe("listModels", () => {
    it("should list available models", async () => {
      const mockResponse = {
        data: [
          { id: "model1" },
          { id: "model2" },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.listModels();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/models"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result).toEqual(["model1", "model2"]);
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.listModels()).rejects.toThrow("vLLM API error: API Error");
    });
  });

  describe("pullModel", () => {
    it("should trigger model reload", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await provider.pullModel("test-model");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/models/reload"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("test-model"),
        })
      );
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(provider.pullModel("test-model")).rejects.toThrow("vLLM API error: API Error");
    });
  });
}); 