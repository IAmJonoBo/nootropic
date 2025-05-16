import { z } from 'zod';

export const SastFeedbackMemorySchema = z.object({
  id: z.string().describe('Unique identifier for the finding (tool:rule:file:line)'),
  tool: z.string().describe('SAST tool name, e.g., semgrep, sonarqube'),
  ruleId: z.string().optional().describe('Rule or check identifier'),
  file: z.string().describe('File path'),
  line: z.number().optional().describe('Line number'),
  memoryType: z.string().describe('Type of memory/feedback, e.g., triage, rationale, false_positive'),
  rationale: z.string().describe('Explanation or rationale for the memory'),
  user: z.string().optional().describe('User or agent who added the memory'),
  timestamp: z.string().optional().describe('ISO timestamp'),
  // @ts-expect-error TS(2339): Property 'optional' does not exist on type 'ZodEnu... Remove this comment to see the full error message
  triage: z.enum(['true_positive', 'false_positive', 'needs_review']).optional().describe('Triage classification'),
  tags: z.array(z.string()).optional().describe('Custom tags'),
  project: z.string().optional().describe('Project identifier'),
  organization: z.string().optional().describe('Organization identifier'),
  context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
  version: z.string().optional().describe('Schema version'),
});

export type SastFeedbackMemory = z.infer<typeof SastFeedbackMemorySchema>; 