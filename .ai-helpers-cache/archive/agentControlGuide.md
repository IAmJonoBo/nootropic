# Agent Control Utility Guide (nootropic/agentControl.ts)

## What This Utility Does
- Lists all context, mutation, patch, and log files in nootropic/ (with size and last modified time).
- Prunes (deletes) old or large files by age, count, or total size.
- Prunes specific fields (e.g., semantic index, agent messages, memory lane) in JSON files by item count or age.
- Exports all utilities for agent or human use.
- CLI and programmatic API for maximum flexibility.

---

## CLI Usage Examples

**List all files and their sizes:**
```sh
pnpm tsx nootropic/agentControl.ts --list
```

**Prune old files by age (e.g., delete files older than 7 days):**
```sh
pnpm tsx nootropic/agentControl.ts --prune
```

*To customize pruning (by count, size, etc.), use the programmatic API below.*

---

## Programmatic API Usage

```js
import { listFiles, pruneFiles, pruneJsonField } from './agentControl.js';

// List all files
const files = listFiles();

// Prune files older than 14 days or keep only the 10 most recent
pruneFiles({ maxAgeDays: 14, maxCount: 10 });

// Prune semantic index in context-snapshot.json to last 1000 items
pruneJsonField('context-snapshot.json', 'semanticIndex', { maxItems: 1000 });

// Prune agentMessages in context-snapshot.json to last 30 days
pruneJsonField('context-snapshot.json', 'agentMessages', { maxAgeDays: 30 });
```

---

## Best Practices
- Run this utility regularly if you have long-running agents or a large codebase.
- Use prune options to keep only the most relevant context and avoid disk/memory bloat.
- Combine with the real-time server for automated, event-driven cleanup.

---

## Where to Find Everything
- All context, mutation, and patch files: `nootropic/`
- All logs (if any): `nootropic/logs/`
- All utilities and APIs: `nootropic/agentControl.ts` (import and use as needed)

---

*All features are AI-focused and extensible. Add new cleanup, archiving, or compression features as needed!* 