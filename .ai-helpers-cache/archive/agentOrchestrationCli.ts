#!/usr/bin/env node
// CLI entrypoint for nootropic orchestration. Intentionally excluded from main TSConfig/ESLint. May be flagged as unused by static analysis tools. Do not delete.
// nootropic CLI: Modern, user-friendly, extensible, and LLM/agent-optimized
import { Command } from 'commander';
import chalk from 'chalk';
import { getOrchestrationEngine, OrchestrationEngineName } from './orchestrationEngineSelector.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlugins } from './pluginRegistry.js';
import { describeCapability } from './index.js';
import { loadAiHelpersConfig, readJsonSafe } from './utils.js';
import { getCacheFilePath } from './utils/context/cacheDir.js';
import { getContextChunk, getOptimizedHandoverPayload, AgentContextConfig } from './contextSnapshotHelper.js';
import { getRecentMessages } from './agentMessageProtocol.js';
import { prompt } from "enquirer";
import { initTelemetry, shutdownTelemetry } from './telemetry.js';
import fs from 'fs';
import { ContextManager } from './utils/context/contextManager.js';

// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

const program = new Command();
program
  // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Command'.
  .name('nootropic')
  .description('nootropic: Orchestrate, test, and automate AI agent workflows (LLM/agent-optimized CLI)')
  .version(pkg.version, '-v, --version', 'Show version')
  .option('--json', 'Output results as machine-readable JSON')
  .option('--debug', 'Enable debug/verbose output')
  .option('--config <file>', 'Path to config file')
  .option('--analytics', 'Enable analytics (opt-in, logs command usage to .nootropic-analytics.log)')
  .option('--no-analytics', 'Disable analytics');

// @ts-expect-error TS(6133): 'contextManager' is declared but its value is neve... Remove this comment to see the full error message
const contextManager = new ContextManager();

// Helper: Parse and prompt for agent arguments
// @ts-expect-error TS(7010): 'parseAgentArgs', which lacks return-type annotati... Remove this comment to see the full error message
async function parseAgentArgs(opts: Record<string, unknown>, interactive: boolean) {
  // @ts-expect-error TS(2304): Cannot find name 'opts'.
  let parsedProfile = opts['profile'] ? JSON.parse(opts['profile'] as string) : undefined;
  // @ts-expect-error TS(2304): Cannot find name 'opts'.
  let parsedTask = opts['task'] ? JSON.parse(opts['task'] as string) : undefined;
  // @ts-expect-error TS(6133): 'parsedContext' is declared but its value is never... Remove this comment to see the full error message
  let parsedContext = opts['context'] ? JSON.parse(opts['context'] as string) : undefined;
  // @ts-expect-error TS(2304): Cannot find name 'interactive'.
  if (interactive) {
    if (!parsedProfile) {
      const profileResult = await prompt({
        // @ts-expect-error TS(2322): Type '"input"' is not assignable to type '"sort"'.
        type: 'input',
        name: 'profilePrompt',
        message: 'Enter agent profile as JSON:'
      });
      // @ts-expect-error TS(2304): Cannot find name 'profileResult'.
      parsedProfile = JSON.parse((profileResult as { profilePrompt: string }).profilePrompt);
    }
    if (!parsedTask) {
      const taskResult = await prompt({
        // @ts-expect-error TS(2322): Type '"input"' is not assignable to type '"sort"'.
        type: 'input',
        name: 'taskPrompt',
        message: 'Enter agent task as JSON:'
      });
      // @ts-expect-error TS(2304): Cannot find name 'taskResult'.
      parsedTask = JSON.parse((taskResult as { taskPrompt: string }).taskPrompt);
    }
  }
  return { parsedProfile, parsedTask, parsedContext };
}

// Helper: Report missing arguments and exit
function reportMissingArgs(cmd: Command, program: Command) {
  const msg = 'Error: --profile and --task are required.';
  // @ts-expect-error TS(2339): Property 'opts' does not exist on type 'Command'.
  if (cmd.parent?.opts()['json']) {
    console.error(JSON.stringify({ success: false, logs: [msg] }));
  } else {
    // @ts-expect-error TS(2339): Property 'red' does not exist on type 'ChalkInstan... Remove this comment to see the full error message
    console.error(chalk.red(msg));
    // @ts-expect-error TS(2339): Property 'help' does not exist on type 'Command'.
    program.help();
  }
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  process.exit(1);
}

