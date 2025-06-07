import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LlamaCppProvider } from '../src/providers/llama-cpp.provider';
import { Logger } from '@nootropic/shared';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Mock dependencies
vi.mock('@nootropic/shared', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  promises: {
    readdir: vi.fn(),
  },
}));

describe('LlamaCppProvider', () => {
  let provider: LlamaCppProvider;
  let mockLogger: Logger;
  let mockProcess: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = new Logger();

    // Create mock process
    mockProcess = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn(),
    };
    (spawn as any).mockReturnValue(mockProcess);

    // Create provider instance
    provider = new LlamaCppProvider({
      modelPath: '/test/models',
      executablePath: '/test/llama.cpp/main',
    }, mockLogger);
  });

  describe('initialization', () => {
    it('should use default paths when not provided', () => {
      const defaultProvider = new LlamaCppProvider({}, mockLogger);
      expect(defaultProvider).toBeDefined();
    });

    it('should use provided paths', () => {
      const customProvider = new LlamaCppProvider({
        modelPath: '/custom/models',
        executablePath: '/custom/llama.cpp/main',
      }, mockLogger);
      expect(customProvider).toBeDefined();
    });
  });

  describe('connection management', () => {
    it('should connect successfully when executable exists', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      await provider.connect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to llama.cpp provider');
    });

    it('should throw error when executable not found', async () => {
      (fs.existsSync as any).mockReturnValue(false);
      await expect(provider.connect()).rejects.toThrow('llama.cpp executable not found');
    });

    it('should disconnect and kill process', async () => {
      await provider.disconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from llama.cpp provider');
      expect(mockProcess.kill).toHaveBeenCalled();
    });
  });

  describe('text generation', () => {
    const mockOutput = 'Generated text';
    const mockError = '';

    beforeEach(() => {
      (fs.existsSync as any).mockImplementation((path: string) => {
        return path.endsWith('.gguf');
      });

      // Setup process event handlers
      mockProcess.stdout.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          callback(Buffer.from(mockOutput));
        }
      });

      mockProcess.stderr.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          callback(Buffer.from(mockError));
        }
      });

      mockProcess.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'close') {
          callback(0);
        }
      });
    });

    it('should generate text with default config', async () => {
      const result = await provider.generateText('Test prompt', { model: 'llama2' });

      expect(result).toEqual({
        text: mockOutput.trim(),
        usage: {
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number),
        },
      });

      expect(spawn).toHaveBeenCalledWith(
        '/test/llama.cpp/main',
        expect.arrayContaining([
          '-m', '/test/models/llama2.gguf',
          '-p', 'Test prompt',
          '--temp', '0.7',
          '--n-predict', '2048',
          '--top-p', '0.9',
          '--repeat-penalty', '1.1',
        ])
      );
    });

    it('should generate text with custom config', async () => {
      const config = {
        model: 'llama2',
        temperature: 0.5,
        maxTokens: 100,
        topP: 0.8,
        frequencyPenalty: 1.2,
        stopSequences: ['\n', 'END'],
      };

      await provider.generateText('Test prompt', config);

      expect(spawn).toHaveBeenCalledWith(
        '/test/llama.cpp/main',
        expect.arrayContaining([
          '-m', '/test/models/llama2.gguf',
          '-p', 'Test prompt',
          '--temp', '0.5',
          '--n-predict', '100',
          '--top-p', '0.8',
          '--repeat-penalty', '1.2',
          '--stop', '\n,END',
        ])
      );
    });

    it('should throw error when model file not found', async () => {
      (fs.existsSync as any).mockReturnValue(false);

      await expect(
        provider.generateText('Test prompt', { model: 'nonexistent' })
      ).rejects.toThrow('Model file not found');
    });

    it('should handle process errors', async () => {
      mockProcess.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'close') {
          callback(1);
        }
      });

      await expect(
        provider.generateText('Test prompt', { model: 'llama2' })
      ).rejects.toThrow('llama.cpp process exited with code 1');
    });
  });

  describe('model listing', () => {
    it('should list available models', async () => {
      const mockFiles = ['model1.gguf', 'model2.gguf', 'other.txt'];
      (fs.promises.readdir as any).mockResolvedValue(mockFiles);

      const models = await provider.listModels();
      expect(models).toEqual(['model1', 'model2']);
      expect(fs.promises.readdir).toHaveBeenCalledWith('/test/models');
    });

    it('should handle directory read errors', async () => {
      (fs.promises.readdir as any).mockRejectedValue(new Error('Read error'));

      await expect(provider.listModels()).rejects.toThrow('Read error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error listing llama.cpp models',
        expect.any(Error)
      );
    });
  });

  describe('model pulling', () => {
    it('should throw error as not implemented', async () => {
      await expect(provider.pullModel('llama2')).rejects.toThrow(
        'Model pulling not implemented for llama.cpp yet'
      );
    });
  });
}); 