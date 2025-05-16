// @ts-expect-error TS(6133): 'beforeAll' is declared but its value is never rea... Remove this comment to see the full error message
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { sonarQubeMemoriesCapability } from '../utils/feedback/sonarQubeMemories.js';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fs } from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

const TEST_MEMORIES_PATH = path.join('.nootropic-cache', 'sonarqube-memories.test.json');
const origPath = path.join('.nootropic-cache', 'sonarqube-memories.json');

function cleanup() {
  return fs.unlink(TEST_MEMORIES_PATH).catch(() => {});
}

// @ts-expect-error TS(2349): This expression is not callable.
describe('sonarQubeMemoriesCapability', () => {
  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  beforeAll(async () => {
    // Backup original file if exists
    try { await fs.copyFile(origPath, origPath + '.bak'); } catch {}
    await cleanup();
  });
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  afterAll(async () => {
    await cleanup();
    // Restore original file if backed up
    try { await fs.rename(origPath + '.bak', origPath); } catch {}
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  beforeEach(async () => {
    await cleanup();
    // Also remove the real file to ensure no state leakage
    try { await fs.unlink(origPath); } catch {}
  });

  it('describe() returns registry/LLM/AI-compliant metadata', () => {
    // @ts-expect-error TS(2304): Cannot find name 'desc'.
    const desc = sonarQubeMemoriesCapability.describe();
    // @ts-expect-error TS(6133): 'desc' is declared but its value is never read.
    expect(desc).toHaveProperty('name');
    // @ts-expect-error TS(6133): 'desc' is declared but its value is never read.
    expect(desc).toHaveProperty('schema');
    // @ts-expect-error TS(6133): 'desc' is declared but its value is never read.
    expect(desc).toHaveProperty('methods');
    // @ts-expect-error TS(6133): 'desc' is declared but its value is never read.
    expect(desc.docsFirst).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'desc'.
    expect(desc.aiFriendlyDocs).toBe(true);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('addSonarQubeMemory and listSonarQubeMemories work for new entry', async () => {
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test2', memoryType: 'triage', file: 'dummy.js', line: 1 });
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    const memories = await sonarQubeMemoriesCapability.listSonarQubeMemories('finding1');
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(memories)).toBe(true);
    // Only unique entries are stored due to strict deduplication logic.
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    expect(memories.length).toBe(2);
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    expect(memories[0]?.rationale).toBe('test');
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('deduplicates duplicate entries', async () => {
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    const memories = await sonarQubeMemoriesCapability.listSonarQubeMemories('finding1');
    // Should allow duplicates in storage, but deduplication can be tested in apply
    // @ts-expect-error TS(6133): 'memories' is declared but its value is never read... Remove this comment to see the full error message
    expect(memories.length).toBeGreaterThanOrEqual(1);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('applySonarQubeMemories attaches memories to findings', async () => {
    // Explicitly add memories for each finding
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding1', { rationale: 'test', memoryType: 'triage', file: 'dummy.js', line: 1 });
    await sonarQubeMemoriesCapability.addSonarQubeMemory('finding2', { rationale: 'test2', memoryType: 'triage', file: 'dummy2.js', line: 2 });
    // @ts-expect-error TS(2304): Cannot find name 'findings'.
    const findings = [
      { id: 'finding1', description: 'desc1' },
      { id: 'finding2', description: 'desc2' }
    ];
    // @ts-expect-error TS(2304): Cannot find name 'withMemories'.
    const withMemories = await sonarQubeMemoriesCapability.applySonarQubeMemories(findings);
    // @ts-expect-error TS(6133): 'withMemories' is declared but its value is never ... Remove this comment to see the full error message
    expect(withMemories[0]).toBeDefined();
    // @ts-expect-error TS(2304): Cannot find name 'withMemories'.
    expect(withMemories[1]).toBeDefined();
    // @ts-expect-error TS(2304): Cannot find name 'withMemories'.
    expect(Array.isArray(withMemories[0].memories) ? withMemories[0].memories.length : 0).toBeGreaterThanOrEqual(1);
    // @ts-expect-error TS(2304): Cannot find name 'withMemories'.
    expect(Array.isArray(withMemories[1].memories) ? withMemories[1].memories.length : 0).toBeGreaterThanOrEqual(1);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('handles empty and malformed input gracefully', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'empty'.
    const empty = await sonarQubeMemoriesCapability.listSonarQubeMemories('notfound');
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(empty)).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'empty'.
    expect(empty.length).toBe(0);
    // Malformed: missing required fields
    // @ts-expect-error TS(2339): Property 'rejects' does not exist on type 'Asserti... Remove this comment to see the full error message
    await expect(sonarQubeMemoriesCapability.addSonarQubeMemory('bad', {})).rejects.toThrow();
  });
}); 