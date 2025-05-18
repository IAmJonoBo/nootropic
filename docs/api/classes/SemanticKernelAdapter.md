[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / SemanticKernelAdapter

# Class: SemanticKernelAdapter

Defined in: [src/adapters/semanticKernelAdapter.ts:11](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L11)

SemanticKernelAdapter: Adapter for Semantic Kernel agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.

## Implements

- `unknown`
- `Capability`

## Constructors

### Constructor

> **new SemanticKernelAdapter**(): `SemanticKernelAdapter`

#### Returns

`SemanticKernelAdapter`

## Properties

### name

> `readonly` **name**: `"SemanticKernelAdapter"` = `'SemanticKernelAdapter'`

Defined in: [src/adapters/semanticKernelAdapter.ts:12](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L12)

Unique name of the capability (agent, plugin, adapter, tool)

#### Implementation of

`Capability.name`

## Methods

### runAgentTask()

> **runAgentTask**(`agentProfile`, `task`, `context?`, `logger?`): `Promise`\<`AgentResult`\>

Defined in: [src/adapters/semanticKernelAdapter.ts:14](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L14)

#### Parameters

##### agentProfile

`AgentProfile`

##### task

`AgentTask`

##### context?

`any`

##### logger?

`any`

#### Returns

`Promise`\<`AgentResult`\>

***

### getAgentContext()

> **getAgentContext**(`agentId`): `Promise`\<`AgentContext`\>

Defined in: [src/adapters/semanticKernelAdapter.ts:49](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L49)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<`AgentContext`\>

***

### listAgents()

> **listAgents**(): `Promise`\<`AgentProfile`[]\>

Defined in: [src/adapters/semanticKernelAdapter.ts:53](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L53)

#### Returns

`Promise`\<`AgentProfile`[]\>

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/adapters/semanticKernelAdapter.ts:60](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L60)

Optional: Initialize the capability (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.init`

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/adapters/semanticKernelAdapter.ts:67](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L67)

Optional: Hot-reload logic (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.reload`

***

### health()

> **health**(): `Promise`\<`HealthStatus`\>

Defined in: [src/adapters/semanticKernelAdapter.ts:74](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L74)

Health check for capability status.

#### Returns

`Promise`\<`HealthStatus`\>

#### Implementation of

`Capability.health`

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/adapters/semanticKernelAdapter.ts:82](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/semanticKernelAdapter.ts#L82)

Returns a machine-usable, LLM-friendly description of the adapter capability.
NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.

#### Returns

`CapabilityDescribe`

#### Implementation of

`Capability.describe`
