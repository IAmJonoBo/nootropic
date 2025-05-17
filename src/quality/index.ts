// @ts-ignore
import { runQualityChecks } from './selfcheck.js';

(async () => {
  await runQualityChecks();
  console.log('[quality] All enabled quality checks completed.');
})(); 