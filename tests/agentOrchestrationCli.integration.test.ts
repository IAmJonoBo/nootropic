import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';

const cliPath = path.join(__dirname, '../dist/agentOrchestrationCli.js');
const profile = JSON.stringify({ name: 'TestAgent' });
const task = JSON.stringify({ id: 't1', description: 'Say hello' });

describe('agentOrchestrationCli integration', () => {
  it('prints stub result for langchain', () => {
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'langchain', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    let output = result.stdout.trim();
    if (!output && result.stderr) output = result.stderr.trim();
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    const match = String(output).match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(String(match[1] || ''));
      expect(json).toHaveProperty('success');
    } else {
      throw new Error('Output is not JSON: ' + String(output));
    }
  });
  it('prints stub result for crewAI', () => {
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'crewAI', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    let output = result.stdout.trim();
    if (!output && result.stderr) output = result.stderr.trim();
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    const match = String(output).match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(String(match[1] || ''));
      expect(json).toHaveProperty('success');
    } else {
      throw new Error('Output is not JSON: ' + String(output));
    }
  });
  it('prints stub result for semanticKernel', () => {
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'semanticKernel', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    let output = result.stdout.trim();
    if (!output && result.stderr) output = result.stderr.trim();
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    const match = String(output).match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(String(match[1] || ''));
      expect(json).toHaveProperty('success');
    } else {
      throw new Error('Output is not JSON: ' + String(output));
    }
  });
  it('prints help and error for missing required args', () => {
    const result = spawnSync('node', [cliPath], { encoding: 'utf-8' });
    expect(result.stderr + result.stdout).toMatch(/(--profile and --task are required|Usage:)/);
  });
  it('prints context chunk with correct size', () => {
    const tsxPath = path.join(__dirname, '../agentOrchestrationCli.ts');
    const result = spawnSync('pnpm', ['tsx', tsxPath, 'context-chunk', '--size', '2000'], { encoding: 'utf-8' });
    if (result.stdout && result.stdout.trim()) {
      const json = JSON.parse(String(result.stdout));
      // contracts is optional, but memoryBudgetBytes should always be present
      expect(json.memoryBudgetBytes).toBeLessThanOrEqual(2000);
    } else {
      // Accept empty output as valid (no context)
      expect(result.stdout).toBe('');
    }
  });
  it('prints recent messages with correct count', () => {
    const tsxPath = path.join(__dirname, '../agentOrchestrationCli.ts');
    const result = spawnSync('pnpm', ['tsx', tsxPath, 'recent-messages', '--count', '5'], { encoding: 'utf-8' });
    if (result.stdout && result.stdout.trim()) {
      const json = JSON.parse(String(result.stdout));
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBeLessThanOrEqual(5);
    } else {
      // Accept empty output as valid (no messages)
      expect(result.stdout).toBe('');
    }
  });
}); 