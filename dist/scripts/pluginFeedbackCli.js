#!/usr/bin/env tsx
/**
 * pluginFeedbackCli.ts
 * CLI for submitting, listing, and aggregating plugin feedback.
 * Usage: pnpm tsx scripts/pluginFeedbackCli.ts <command> [args]
 * Commands:
 *   submit <pluginName> <user> <rating> [review]
 *   list <pluginName>
 *   aggregate <pluginName>
 * Flags:
 *   --help   Show usage information and exit
 *
 * LLM/AI usage hints:
 *   - "Show usage for pluginFeedbackCli script."
 *   - "How do I submit plugin feedback from the CLI?"
 *   - "How do I list or aggregate plugin feedback?"
 */
import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from '../src/utils/feedback/pluginFeedback.js';
function printUsage() {
    console.log(`Usage: pnpm tsx scripts/pluginFeedbackCli.ts <command> [args]\n\nCommands:\n  submit <pluginName> <user> <rating> [review]\n  list <pluginName>\n  aggregate <pluginName>\n\nFlags:\n  --help   Show usage information and exit\n\nLLM/AI usage hints:\n  - "Show usage for pluginFeedbackCli script."\n  - "How do I submit plugin feedback from the CLI?"\n  - "How do I list or aggregate plugin feedback?"`);
}
async function main() {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === '--help' || !cmd) {
        printUsage();
        process.exit(0);
    }
    try {
        if (cmd === 'submit') {
            const [pluginName, user, ratingStr, ...reviewParts] = args;
            if (!pluginName || !user || !ratingStr) {
                printUsage();
                process.exit(1);
            }
            const rating = Number(ratingStr);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                console.error('Rating must be a number between 1 and 5.');
                process.exit(1);
            }
            const review = reviewParts.length ? reviewParts.join(' ') : undefined;
            await submitPluginFeedback({ pluginName, user, rating, review, timestamp: new Date().toISOString() });
            console.log('Feedback submitted.');
        }
        else if (cmd === 'list') {
            const [pluginName] = args;
            if (!pluginName) {
                printUsage();
                process.exit(1);
            }
            const feedback = await listFeedbackForPlugin(pluginName);
            console.log(JSON.stringify(feedback, null, 2));
        }
        else if (cmd === 'aggregate') {
            const [pluginName] = args;
            if (!pluginName) {
                printUsage();
                process.exit(1);
            }
            const aggregate = await aggregatePluginFeedback(pluginName);
            console.log(JSON.stringify(aggregate, null, 2));
        }
        else {
            printUsage();
            process.exit(1);
        }
    }
    catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
main();
