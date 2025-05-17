#!/usr/bin/env node
// nootropic CLI: Modern, user-friendly, extensible, and LLM/agent-optimized
import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { prompt } = require('enquirer');
import { getOrchestrationEngine } from './orchestrationEngineSelector.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlugins } from './pluginRegistry.js';
import { describeCapability } from './index.js';
import { loadAiHelpersConfig } from './utils.js';
import fs from 'fs';
import { getContextChunk } from './contextSnapshotHelper.js';
import { getRecentMessages } from './agentMessageProtocol.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const program = new Command();
program
    .name('nootropic')
    .description('nootropic: Orchestrate, test, and automate AI agent workflows (LLM/agent-optimized CLI)')
    .version(pkg.version, '-v, --version', 'Show version')
    .option('--json', 'Output results as machine-readable JSON')
    .option('--debug', 'Enable debug/verbose output')
    .option('--config <file>', 'Path to config file')
    .option('--analytics', 'Enable analytics (opt-in, logs command usage to .nootropic-analytics.log)')
    .option('--no-analytics', 'Disable analytics');
program
    .command('run')
    .description('Run an agent task with the specified engine, profile, and task')
    .option('--engine <engine>', 'Orchestration engine to use (default: langchain)', 'langchain')
    .option('--profile <profileJson>', 'Agent profile as JSON string')
    .option('--task <taskJson>', 'Agent task as JSON string')
    .option('--context <contextJson>', 'Agent context as JSON string (optional)')
    .option('--interactive', 'Prompt for missing arguments interactively')
    .action(async (opts, cmd) => {
    logAnalytics(program, 'command', { name: 'run', args: opts });
    const { engine, profile, task, context, interactive } = opts;
    let parsedProfile = profile ? JSON.parse(profile) : undefined;
    let parsedTask = task ? JSON.parse(task) : undefined;
    let parsedContext = context ? JSON.parse(context) : undefined;
    if (interactive) {
        if (!parsedProfile) {
            const profileResult = await prompt({
                type: 'input',
                name: 'profilePrompt',
                message: 'Enter agent profile as JSON:'
            });
            parsedProfile = JSON.parse(profileResult.profilePrompt);
        }
        if (!parsedTask) {
            const taskResult = await prompt({
                type: 'input',
                name: 'taskPrompt',
                message: 'Enter agent task as JSON:'
            });
            parsedTask = JSON.parse(taskResult.taskPrompt);
        }
    }
    if (!parsedProfile || !parsedTask) {
        const msg = 'Error: --profile and --task are required.';
        if (cmd.parent?.opts().json) {
            console.error(JSON.stringify({ success: false, logs: [msg] }));
        }
        else {
            console.error(chalk.red(msg));
            program.help();
        }
        process.exit(1);
    }
    try {
        const orchestrationEngine = getOrchestrationEngine(engine);
        const result = await orchestrationEngine.runAgentTask(parsedProfile, parsedTask, parsedContext);
        process.stdout.write(JSON.stringify(result, null, 2) + '\n');
        process.exitCode = result.success ? 0 : 1;
    }
    catch (e) {
        const msg = 'Agent orchestration failed';
        if (cmd.parent?.opts().json) {
            process.stdout.write(JSON.stringify({ success: false, logs: [msg, String(e)] }) + '\n');
        }
        else {
            console.error(chalk.red(msg + ': ' + e));
        }
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
    .action(async () => {
    const plugins = await getPlugins();
    if (plugins.length === 0) {
        console.log(chalk.yellow('No plugins found in ./plugins.'));
        return;
    }
    for (const plugin of plugins) {
        const desc = plugin.describe ? plugin.describe() : { name: plugin.name };
        if (program.opts().json) {
            console.log(JSON.stringify(desc, null, 2));
        }
        else {
            if (typeof desc === 'object' && desc && 'name' in desc) {
                const name = desc.name;
                const description = desc.description || 'No description';
                console.log(chalk.green(name) + ': ' + description);
            }
            else {
                console.log(chalk.green(plugin.name));
            }
        }
    }
});
pluginsCmd
    .command('run <plugin>')
    .description('Run a plugin by name')
    .allowUnknownOption(true)
    .action(async (pluginName) => {
    const plugins = await getPlugins();
    const plugin = plugins.find(p => p.name === pluginName);
    if (!plugin || typeof plugin.run !== 'function') {
        console.error(chalk.red(`Plugin '${pluginName}' not found or missing run() export.`));
        process.exit(1);
    }
    try {
        const result = await plugin.run();
        if (program.opts().json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log(chalk.green(`[plugin:${pluginName}]`), result);
        }
    }
    catch (e) {
        console.error(chalk.red(`[plugin:${pluginName}] Error: ${e}`));
        process.exit(1);
    }
});
// Add describe command
program
    .command('describe <name>')
    .description('Describe a module or plugin (with schema, for LLM/agent use)')
    .option('--json', 'Output as JSON')
    .option('--openapi', 'Output as OpenAPI fragment (if available)')
    .action(async (name, opts) => {
    try {
        const desc = await describeCapability(name);
        if (opts.openapi && desc && typeof desc === 'object' && desc !== null && 'schema' in desc) {
            // For now, just output the schema as OpenAPI fragment (future: full OpenAPI conversion)
            if (opts.json) {
                console.log(JSON.stringify({ openapi: desc.schema }, null, 2));
            }
            else {
                console.log('OpenAPI fragment:', JSON.stringify(desc.schema, null, 2));
            }
            return;
        }
        if (opts.json) {
            console.log(JSON.stringify(desc, null, 2));
        }
        else {
            console.log(desc);
        }
    }
    catch (e) {
        console.error(chalk.red('Failed to describe capability:'), e);
        process.exit(1);
    }
});
program
    .command('context-chunk')
    .description('Output a context snapshot chunked to fit a given byte size')
    .option('--size <bytes>', 'Max byte size for the context chunk', '16000')
    .action((opts) => {
    const size = parseInt(opts.size, 10);
    const chunk = getContextChunk(size);
    console.log(JSON.stringify(chunk, null, 2));
});
program
    .command('recent-messages')
    .description('Output the N most recent protocol messages')
    .option('--count <n>', 'Number of recent messages to return', '10')
    .action((opts) => {
    const n = parseInt(opts.count, 10);
    const msgs = getRecentMessages(n);
    console.log(JSON.stringify(msgs, null, 2));
});
// Default to help if no command is given
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
(async () => {
    // Load config at startup
    const cliArgs = process.argv.slice(2);
    let configFile;
    const configFlagIdx = cliArgs.indexOf('--config');
    if (configFlagIdx !== -1 && cliArgs[configFlagIdx + 1]) {
        configFile = cliArgs[configFlagIdx + 1];
    }
    const config = await loadAiHelpersConfig(configFile ? { configFile } : {});
    // Attach config to program for access in commands
    program.aiHelpersConfig = config;
})();
function analyticsEnabled(program) {
    if (program.opts().analytics)
        return true;
    if (program.opts().noAnalytics)
        return false;
    if (program.aiHelpersConfig?.analytics === true)
        return true;
    if (process.env.AIHELPERS_ANALYTICS === '1')
        return true;
    return false;
}
function logAnalytics(program, event, data = {}) {
    if (!analyticsEnabled(program))
        return;
    const logFile = path.join(process.cwd(), '.nootropic-analytics.log');
    const entry = { timestamp: new Date().toISOString(), event, ...data };
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}
program.parseAsync(process.argv);
