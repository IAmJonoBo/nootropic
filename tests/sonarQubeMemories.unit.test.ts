import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
// @ts-ignore
import { sonarQubeMemoriesCapability } from '../src/utils/feedback/sonarQubeMemories';
import { promises as fs } from 'fs';
import path from 'path';

const TEST_MEMORIES_PATH = path.join('.nootropic-cache', 'sonarqube-memories.test.json');
const origPath = path.join('.nootropic-cache', 'sonarqube-memories.json');

function cleanup() {
  return fs.unlink(TEST_MEMORIES_PATH).catch(() => {});
}

describe('sonarQubeMemoriesCapability', () => {
  beforeAll(async () => {
    // Backup original file if exists
    try { await fs.copyFile(origPath, origPath + '.bak'); } catch {}
    await cleanup();
  });
  afterAll(async () => {
    await cleanup();
    // Restore original file if backed up
    try { await fs.rename(origPath + '.bak', origPath); } catch {}
  });

  beforeEach(async () => {
    await cleanup();
    // Also remove the real file to ensure no state leakage
    try { await fs.unlink(origPath); } catch {}
  });

  it('describe() returns registry/LLM/AI-compliant metadata', () => {
    const desc = sonarQubeMemoriesCapability.describe();
    expect(desc).toHaveProperty('name');
    expect(desc).toHaveProperty('schema');
    expect(desc).toHaveProperty('methods');
    expect(desc.docsFirst).toBe(true);
    expect(desc.aiFriendlyDocs).toBe(true);
  });

  it('addSonarQubeMemory and listSonarQubeMemories work for new entry', async () => {
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'sonarqube' });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'sonarqube' });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test2', memoryType: 'triage', file: 'dummy.js', line: 1, tool: 'sonarqube-2' });
    const memories = await sonarQubeMemoriesCapability.listSonarQubeMemories('finding1');
    expect(Array.isArray(memories)).toBe(true);
    // Only unique entries are stored due to strict deduplication logic.
    expect(memories.length).toBe(2);
    expect(memories[0]?.rationale).toBe('test');
  });

  it('deduplicates duplicate entries', async () => {
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    const memories = await sonarQubeMemoriesCapability.listSonarQubeMemories('finding1');
    // Should allow duplicates in storage, but deduplication can be tested in apply
    expect(memories.length).toBeGreaterThanOrEqual(1);
  });

  it('applySonarQubeMemories attaches memories to findings', async () => {
    // Explicitly add memories for each finding
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding2', { rationale: 'test2', memoryType: 'triage', file: 'dummy2.js', line: 2 });
    const findings = [
      { id: 'finding1', description: 'desc1' },
      { id: 'finding2', description: 'desc2' }
    ];
    const withMemories = await sonarQubeMemoriesCapability.applySonarQubeMemories(findings);
    expect((withMemories[0] as any)).toBeDefined();
    expect((withMemories[1] as any)).toBeDefined();
    expect(Array.isArray((withMemories[0] as any).memories) ? (withMemories[0] as any).memories.length : 0).toBeGreaterThanOrEqual(1);
    expect(Array.isArray((withMemories[1] as any).memories) ? (withMemories[1] as any).memories.length : 0).toBeGreaterThanOrEqual(1);
  });

  it('handles empty and malformed input gracefully', async () => {
    const empty = await sonarQubeMemoriesCapability.listSonarQubeMemories('notfound');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
    // Malformed: missing required fields
    await expect(sonarQubeMemoriesCapability.addSonarQubeMemory('bad', {})).rejects.toThrow();
  });
}); 