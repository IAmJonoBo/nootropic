| Capability | Description | Usage | Key Methods/Functions |
|------------|-------------|-------|----------------------|
| agents | Exports all core nootropic agents. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI. 🏅 🔗 | 

```ts
import { BaseAgent, ContentAgent, CollectionAgent, ReviewAgent } from 'nootropic/agents';
``` |  |
| examplePlugin | A sample plugin for nootropic. Demonstrates plugin lifecycle, dynamic event subscription, and hot-reload safety. [Schema] 🏅
Subscribes: Log | Emits: Log | 

```ts
nootropic plugins run examplePlugin
``` |  |
| updateNotifier | Notifies users of available package updates via CLI. Useful for keeping nootropic up to date. 🔗 | 

```ts
import updateNotifierCapability from 'nootropic/utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();
``` | **checkForUpdates**: 
() => void
Checks for updates and notifies the user via CLI. |
| adapterUtils | Utility for dynamic ESM import with fallback and error formatting. Useful for plugin/adapter loading. 🔗 | 

```ts
import adapterUtilsCapability from 'nootropic/utils/plugin/adapterUtils'; await adapterUtilsCapability.tryDynamicImport('module');
``` | **tryDynamicImport**: 
(moduleName: string) => Promise<unknown \| null>
Attempts to dynamically import a module, returns null on failure. |
| SecretsManager | Unified secrets management interface for local, KMS, and Vault backends. [Schema] 🔗 | 

```ts
See LocalSecretsManager and KmsVaultSecretsManager for usage.
``` |  |
| ChunkingUtility | Modular chunking utility supporting fixed-size, sentence, paragraph, semantic, recursive, and agentic chunking strategies. Registry-driven, describe/health compliant. |
| HybridRetrievalUtility | Modular hybrid retrieval utility supporting vector, keyword, graph, and hybrid (weighted fusion) strategies. Registry-driven, describe/health compliant. |
| RerankUtility | Modular reranking utility supporting embedding-based, LLM-based, cross-encoder, and MMR (diversity) reranking. Registry-driven, describe/health compliant. |
| ShimiMemory | SHIMI-style semantic hierarchical memory for distributed agent reasoning and feedback aggregation. Registry-driven, describe/health compliant. |
| pluginFeedback | Plugin feedback/rating/review utility. Registry-driven, describe/health compliant. |
| sastMemories | SAST feedback/memory deduplication and sync utility. Registry-driven, describe/health compliant. |

- All utilities and agents are now auto-registered via barrel files and the central registry (see capabilities/registry.ts).
- All are describe/health compliant and discoverable for LLM/agent workflows.
