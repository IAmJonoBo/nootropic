import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModelAdapter } from '../src/model.adapter';
import { LocalModelProvider } from '../src/providers/local-model.provider';
import { CloudModelProvider } from '../src/providers/cloud-model.provider';
import { Logger } from '@nootropic/shared';
import { ModelConfig } from '../src/types';

// Mock dependencies
vi.mock('@nootropic/runtime', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock('@nootropic/adapters/observability-adapter', () => ({
  ObservabilityAdapter: vi.fn().mockImplementation(() => ({
    startSpan: vi.fn(),
    endSpan: vi.fn(),
  })),
}));

describe('ModelAdapter', () => {
  let adapter: ModelAdapter;
  let mockLocalProvider: LocalModelProvider;
  let mockCloudProvider: CloudModelProvider;
  let mockLogger: Logger;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock providers
    mockLocalProvider = {
      initialize: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      generate: vi.fn(),
    } as unknown as LocalModelProvider;

    mockCloudProvider = {
      initialize: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      generate: vi.fn(),
    } as unknown as CloudModelProvider;

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;

    // Create adapter instance
    adapter = new ModelAdapter(mockLogger);
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['cloud-openai'],
            routing: {
              preferredHardware: ['gpu'],
              fallbackProviders: ['cloud-anthropic'],
            },
          },
        },
        hardwareCapabilities: ['gpu', 'cpu'],
        providersConfig: {
          'cloud-openai': { apiKey: 'test-key' },
        },
      };

      await expect(adapter.initialize(config)).resolves.not.toThrow();
    });

    it('should throw error with invalid configuration', async () => {
      const invalidConfig = {
        modelMetadata: {}, // Missing required fields
      };

      await expect(adapter.initialize(invalidConfig)).rejects.toThrow('Invalid model adapter configuration');
    });

    it('should initialize with default config', () => {
      expect(adapter).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('Initializing ModelAdapter');
    });
  });

  describe('provider selection', () => {
    it('should select providers based on hardware capabilities', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['local-ollama', 'cloud-openai'],
            routing: {
              preferredHardware: ['gpu'],
              fallbackProviders: ['cloud-anthropic'],
            },
          },
        },
        hardwareCapabilities: ['gpu'],
        providersConfig: {},
      };

      await adapter.initialize(config);
      const providers = adapter.selectProvider('gpt-4');
      expect(providers).toContain('local-ollama');
    });

    it('should fall back to available providers when preferred hardware not available', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['local-ollama', 'cloud-openai'],
            routing: {
              preferredHardware: ['gpu'],
              fallbackProviders: ['cloud-anthropic'],
            },
          },
        },
        hardwareCapabilities: ['cpu'], // No GPU available
        providersConfig: {},
      };

      await adapter.initialize(config);
      const providers = adapter.selectProvider('gpt-4');
      expect(providers).toContain('cloud-anthropic');
    });
  });

  describe('model generation', () => {
    it('should generate text using selected provider', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['cloud-openai'],
          },
        },
        hardwareCapabilities: ['cpu'],
        providersConfig: {
          'cloud-openai': { apiKey: 'test-key' },
        },
      };

      const mockResponse = {
        text: 'Generated text',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      mockCloudProvider.generate = vi.fn().mockResolvedValue(mockResponse);

      await adapter.initialize(config);
      const result = await adapter.generate(
        { model: 'gpt-4', temperature: 0.7 },
        'Test prompt'
      );

      expect(result).toEqual(mockResponse);
      expect(mockCloudProvider.generate).toHaveBeenCalledWith(
        { model: 'gpt-4', temperature: 0.7 },
        'Test prompt'
      );
    });

    it('should handle provider errors gracefully', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['cloud-openai'],
          },
        },
        hardwareCapabilities: ['cpu'],
        providersConfig: {
          'cloud-openai': { apiKey: 'test-key' },
        },
      };

      mockCloudProvider.generate = vi.fn().mockRejectedValue(new Error('Provider error'));

      await adapter.initialize(config);
      await expect(
        adapter.generate({ model: 'gpt-4' }, 'Test prompt')
      ).rejects.toThrow('Provider error');
    });
  });

  describe('connection management', () => {
    it('should connect and disconnect providers', async () => {
      const config = {
        modelMetadata: {
          'gpt-4': {
            providers: ['cloud-openai'],
          },
        },
        hardwareCapabilities: ['cpu'],
        providersConfig: {
          'cloud-openai': { apiKey: 'test-key' },
        },
      };

      await adapter.initialize(config);
      await adapter.connect();
      expect(mockCloudProvider.connect).toHaveBeenCalled();

      await adapter.disconnect();
      expect(mockCloudProvider.disconnect).toHaveBeenCalled();
    });
  });

  describe('provider management', () => {
    it('should register and connect provider', async () => {
      const config: ModelConfig = {
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      };

      await adapter.registerProvider('test-provider', mockLocalProvider);
      await adapter.connect(config);

      expect(mockLocalProvider.connect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Connected to provider: test-provider');
    });

    it('should handle provider registration errors', async () => {
      const config: ModelConfig = {
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      };

      await expect(adapter.connect(config)).rejects.toThrow('Provider not found: test-provider');
    });

    it('should handle provider connection errors', async () => {
      const config: ModelConfig = {
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      };

      mockLocalProvider.connect.mockRejectedValueOnce(new Error('Connection failed'));

      await adapter.registerProvider('test-provider', mockLocalProvider);
      await expect(adapter.connect(config)).rejects.toThrow('Connection failed');
    });
  });

  describe('text generation', () => {
    beforeEach(async () => {
      await adapter.registerProvider('test-provider', mockLocalProvider);
      await adapter.connect({
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      });
    });

    it('should generate text with provider', async () => {
      const prompt = 'Test prompt';
      const config = { temperature: 0.7 };
      const expectedResponse = { text: 'Generated text', usage: { promptTokens: 10, completionTokens: 20 } };

      mockLocalProvider.generate = vi.fn().mockResolvedValueOnce(expectedResponse);

      const result = await adapter.generateText(prompt, config);

      expect(result).toEqual(expectedResponse);
      expect(mockLocalProvider.generate).toHaveBeenCalledWith(prompt, config);
      expect(mockLogger.info).toHaveBeenCalledWith('Generated text with provider: test-provider');
    });

    it('should handle generation errors', async () => {
      const prompt = 'Test prompt';
      const config = { temperature: 0.7 };

      mockLocalProvider.generate.mockRejectedValueOnce(new Error('Generation failed'));

      await expect(adapter.generateText(prompt, config)).rejects.toThrow('Generation failed');
    });
  });

  describe('model management', () => {
    beforeEach(async () => {
      await adapter.registerProvider('test-provider', mockLocalProvider);
      await adapter.connect({
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      });
    });

    it('should list models from provider', async () => {
      const expectedModels = ['model1', 'model2'];
      mockLocalProvider.listModels = vi.fn().mockResolvedValueOnce(expectedModels);

      const models = await adapter.listModels();

      expect(models).toEqual(expectedModels);
      expect(mockLocalProvider.listModels).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Listed models from provider: test-provider');
    });

    it('should pull model from provider', async () => {
      const modelName = 'test-model';
      mockLocalProvider.pullModel = vi.fn().mockResolvedValueOnce(undefined);

      await adapter.pullModel(modelName);

      expect(mockLocalProvider.pullModel).toHaveBeenCalledWith(modelName);
      expect(mockLogger.info).toHaveBeenCalledWith('Pulled model from provider: test-provider');
    });

    it('should handle model listing errors', async () => {
      mockLocalProvider.listModels = vi.fn().mockRejectedValueOnce(new Error('Listing failed'));

      await expect(adapter.listModels()).rejects.toThrow('Listing failed');
    });

    it('should handle model pulling errors', async () => {
      const modelName = 'test-model';
      mockLocalProvider.pullModel = vi.fn().mockRejectedValueOnce(new Error('Pulling failed'));

      await expect(adapter.pullModel(modelName)).rejects.toThrow('Pulling failed');
    });
  });

  describe('cleanup', () => {
    it('should disconnect provider', async () => {
      await adapter.registerProvider('test-provider', mockLocalProvider);
      await adapter.connect({
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      });

      await adapter.disconnect();

      expect(mockLocalProvider.disconnect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnected from provider: test-provider');
    });

    it('should handle disconnect errors', async () => {
      await adapter.registerProvider('test-provider', mockLocalProvider);
      await adapter.connect({
        name: 'test-provider',
        type: 'local',
        model: 'test-model',
      });

      mockLocalProvider.disconnect.mockRejectedValueOnce(new Error('Disconnect failed'));

      await expect(adapter.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });
}); 