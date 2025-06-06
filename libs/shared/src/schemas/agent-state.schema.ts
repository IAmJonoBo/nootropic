import { z } from 'zod';

/**
 * @todo Implement agent state schema
 * - Define state validation
 * - Add telemetry fields
 * - Define state transitions
 */

export const AgentStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.enum(['idle', 'running', 'error']),
  lastRun: z.date().optional(),
  error: z.instanceof(Error).optional(),
  metadata: z.record(z.unknown()),
  telemetry: z.object({
    startTime: z.date(),
    endTime: z.date().optional(),
    duration: z.number().optional(),
    metrics: z.record(z.number())
  }).optional()
});

export type AgentState = z.infer<typeof AgentStateSchema>;

export const AgentCapabilitySchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  dependencies: z.array(z.string()).optional()
});

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
