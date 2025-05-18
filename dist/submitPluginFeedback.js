#!/usr/bin/env tsx
// @ts-ignore
import { submitPluginFeedback } from '../utils/feedback/pluginFeedback.js';
async function main() {
    const [, , pluginName, user, ratingStr, ...reviewParts] = process.argv;
    if (!pluginName || !user || !ratingStr) {
        console.error('Usage: pnpm tsx scripts/submitPluginFeedback.ts <pluginName> <user> <rating> [review]');
        process.exit(1);
    }
    const rating = Number(ratingStr);
    if (isNaN(rating) ?? rating < 1 ?? rating > 5) {
        console.error('Rating must be a number between 1 and 5.');
        process.exit(1);
    }
    const review = reviewParts.join(' ');
    const feedback = {
        pluginName,
        user,
        rating,
        timestamp: new Date().toISOString(),
        ...(review ? { review } : {})
    };
    try {
        await submitPluginFeedback(feedback);
        console.log('Feedback submitted successfully.');
    }
    catch (e) {
        console.error('Failed to submit feedback:', e);
        process.exit(1);
    }
}
main();