// @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
program
  .command('run')
  .description('Run an agent task with the specified engine, profile, and task')
  .option('--engine <engine>', 'Orchestration engine to use (default: langchain)', 'langchain')
  .option('--profile <profileJson>', 'Agent profile as JSON string')
  .option('--task <taskJson>', 'Agent task as JSON string')
  .option('--context <contextJson>', 'Agent context as JSON string (optional)')
  .option('--interactive', 'Prompt for missing arguments interactively')
  // @ts-expect-error TS(2304): Cannot find name 'cmd'.
  .action(async (opts: Record<string, unknown>, cmd: Command) => {
    // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
    logAnalytics(program, 'command', { name: 'run', args: opts });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { engine, interactive } = opts;
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { parsedProfile, parsedTask, parsedContext } = await parseAgentArgs(opts, !!interactive);
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!parsedProfile || !parsedTask) reportMissingArgs(cmd, program);
    try {
      // @ts-expect-error TS(2304): Cannot find name 'engine'.
      const orchestrationEngine = getOrchestrationEngine(engine as OrchestrationEngineName);
      // @ts-expect-error TS(2304): Cannot find name 'parsedProfile'.
      const result = await orchestrationEngine.runAgentTask(parsedProfile, parsedTask, parsedContext);
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exitCode = result.success ? 0 : 1;
    } catch (e) {
      const msg = 'Agent orchestration failed';
      // @ts-expect-error TS(2304): Cannot find name 'cmd'.
      if (cmd.parent?.opts()['json']) {
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.stdout.write(JSON.stringify({ success: false, logs: [msg, String(e)] }) + '\n');
      } else {
        // @ts-expect-error TS(2339): Property 'red' does not exist on type 'ChalkInstan... Remove this comment to see the full error message
        console.error(chalk.red(msg + ': ' + e));
      }
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exitCode = 1;
    }
  });

// Plugins subcommands: list and run
const pluginsCmd = program
  .command('plugins')
  .description('List or manage CLI plugins/extensions');

pluginsCmd
  .command('list')
  .description('List all loaded plugins')
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  .action(async () => {
    // @ts-expect-error TS(2304): Cannot find name 'plugins'.
    const plugins = await getPlugins();
    // @ts-expect-error TS(6133): 'plugins' is declared but its value is never read.
    if (plugins.length === 0) {
      // @ts-expect-error TS(2339): Property 'yellow' does not exist on type 'ChalkIns... Remove this comment to see the full error message
      console.log(chalk.yellow('No plugins found in ./plugins.'));
      return;
    }
    // @ts-expect-error TS(2304): Cannot find name 'plugins'.
    for (const plugin of plugins) {
      const desc = plugin.describe ? plugin.describe() : { name: plugin.name };
      // @ts-expect-error TS(2339): Property 'opts' does not exist on type 'Command'.
      if (program.opts()['json']) {
        console.log(JSON.stringify(desc, null, 2));
      } else {
        if (typeof desc === 'object' && desc && 'name' in desc) {
          const name = (desc as { name: string }).name;
          const description = (desc as { description?: string }).description ?? 'No description';
          // @ts-expect-error TS(2339): Property 'green' does not exist on type 'ChalkInst... Remove this comment to see the full error message
          console.log(chalk.green(name) + ': ' + description);
        } else {
          // @ts-expect-error TS(2339): Property 'green' does not exist on type 'ChalkInst... Remove this comment to see the full error message
          console.log(chalk.green(plugin.name));
        }
      }
    }
  });

pluginsCmd
  .command('run <plugin>')
  .description('Run a plugin by name')
  .allowUnknownOption(true)
  // @ts-expect-error TS(6133): 'pluginName' is declared but its value is never re... Remove this comment to see the full error message
  .action(async (pluginName: string) => {
    // @ts-expect-error TS(2304): Cannot find name 'plugins'.
    const plugins = await getPlugins();
    // @ts-expect-error TS(2304): Cannot find name 'plugin'.
    const plugin = plugins.find(p => p.name === pluginName);
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!plugin ?? typeof plugin.run !== 'function') {
      // @ts-expect-error TS(2339): Property 'red' does not exist on type 'ChalkInstan... Remove this comment to see the full error message
      console.error(chalk.red(`Plugin '${pluginName}' not found or missing run() export.`));
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit(1);
    }
    try {
      // @ts-expect-error TS(2304): Cannot find name 'plugin'.
      const result = await plugin.run();
      // @ts-expect-error TS(2339): Property 'opts' does not exist on type 'Command'.
      if (program.opts()['json']) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // @ts-expect-error TS(2339): Property 'green' does not exist on type 'ChalkInst... Remove this comment to see the full error message
        console.log(chalk.green(`[plugin:${pluginName}]`), result);
      }
    } catch (e) {
      // @ts-expect-error TS(2304): Cannot find name 'plugin'.
      console.error(chalk.red(`[plugin:${pluginName}] Error: ${e}`));
      process.exit(1);
    }
  });

