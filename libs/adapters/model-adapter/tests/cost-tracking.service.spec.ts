import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostTrackingService } from '../src/cost-tracking.service';
import { Logger } from '@nootropic/shared';

describe('CostTrackingService', () => {
  let service: CostTrackingService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;
    service = new CostTrackingService(mockLogger);
  });

  describe('cost tracking', () => {
    it('should track costs for a model', async () => {
      const usage = { promptTokens: 100, completionTokens: 50, totalTokens: 150 };
      await service.track('gpt-4', usage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cost for model gpt-4'),
        expect.objectContaining({ tokens: 150, cost: expect.any(Number) })
      );
    });
    it('should use default cost per token when not set', async () => {
      const usage = { promptTokens: 100, completionTokens: 50, totalTokens: 150 };
      await service.track('unknown-model', usage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cost for model unknown-model'),
        expect.objectContaining({ tokens: 150, cost: expect.any(Number) })
      );
    });
    it('should handle errors during tracking', async () => {
      mockLogger.info.mockImplementationOnce(() => { throw new Error('Tracking error'); });
      const usage = { promptTokens: 100, completionTokens: 50, totalTokens: 150 };
      await expect(service.track('gpt-4', usage)).rejects.toThrow('Tracking error');
    });
  });

  describe('cost per token configuration', () => {
    it('should set and use custom cost per token', async () => {
      service.setCostPerToken('gpt-4', 0.02);
      const usage = { promptTokens: 100, completionTokens: 50, totalTokens: 150 };
      await service.track('gpt-4', usage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cost for model gpt-4'),
        expect.objectContaining({ tokens: 150, cost: expect.any(Number) })
      );
    });
    it('should update cost per token for existing model', async () => {
      service.setCostPerToken('gpt-4', 0.02);
      service.setCostPerToken('gpt-4', 0.03);
      const usage = { promptTokens: 100, completionTokens: 50, totalTokens: 150 };
      await service.track('gpt-4', usage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cost for model gpt-4'),
        expect.objectContaining({ tokens: 150, cost: expect.any(Number) })
      );
    });
  });
}); 