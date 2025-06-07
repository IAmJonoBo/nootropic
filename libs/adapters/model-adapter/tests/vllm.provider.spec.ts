import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VllmProvider } from '../src/providers/vllm.provider';
import { Logger } from '@nootropic/shared';

// Mock dependencies
vi.mock('@nootropic/shared', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VllmProvider', () => {
  let provider: VllmProvider;
  let mockLogger: Logger;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Create mock logger
    mockLogger = new Logger();

    // Create provider instance
    provider = new VllmProvider({
      baseUrl: 'http://test-vllm:8000/v1',
      apiKey: 'test-key',
    }, mockLogger);
  });

  describe('initialization', () => {
    it('should use default base URL when not provided', () => {
      const defaultProvider = new VllmProvider({}, mockLogger);
      expect(defaultProvider).toBeDefined();
    });

    it('should use provided configuration', () => {
      const customProvider = new VllmProvider({
        baseUrl: 'http://custom-vllm:8000/v1',
        apiKey: 'custom-key',
      }, mockLogger);
      expect(customProvider).toBeDefined();
    });
  });

  describe('connection management', () => {
    it('should connect successfully when server is healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      await provider.connect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to vLLM provider');
      expect(mockFetch).toHaveBeenCalledWith('http://test-vllm:8000/v1/health');
    });

    it('should throw error when server is not healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      });

      await expect(provider.connect()).rejects.toThrow('vLLM server is not healthy');
    });

    it('should handle connection errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.connect()).rejects.toThrow('Failed to connect to vLLM server: Network error');
    });

    it('should disconnect without cleanup', async () => {
      await provider.disconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from vLLM provider');
    });
  });

  describe('text generation', () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Generated text',
        },
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
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

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-vllm:8000/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          },
          body: JSON.stringify({
            model: 'llama2',
            messages: [{ role: 'user', content: 'Test prompt' }],
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
        'http://test-vllm:8000/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          },
          body: JSON.stringify({
            model: 'llama2',
            messages: [{ role: 'user', content: 'Test prompt' }],
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
      ).rejects.toThrow('vLLM API error: Internal Server Error');
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
      data: [
        { id: 'llama2' },
        { id: 'mistral' },
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
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-vllm:8000/v1/models',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-key',
          },
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(provider.listModels()).rejects.toThrow('vLLM API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.listModels()).rejects.toThrow('Network error');
    });
  });

  describe('model reloading', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
      });
    });

    it('should reload model', async () => {
      await provider.pullModel('llama2');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-vllm:8000/v1/models/reload',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          },
          body: JSON.stringify({
            model: 'llama2',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(provider.pullModel('llama2')).rejects.toThrow('vLLM API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.pullModel('llama2')).rejects.toThrow('Network error');
    });
  });
}); 