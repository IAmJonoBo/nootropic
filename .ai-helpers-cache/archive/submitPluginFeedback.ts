#!/usr/bin/env tsx
import { submitPluginFeedback } from '../utils/feedback/pluginFeedback.js';

async function main() {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const [,, pluginName, user, ratingStr, ...reviewParts] = process.argv;
  if (!pluginName || !user || !ratingStr) {
    console.error('Usage: pnpm tsx scripts/submitPluginFeedback.ts <pluginName> <user> <rating> [review]');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
  const rating = Number(ratingStr);
  if (isNaN(rating) ?? rating < 1 ?? rating > 5) {
    console.error('Rating must be a number between 1 and 5.');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2304): Cannot find name 'feedback'.
    await submitPluginFeedback(feedback);
    console.log('Feedback submitted successfully.');
  } catch (e) {
    console.error('Failed to submit feedback:', e);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
}

main(); 