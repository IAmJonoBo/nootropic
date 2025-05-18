#!/usr/bin/env node
// @ts-ignore
import { listPlugins } from '../pluginRegistry.js';
// @ts-ignore
import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from '../src/utils/feedback/pluginFeedback.js';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
/**
 * Plugin Marketplace CLI Utility (refactored for standard CLI helpers)
 *
 * Usage:
 *   pnpm tsx scripts/pluginMarketplaceCli.ts \<command\> [options]
 *
 * Commands:
 *   list                        List all plugins
 *   show \<pluginName\>           Show details and feedback for a plugin
 *   feedback \<pluginName\> \<user\> \<rating 1-5\> [review]   Submit feedback for a plugin
 *
 * Flags:
 *   --help         Show usage information and exit
 *   --json         Output results in JSON format
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for pluginMarketplaceCli script."
 *   - "List all plugins with machine-readable output."
 *   - "Submit plugin feedback as JSON."
 */
const options = {
    'help': { desc: 'Show help', type: 'boolean' },
    'json': { desc: 'Output in JSON format', type: 'boolean' }
};
async function handleListCommand(args) {
    const plugins = await listPlugins();
    if (args['json']) {
        printResult(plugins, args['json']);
    }
    else {
        for (const p of plugins) {
            const agg = p.feedbackAggregate ?? await aggregatePluginFeedback(p.name);
            console.log(`\n${p.name} (${p.type})`);
            if (agg) {
                console.log(`  ⭐ ${agg.averageRating.toFixed(2)} (${agg.reviewCount} reviews)`);
            }
            if (p.meta?.['description']) {
                console.log(`  ${typeof p.meta['description'] === 'string' ? p.meta['description'] : JSON.stringify(p.meta['description'])}`);
            }
        }
    }
}
async function handleShowCommand(args, cmdArgs) {
    const [name] = cmdArgs;
    if (!name)
        return printError('Usage: pluginMarketplaceCli show <pluginName>', args['json']);
    const plugins = await listPlugins();
    const p = plugins.find((x) => x.name === name);
    if (!p)
        return printError('Plugin not found', args['json']);
    if (args['json']) {
        const feedbacks = await listFeedbackForPlugin(name);
        printResult({ plugin: p, feedbacks }, args['json']);
    }
    else {
        console.log(JSON.stringify(p, null, 2));
        const feedbacks = await listFeedbackForPlugin(name);
        if (feedbacks.length) {
            console.log('\nRecent feedback:');
            for (const fb of feedbacks.slice(-5)) {
                console.log(`- [${fb.rating}] ${fb.user}: ${fb.review ?? ''}`);
            }
        }
    }
}
async function handleFeedbackCommand(args, cmdArgs) {
    const [pluginName, user, ratingStr, ...reviewArr] = cmdArgs;
    if (!pluginName || !user || !ratingStr) {
        return printError('Usage: pluginMarketplaceCli feedback <pluginName> <user> <rating 1-5> [review]', args['json']);
    }
    const rating = Number(ratingStr);
    if (isNaN(rating) ?? rating < 1 ?? rating > 5) {
        return printError('Rating must be a number 1-5', args['json']);
    }
    const review = reviewArr.join(' ');
    await submitPluginFeedback({ pluginName, user, rating, review, timestamp: new Date().toISOString() });
    printResult('Feedback submitted!', args['json']);
}
async function main() {
    const { args, showHelp } = parseCliArgs({ options });
    // Extract positionals after flags (skip node, script, and any --flag args)
    const positionals = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
    const [cmd, ...cmdArgs] = positionals;
    if (showHelp || !cmd) {
        return printUsage(`Usage: pnpm tsx scripts/pluginMarketplaceCli.ts <command> [options]\n\nCommands:\n  list\n  show <pluginName>\n  feedback <pluginName> <user> <rating 1-5> [review]`, options);
    }
    try {
        if (cmd === 'list') {
            await handleListCommand(args);
        }
        else if (cmd === 'show') {
            await handleShowCommand(args, cmdArgs);
        }
        else if (cmd === 'feedback') {
            await handleFeedbackCommand(args, cmdArgs);
        }
        else {
            return printUsage(`Usage: pnpm tsx scripts/pluginMarketplaceCli.ts <command> [options]\n\nCommands:\n  list\n  show <pluginName>\n  feedback <pluginName> <user> <rating 1-5> [review]`, options);
        }
    }
    catch (e) {
        printError(e, args['json']);
        process.exit(1);
    }
}
main().catch(e => { printError(e); process.exit(1); });
