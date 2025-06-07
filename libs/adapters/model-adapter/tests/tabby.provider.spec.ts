import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabbyProvider } from '../src/providers/tabby.provider';
import { Logger } from '@nootropic/shared';

describe('TabbyProvider', () => {
  let provider: TabbyProvider;
  let mockLogger: Logger;
  let mockFetch: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    provider = new TabbyProvider({ baseUrl: 'http://test-tabby:8080' }, mockLogger);
  });

  describe('initialization', () => {
    it('should use default base URL', () => {
      const defaultProvider = new TabbyProvider({}, mockLogger);
      expect(defaultProvider).toBeDefined();
    });

    it('should use custom base URL from environment', () => {
      const customProvider = new TabbyProvider({ baseUrl: 'http://custom-tabby:8080' }, mockLogger);
      expect(customProvider).toBeDefined();
    });
  });

  describe('connection management', () => {
    it('should connect successfully when server is healthy', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await provider.connect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to Tabby provider');
      expect(mockFetch).toHaveBeenCalledWith('http://test-tabby:8080/v1/health');
    });

    it('should throw error when server is not healthy', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(provider.connect()).rejects.toThrow('Tabby server is not healthy');
    });

    it('should handle connection errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.connect()).rejects.toThrow('Failed to connect to Tabby server: Network error');
    });

    it('should disconnect without cleanup', async () => {
      await provider.disconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from Tabby provider');
    });
  });

  describe('text generation', () => {
    it('should generate text with default config', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ text: 'Generated text' }) });
      const result = await provider.generateText('Test prompt', { model: 'tabby' });
      expect(result).toEqual({ text: 'Generated text', usage: undefined });
      expect(mockLogger.info).toHaveBeenCalledWith('Generating text with TabbyProvider: {"model":"tabby"}');
    });

    it('should generate text with custom config', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ text: 'Generated text' }) });
      const config = { model: 'tabby', temperature: 0.7 };
      await provider.generateText('Test prompt', config);
      expect(mockFetch).toHaveBeenCalledWith('http://test-tabby:8080/v1/completions', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt', ...config }),
      }));
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(provider.generateText('Test prompt', { model: 'tabby' })).rejects.toThrow('Tabby API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.generateText('Test prompt', { model: 'tabby' })).rejects.toThrow('Network error');
    });
  });

  describe('model listing', () => {
    it('should list available models', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ models: ['tabby', 'mistral'] }) });
      const models = await provider.listModels();
      expect(models).toEqual(['tabby', 'mistral']);
      expect(mockFetch).toHaveBeenCalledWith('http://test-tabby:8080/v1/models');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(provider.listModels()).rejects.toThrow('Tabby API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.listModels()).rejects.toThrow('Network error');
    });
  });

  describe('model pulling', () => {
    it('should pull model', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await provider.pullModel('tabby');
      expect(mockFetch).toHaveBeenCalledWith('http://test-tabby:8080/v1/models/pull', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'tabby' }),
      }));
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(provider.pullModel('tabby')).rejects.toThrow('Tabby API error: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.pullModel('tabby')).rejects.toThrow('Network error');
    });

    it('should handle missing response reader', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, body: null });
      await expect(provider.pullModel('tabby')).rejects.toThrow('Response body is not readable');
    });
  });
}); 