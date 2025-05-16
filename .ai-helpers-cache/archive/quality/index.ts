// @ts-expect-error TS(2305): Module '"./selfcheck.js"' has no exported member '... Remove this comment to see the full error message
import { runQualityChecks } from './selfcheck.js';

// @ts-expect-error TS(2304): Cannot find name 'async'.
(async () => {
  await runQualityChecks();
  console.log('[quality] All enabled quality checks completed.');
})(); 