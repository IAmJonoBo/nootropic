import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CloudModelProvider } from '../src/providers/cloud-model.provider';
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

describe('CloudModelProvider', () => {
  let provider: CloudModelProvider;
  let mockLogger: Logger;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = new Logger();

    // Create provider instance
    provider = new CloudModelProvider({ apiKey: 'test-key' }, mockLogger);
  });

  describe('connection management', () => {
    it('should connect to cloud provider', async () => {
      await provider.connect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to cloud model provider');
    });

    it('should disconnect from cloud provider', async () => {
      await provider.disconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from cloud model provider');
    });
  });

  describe('text generation', () => {
    it('should generate text with default response', async () => {
      const result = await provider.generateText('Test prompt', { model: 'gpt-4' });
      expect(result).toEqual({ text: 'Test prompt', usage: undefined });
      expect(mockLogger.info).toHaveBeenCalledWith('Generating text with CloudModelProvider: {"model":"gpt-4"}');
    });

    it('should handle generation errors', async () => {
      mockLogger.error.mockImplementationOnce(() => {});
      provider.generateText = vi.fn().mockImplementation(() => { throw new Error('Generation error'); });
      await expect(provider.generateText('Test prompt', { model: 'gpt-4' })).rejects.toThrow('Generation error');
    });
  });
}); 