// Add describe command
program
  .command('describe <name>')
  .description('Describe a module or plugin (with schema and prompts, for LLM/agent use)')
  .option('--json', 'Output as JSON')
  .option('--openapi', 'Output as OpenAPI fragment (if available)')
  .option('--prompts', 'Output only promptTemplates')
  .option('--schema', 'Output only schema')
  .action(async (name: string, opts: Record<string, unknown>) => {
    try {
      const desc = await describeCapability(name);
      if (opts['openapi'] && desc && typeof desc === 'object' && desc !== null && 'schema' in desc) {
        if (opts['json']) {
          console.log(JSON.stringify({ openapi: (desc as { schema: unknown }).schema }, null, 2));
        } else {
          console.log('OpenAPI fragment:', JSON.stringify((desc as { schema: unknown }).schema, null, 2));
        }
        return;
      }
      if (opts['prompts'] && desc && typeof desc === 'object' && 'promptTemplates' in desc) {
        if (opts['json']) {
          console.log(JSON.stringify((desc as { promptTemplates?: unknown[] }).promptTemplates ?? [], null, 2));
        } else {
          const prompts = (desc as { promptTemplates?: unknown[] }).promptTemplates ?? [];
          for (const p of prompts) {
            if (typeof p === 'object' && p) {
              console.log(`Name: ${(p as any).name}\nDescription: ${(p as any).description}\nTemplate: ${(p as any).template}\nUsage: ${(p as any).usage || ''}\n`);
            }
          }
        }
        return;
      }
      if (opts['schema'] && desc && typeof desc === 'object' && 'schema' in desc) {
        if (opts['json']) {
          console.log(JSON.stringify((desc as { schema?: unknown }).schema ?? {}, null, 2));
        } else {
          console.log('Schema:', JSON.stringify((desc as { schema?: unknown }).schema ?? {}, null, 2));
        }
        return;
      }
      if (opts['json']) {
        console.log(JSON.stringify(desc, null, 2));
      } else {
        // Print license/compliance info
        if (desc && typeof desc === 'object' && 'license' in desc) {
          const d = desc as import('./capabilities/Capability.js').CapabilityDescribe;
          // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
          console.log(`\nCapability: ${d.name}`);
          // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
          console.log(`Description: ${d.description}`);
          // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
          console.log(`License: ${d.license}`);
          // @ts-expect-error TS(2304): Cannot find name 'Open'.
          console.log(`Open Source: ${d.isOpenSource ? '✅' : '❌'}`);
          // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
          if (d.provenance) console.log(`Provenance: ${d.provenance}`);
          if (d.cloudOnly) console.log('Cloud Only: ✅');
          if (d.optInRequired) console.log('Explicit Opt-In Required: ✅');
          if (!d.isOpenSource || !['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','MPL-2.0','AGPL-3.0','GPL-3.0','LGPL-3.0','Unlicense','CC0-1.0'].includes(d.license)) {
            if (!d.cloudOnly && !d.optInRequired) {
              console.warn('❌ This capability is not open-source and not explicitly marked as cloudOnly/optInRequired.');
            } else {
              console.warn('⚠️  This capability is non-OSS or paid/cloud. Explicit opt-in required.');
            }
          }
        }
        console.log(desc);
      }
    } catch (e) {
      console.error('Error describing capability:', e);
    }
  });

program
  .command('context-chunk')
  .description('Output a context snapshot chunked to fit a given byte size')
  .option('--size <bytes>', 'Max byte size for the context chunk', '16000')
  .action((opts: { size: string }) => {
    const size = parseInt(opts.size, 10);
    const chunk = getContextChunk(size);
    console.log(JSON.stringify(chunk, null, 2));
  });

program
  .command('recent-messages')
  .description('Output the N most recent protocol messages')
  .option('--count <n>', 'Number of recent messages to return', '10')
  .action((opts: { count: string }) => {
    const n = parseInt(opts.count, 10);
    const msgs = getRecentMessages(n);
    console.log(JSON.stringify(msgs, null, 2));
  });

