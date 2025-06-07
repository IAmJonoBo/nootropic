import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalModelProvider } from '../src/providers/local-model.provider';
import { OllamaProvider } from '../src/providers/ollama.provider';
import { LlamaCppProvider } from '../src/providers/llama-cpp.provider';
import { VllmProvider } from '../src/providers/vllm.provider';
import { TabbyProvider } from '../src/providers/tabby.provider';
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

vi.mock('../src/providers/ollama.provider', () => ({
  OllamaProvider: vi.fn().mockImplementation(() => ({
    generateText: vi.fn(),
    listModels: vi.fn(),
    pullModel: vi.fn(),
  })),
}));

vi.mock('../src/providers/llama-cpp.provider', () => ({
  LlamaCppProvider: vi.fn().mockImplementation(() => ({
    generateText: vi.fn(),
    listModels: vi.fn(),
    pullModel: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../src/providers/vllm.provider', () => ({
  VllmProvider: vi.fn().mockImplementation(() => ({
    generateText: vi.fn(),
    listModels: vi.fn(),
    pullModel: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../src/providers/tabby.provider', () => ({
  TabbyProvider: vi.fn().mockImplementation(() => ({
    generateText: vi.fn(),
    listModels: vi.fn(),
    pullModel: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('LocalModelProvider', () => {
  let provider: LocalModelProvider;
  let mockLogger: Logger;
  let mockResponse: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = new Logger();
    mockResponse = { text: 'Generated text', usage: { promptTokens: 10, completionTokens: 20 } };
    provider = new LocalModelProvider({ backend: 'ollama' }, mockLogger);
  });

  describe('initialization', () => {
    it('should initialize with Ollama provider by default', () => {
      const defaultProvider = new LocalModelProvider({}, mockLogger);
      expect(defaultProvider).toBeDefined();
    });

    it('should initialize with specified backend', () => {
      const customProvider = new LocalModelProvider({ backend: 'ollama' }, mockLogger);
      expect(customProvider).toBeDefined();
    });

    it('should throw error for unsupported backend', () => {
      expect(() => new LocalModelProvider({ backend: 'unsupported' }, mockLogger)).toThrow('Unsupported local backend: unsupported');
    });
  });

  describe('connection management', () => {
    it('should connect to provider', async () => {
      await provider.connect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to ollama provider');
    });

    it('should disconnect from provider', async () => {
      await provider.disconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from ollama provider');
    });

    it('should handle providers without connect/disconnect methods', async () => {
      provider.provider.connect = undefined;
      provider.provider.disconnect = undefined;
      await expect(provider.connect()).resolves.not.toThrow();
      await expect(provider.disconnect()).resolves.not.toThrow();
    });
  });

  describe('model operations', () => {
    beforeEach(async () => {
      await provider.connect();
    });

    it('should generate text', async () => {
      const result = await provider.generateText('prompt', { model: 'ollama' });
      expect(result).toEqual(mockResponse);
      expect(mockLogger.info).toHaveBeenCalledWith('Generating text with ollama provider');
    });

    it('should list models', async () => {
      const models = await provider.listModels();
      expect(models).toEqual(['model1', 'model2']);
      expect(mockLogger.info).toHaveBeenCalledWith('Listing models from ollama provider');
    });

    it('should pull model', async () => {
      await expect(provider.pullModel('model1')).resolves.toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalledWith('Pulling model model1 from ollama provider');
      expect(OllamaProvider.prototype.pullModel).toHaveBeenCalledWith('model1');
    });
  });
}); 