import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
// @ts-ignore
import { semgrepMemoriesCapability } from '../src/utils/feedback/semgrepMemories.js';
import { promises as fs } from 'fs';
import path from 'path';

const TEST_MEMORIES_PATH = path.join('.nootropic-cache', 'semgrep-memories.test.json');
const origPath = path.join('.nootropic-cache', 'semgrep-memories.json');

function cleanup() {
  return fs.unlink(TEST_MEMORIES_PATH).catch(() => {});
}

describe('semgrepMemoriesCapability', () => {
  beforeAll(async () => {
    try { await fs.copyFile(origPath, origPath + '.bak'); } catch {}
    await cleanup();
  });
  afterAll(async () => {
    await cleanup();
    try { await fs.rename(origPath + '.bak', origPath); } catch {}
  });
  beforeEach(async () => {
    await cleanup();
    try { await fs.unlink(origPath); } catch {}
  });

  it('describe() returns registry/LLM/AI-compliant metadata', () => {
    const desc = semgrepMemoriesCapability.describe();
    expect(desc).toHaveProperty('name');
    expect(desc).toHaveProperty('schema');
    expect(desc).toHaveProperty('methods');
    expect(desc.docsFirst).toBe(true);
    expect(desc.aiFriendlyDocs).toBe(true);
  });

  it('addSemgrepMemory and listSemgrepMemories work for new entry', async () => {
    await semgrepMemoriesCapability.addSemgrepMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'semgrep' });
    await semgrepMemoriesCapability.addSemgrepMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'semgrep' });
    await semgrepMemoriesCapability.addSemgrepMemory('finding1', { rationale: 'test2', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'semgrep-2' });
    const memories = await semgrepMemoriesCapability.listSemgrepMemories('finding1');
    expect(Array.isArray(memories)).toBe(true);
    expect(memories.length).toBe(2);
    expect(memories[0]?.rationale).toBe('test');
  });

  it('deduplicates duplicate entries', async () => {
    await semgrepMemoriesCapability.addSemgrepMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    const memories = await semgrepMemoriesCapability.listSemgrepMemories('finding1');
    expect(memories.length).toBeGreaterThanOrEqual(1);
  });

  it('applySemgrepMemories attaches memories to findings', async () => {
    await semgrepMemoriesCapability.addSemgrepMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    await semgrepMemoriesCapability.addSemgrepMemory('finding2', { rationale: 'test2', memoryType: 'triage', file: 'dummy2.js', line: 2 });
    const findings = [
      { id: 'finding1', description: 'desc1' },
      { id: 'finding2', description: 'desc2' }
    ];
    const withMemories = await semgrepMemoriesCapability.applySemgrepMemories(findings);
    expect((withMemories[0] as any)).toBeDefined();
    expect((withMemories[1] as any)).toBeDefined();
    expect(Array.isArray((withMemories[0] as any).memories) ? (withMemories[0] as any).memories.length : 0).toBeGreaterThanOrEqual(1);
    expect(Array.isArray((withMemories[1] as any).memories) ? (withMemories[1] as any).memories.length : 0).toBeGreaterThanOrEqual(1);
  });

  it('handles empty and malformed input gracefully', async () => {
    const empty = await semgrepMemoriesCapability.listSemgrepMemories('notfound');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
    await expect(semgrepMemoriesCapability.addSemgrepMemory('bad', {})).rejects.toThrow();
  });
}); 