#!/usr/bin/env tsx
/**
 * Script to aggregate the describe registry for all capabilities, agents, and plugins.
 * Usage: pnpm tsx aggregateDescribeRegistry.ts
 * LLM/AI-usage: Ensures the describe registry is up to date for agent/plugin discovery and documentation automation.
 */
import { aggregateDescribeRegistry } from './utils.js';

(async () => {
  try {
    await aggregateDescribeRegistry();
    console.log('Describe registry aggregation complete.');
    process.exit(0);
  } catch (e: unknown) {
    console.error('Failed to aggregate describe registry:', e);
    process.exit(1);
  }
})(); 