program
  .command('handover-payload')
  .description('Output an optimized, token-aware handover payload for agent context (for LLM/agent handoff)')
  .option('--critical-types <types>', 'Comma-separated list of critical context types', (v) => v.split(','), [])
  .option('--sliding-window <n>', 'Number of recent messages/events to always include', parseInt, 10)
  .option('--max-tokens <n>', 'Max tokens for the context window', parseInt, 16000)
  .option('--exclude-types <types>', 'Comma-separated list of types to always exclude', (v) => v.split(','), [])
  .option('--context-file <file>', 'Path to context JSON file (default: .nootropic-cache/context.json)')
  .action(async (opts: Record<string, unknown>) => {
    const contextFile = opts['contextFile'] as string ?? getCacheFilePath('context.json');
    let contextArr: unknown[] = [];
    try {
      contextArr = await readJsonSafe<unknown[]>(contextFile, []);
    } catch {}
    const agentConfig: AgentContextConfig = {
      criticalTypes: opts['criticalTypes'] as string[],
      slidingWindowSize: opts['slidingWindow'] as number,
      maxTokens: opts['maxTokens'] as number,
      excludeTypes: opts['excludeTypes'] as string[]
    };
    const { payload, log } = getOptimizedHandoverPayload(contextArr, agentConfig);
    if (program.opts()['json']) {
      console.log(JSON.stringify({ payload, log }, null, 2));
    } else {
      console.log(chalk.green('Optimized Handover Payload:'));
      console.dir(payload, { depth: null });
      console.log(chalk.blue('Handover Log:'), log);
    }
  });

program
  .command('context-prune')
  .description('Prune context by age, size, or token budget')
  .option('--max-age-days <n>', 'Max age in days', parseInt)
  .option('--max-size-bytes <n>', 'Max total size in bytes', parseInt)
  .option('--max-tokens <n>', 'Max total tokens', parseInt)
  .action(async (opts: Record<string, unknown>) => {
    try {
      const pruneOptions: { maxAgeDays?: number; maxSizeBytes?: number; maxTokens?: number } = {};
      if (typeof opts['maxAgeDays'] === 'number') pruneOptions.maxAgeDays = opts['maxAgeDays'];
      if (typeof opts['maxSizeBytes'] === 'number') pruneOptions.maxSizeBytes = opts['maxSizeBytes'];
      if (typeof opts['maxTokens'] === 'number') pruneOptions.maxTokens = opts['maxTokens'];
      await contextManager.pruneContext(pruneOptions);
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, action: 'prune' }, null, 2));
      } else {
        console.log('Context pruned.');
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }, null, 2));
      } else {
        console.error('Context prune failed:', e);
      }
      process.exitCode = 1;
    }
  });

program
  .command('context-archive')
  .description('Archive current context snapshot (full or compressed)')
  .option('--tier <n>', 'Context tier/size (e.g., 32000, 64000, 128000)', parseInt)
  .action(async (opts: Record<string, unknown>) => {
    try {
      await contextManager.archiveContext(opts['tier'] as number | undefined);
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, action: 'archive' }, null, 2));
      } else {
        console.log('Context archived.');
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }, null, 2));
      } else {
        console.error('Context archive failed:', e);
      }
      process.exitCode = 1;
    }
  });

program
  .command('context-list')
  .description('List available context snapshots (full, compressed, delta)')
  .action(async () => {
    try {
      const snapshots = await contextManager.listSnapshots();
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, snapshots }, null, 2));
      } else {
        console.log('Available context snapshots:', snapshots);
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }, null, 2));
      } else {
        console.error('Context list failed:', e);
      }
      process.exitCode = 1;
    }
  });

program
  .command('context-restore')
  .description('Restore a context snapshot by name/tier')
  .option('--name <name>', 'Name or tier of snapshot to restore')
  .action(async (opts: Record<string, unknown>) => {
    try {
      await contextManager.restoreSnapshot(opts['name'] as string);
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, action: 'restore' }, null, 2));
      } else {
        console.log('Context restored.');
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }, null, 2));
      } else {
        console.error('Context restore failed:', e);
      }
      process.exitCode = 1;
    }
  });

program
  .command('context-enforce-tiering')
  .description('Enforce manifest-driven context/cache tiering policies (hot/warm/cold)')
  .action(async () => {
    try {
      await contextManager.enforceTiering();
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, action: 'enforceTiering' }));
      } else {
        console.log(chalk.green('Tiering policies enforced.'));
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }));
      } else {
        console.error(chalk.red('Failed to enforce tiering:'), e);
      }
      process.exit(1);
    }
  });

