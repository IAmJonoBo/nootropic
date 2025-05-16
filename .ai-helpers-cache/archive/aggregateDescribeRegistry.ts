#!/usr/bin/env tsx
// @ts-expect-error TS(2305): Module '"../utils.js"' has no exported member 'agg... Remove this comment to see the full error message
import { aggregateDescribeRegistry } from '../utils.js';

// @ts-expect-error TS(2304): Cannot find name 'async'.
(async () => {
  try {
    await aggregateDescribeRegistry();
    console.log('Describe registry aggregation complete.');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(0);
  // @ts-expect-error TS(7006): Parameter 'e' implicitly has an 'any' type.
  } catch (e) {
    console.error('Failed to aggregate describe registry:', e);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
})(); 