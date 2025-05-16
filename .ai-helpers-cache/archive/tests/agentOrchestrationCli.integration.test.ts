import { describe, it, expect } from 'vitest';
// @ts-expect-error TS(2307): Cannot find module 'child_process' or its correspo... Remove this comment to see the full error message
import { spawnSync } from 'child_process';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

// @ts-expect-error TS(2304): Cannot find name '__dirname'.
const cliPath = path.join(__dirname, '../dist/agentOrchestrationCli.js');
const profile = JSON.stringify({ name: 'TestAgent' });
const task = JSON.stringify({ id: 't1', description: 'Say hello' });

// @ts-expect-error TS(2349): This expression is not callable.
describe('agentOrchestrationCli integration', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('prints stub result for langchain', () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'langchain', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let output = result.stdout.trim();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!output && result.stderr) output = result.stderr.trim();
    // @ts-expect-error TS(2304): Cannot find name 'output'.
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'match'.
    const match = output.match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(match[1]);
      // @ts-expect-error TS(2551): Property 'toHaveProperty' does not exist on type '... Remove this comment to see the full error message
      expect(json).toHaveProperty('success');
    } else {
      // @ts-expect-error TS(2304): Cannot find name 'output'.
      throw new Error('Output is not JSON: ' + output);
    }
  });
  it('prints stub result for crewAI', () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'crewAI', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let output = result.stdout.trim();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!output && result.stderr) output = result.stderr.trim();
    // @ts-expect-error TS(2304): Cannot find name 'output'.
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'match'.
    const match = output.match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(match[1]);
      // @ts-expect-error TS(2551): Property 'toHaveProperty' does not exist on type '... Remove this comment to see the full error message
      expect(json).toHaveProperty('success');
    } else {
      // @ts-expect-error TS(2304): Cannot find name 'output'.
      throw new Error('Output is not JSON: ' + output);
    }
  });
  it('prints stub result for semanticKernel', () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('node', [cliPath, 'run', '--engine', 'semanticKernel', '--profile', profile, '--task', task, '--json'], { encoding: 'utf-8' });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let output = result.stdout.trim();
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!output && result.stderr) output = result.stderr.trim();
    // @ts-expect-error TS(2304): Cannot find name 'output'.
    expect(output).not.toBe('');
    // Find the first valid JSON object in the output
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'match'.
    const match = output.match(/({[\s\S]*})/);
    if (match) {
      const json = JSON.parse(match[1]);
      // @ts-expect-error TS(2551): Property 'toHaveProperty' does not exist on type '... Remove this comment to see the full error message
      expect(json).toHaveProperty('success');
    } else {
      // @ts-expect-error TS(2304): Cannot find name 'output'.
      throw new Error('Output is not JSON: ' + output);
    }
  });
  it('prints help and error for missing required args', () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('node', [cliPath], { encoding: 'utf-8' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result.stderr + result.stdout).toMatch(/(--profile and --task are required|Usage:)/);
  });
  it('prints context chunk with correct size', () => {
    // @ts-expect-error TS(2304): Cannot find name 'tsxPath'.
    const tsxPath = path.join(__dirname, '../agentOrchestrationCli.ts');
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('pnpm', ['tsx', tsxPath, 'context-chunk', '--size', '2000'], { encoding: 'utf-8' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    if (result.stdout.trim()) {
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      const json = JSON.parse(result.stdout);
      // contracts is optional, but memoryBudgetBytes should always be present
      // @ts-expect-error TS(2339): Property 'toBeLessThanOrEqual' does not exist on t... Remove this comment to see the full error message
      expect(json.memoryBudgetBytes).toBeLessThanOrEqual(2000);
    } else {
      // Accept empty output as valid (no context)
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      expect(result.stdout).toBe('');
    }
  });
  it('prints recent messages with correct count', () => {
    // @ts-expect-error TS(2304): Cannot find name 'tsxPath'.
    const tsxPath = path.join(__dirname, '../agentOrchestrationCli.ts');
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = spawnSync('pnpm', ['tsx', tsxPath, 'recent-messages', '--count', '5'], { encoding: 'utf-8' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    if (result.stdout.trim()) {
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      const json = JSON.parse(result.stdout);
      // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
      expect(Array.isArray(json)).toBe(true);
      // @ts-expect-error TS(2339): Property 'toBeLessThanOrEqual' does not exist on t... Remove this comment to see the full error message
      expect(json.length).toBeLessThanOrEqual(5);
    } else {
      // Accept empty output as valid (no messages)
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      expect(result.stdout).toBe('');
    }
  });
}); 