program
  .command('context-migrate-tier <fileName> <targetTier>')
  .description('Migrate a cache/context file to a different tier (hot/warm/cold)')
  .action(async (fileName: string, targetTier: string) => {
    try {
      if (!['hot', 'warm', 'cold'].includes(targetTier)) {
        // @ts-expect-error TS(2304): Cannot find name 'Invalid'.
        throw new Error(`Invalid targetTier: ${targetTier}. Must be one of 'hot', 'warm', 'cold'.`);
      }
      await contextManager.migrateFileTier(fileName, targetTier as 'hot' | 'warm' | 'cold');
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: true, action: 'migrateFileTier', fileName, targetTier }));
      } else {
        // @ts-expect-error TS(2304): Cannot find name 'migrated'.
        console.log(chalk.green(`File '${fileName}' migrated to tier '${targetTier}'.`));
      }
    } catch (e) {
      if (program.opts()['json']) {
        console.log(JSON.stringify({ success: false, error: String(e) }));
      } else {
        console.error(chalk.red('Failed to migrate file tier:'), e);
      }
      process.exit(1);
    }
  });

// Add list-prompts command
program
  .command('list-prompts')
  .description('List all prompt templates for all capabilities (LLM/agent discoverable)')
  .option('--json', 'Output as JSON')
  .action(async (opts: Record<string, unknown>) => {
    const { listCapabilities } = await import('./index.js');
    const caps = await listCapabilities();
    const prompts = [];
    for (const cap of caps) {
      if (cap && typeof cap === 'object' && 'name' in cap && Array.isArray(cap.promptTemplates)) {
        for (const tmpl of cap.promptTemplates) {
          prompts.push({ capability: cap.name, ...tmpl });
        }
      }
    }
    if (opts['json']) {
      console.log(JSON.stringify(prompts, null, 2));
    } else {
      for (const p of prompts) {
        console.log(`Capability: ${p.capability}\n  Name: ${p.name}\n  Description: ${p.description}\n  Template: ${p.template}\n  Usage: ${p.usage || ''}\n`);
      }
    }
  });

// Add list-schemas command
program
  .command('list-schemas')
  .description('List all schemas for all capabilities (LLM/agent discoverable)')
  .option('--json', 'Output as JSON')
  .action(async (opts: Record<string, unknown>) => {
    const { listCapabilities } = await import('./index.js');
    const caps = await listCapabilities();
    const schemas = [];
    for (const cap of caps) {
      if (cap && typeof cap === 'object' && 'name' in cap && 'schema' in cap) {
        schemas.push({ capability: cap.name, schema: cap.schema });
      }
    }
    if (opts['json']) {
      console.log(JSON.stringify(schemas, null, 2));
    } else {
      for (const s of schemas) {
        console.log(`Capability: ${s.capability}\nSchema: ${JSON.stringify(s.schema, null, 2)}\n`);
      }
    }
  });

// Default to help if no command is given
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

(async () => {
  // Load config at startup
  const cliArgs = process.argv.slice(2);
  let configFile: string | undefined;
  const configFlagIdx = cliArgs.indexOf('--config');
  if (configFlagIdx !== -1 && cliArgs[configFlagIdx + 1]) {
    configFile = cliArgs[configFlagIdx + 1];
  }
  const config = await loadAiHelpersConfig(configFile ? { configFile } : {});
  // Attach config to program for access in commands
  (program as unknown as Record<string, unknown>)['aiHelpersConfig'] = config;
})();

function analyticsEnabled(program: import('commander').Command): boolean {
  if (program.opts()['analytics']) return true;
  if (program.opts()['noAnalytics']) return false;
  if ((typeof program === 'object' && program !== null && 'aiHelpersConfig' in program && (program as Record<string, unknown>)['aiHelpersConfig'] && typeof (program as Record<string, unknown>)['aiHelpersConfig'] === 'object' && ((program as Record<string, unknown>)['aiHelpersConfig'] as Record<string, unknown>)['analytics'] === true)) return true;
  if (process.env['AIHELPERS_ANALYTICS'] === '1') return true;
  return false;
}

function logAnalytics(program: import('commander').Command, event: string, data: Record<string, unknown> = {}) {
  if (!analyticsEnabled(program)) return;
  const logFile = path.join(process.cwd(), '.nootropic-analytics.log');
  const entry = { timestamp: new Date().toISOString(), event, ...data };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

// Initialize OpenTelemetry (if enabled)
initTelemetry('agent-orchestration-cli');

program.parseAsync(process.argv);

// Ensure graceful shutdown of telemetry on exit
process.on('exit', shutdownTelemetry);
process.on('SIGINT', async () => { await shutdownTelemetry(); process.exit(0); }); 