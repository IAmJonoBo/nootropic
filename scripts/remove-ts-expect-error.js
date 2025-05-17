const fs = require('fs');
const files = [
  'tests/adapter.nats.context-propagation.test.ts',
  'tests/context/llmAdapterIntegration.test.ts',
  'utils/context/rerank.ts',
  'utils/context/RerankUtility.ts',
  'utils/context/shimiMemory.ts',
  'utils/describe/updateNotifier.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  fs.writeFileSync(file, filtered.join('\n'), 'utf8');
  console.log(`Cleaned: ${file}`);
} 