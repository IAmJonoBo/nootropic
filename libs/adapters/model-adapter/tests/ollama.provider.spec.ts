import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OllamaProvider } from '../src/providers/ollama.provider';
import { Logger } from '@nootropic/shared';
import { AgentError } from '@nootropic/runtime';

// Mock dependencies
vi.mock('@nootropic/shared', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock AgentError
vi.mock('@nootropic/runtime', () => ({
  AgentError: class AgentError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AgentError';
    }
  },
}));

// Mock fetch
let mockFetch: any;
global.fetch = mockFetch;

describe('OllamaProvider', () => {
  let provider: OllamaProvider;
  let mockLogger: Logger;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockFetch.mockReset();

    mockLogger = new Logger();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Create provider instance
    provider = new OllamaProvider({ baseUrl: 'http://test-ollama:11434' }, mockLogger);
  });

  describe('initialization', () => {
    it('should use default base URL', () => {
      const defaultProvider = new OllamaProvider({}, mockLogger);
      expect(defaultProvider).toBeDefined();
    });

    it('should use custom base URL from environment', () => {
      const customProvider = new OllamaProvider({ baseUrl: 'http://custom-ollama:11434' }, mockLogger);
      expect(customProvider).toBeDefined();
    });
  });

  describe('text generation', () => {
    const mockResponse = {
      response: 'Generated text',
      prompt_eval_count: 10,
      eval_count: 20,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });

    it('should generate text with default config', async () => {
      const result = await provider.generateText('Test prompt', { model: 'llama2' });

      expect(result).toEqual({
        text: 'Generated text',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Generating text with OllamaProvider');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-ollama:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama2',
            prompt: 'Test prompt',
            temperature: 0.7,
            max_tokens: undefined,
            top_p: undefined,
            frequency_penalty: undefined,
            presence_penalty: undefined,
            stop: undefined,
          }),
        })
      );
    });

    it('should generate text with custom config', async () => {
      const config = {
        model: 'llama2',
        temperature: 0.5,
        maxTokens: 100,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stopSequences: ['\n'],
      };

      await provider.generateText('Test prompt', config);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-ollama:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama2',
            prompt: 'Test prompt',
            temperature: 0.5,
            max_tokens: 100,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
            stop: ['\n'],
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        provider.generateText('Test prompt', { model: 'llama2' })
      ).rejects.toThrow('Ollama API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        provider.generateText('Test prompt', { model: 'llama2' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('model listing', () => {
    const mockModels = {
      models: [
        { name: 'llama2' },
        { name: 'mistral' },
      ],
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockModels),
      });
    });

    it('should list available models', async () => {
      const models = await provider.listModels();
      expect(models).toEqual(['llama2', 'mistral']);
      expect(mockFetch).toHaveBeenCalledWith('http://test-ollama:11434/api/tags');
      expect(mockLogger.info).toHaveBeenCalledWith('Listing models from OllamaProvider');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(provider.listModels()).rejects.toThrow('Ollama API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.listModels()).rejects.toThrow('Network error');
    });
  });

  describe('model pulling', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: () => Promise.resolve({ done: true, value: undefined }),
          }),
        },
      });
    });

    it('should pull model', async () => {
      await provider.pullModel('llama2');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-ollama:11434/api/pull',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'llama2' }),
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(`Pulling model llama2 from OllamaProvider`);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(provider.pullModel('llama2')).rejects.toThrow('Ollama API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.pullModel('llama2')).rejects.toThrow('Network error');
    });

    it('should handle missing response reader', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: null,
      });

      await expect(provider.pullModel('llama2')).rejects.toThrow('Response body is not readable');
    });
  });
}); 