[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / LangChainAdapter

# Class: LangChainAdapter

Defined in: [src/adapters/langchainAdapter.ts:11](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L11)

LangChainAdapter: Adapter for LangChain agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.

## Implements

- [`AgentOrchestrationEngine`](../type-aliases/AgentOrchestrationEngine.md)
- `Capability`

## Constructors

### Constructor

> **new LangChainAdapter**(): `LangChainAdapter`

#### Returns

`LangChainAdapter`

## Properties

### name

> `readonly` **name**: `"LangChainAdapter"` = `'LangChainAdapter'`

Defined in: [src/adapters/langchainAdapter.ts:12](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L12)

Unique name of the capability (agent, plugin, adapter, tool)

#### Implementation of

`Capability.name`

## Methods

### runAgentTask()

> **runAgentTask**(`agentProfile`, `task`, `context?`, `logger?`): `Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

Defined in: [src/adapters/langchainAdapter.ts:14](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L14)

#### Parameters

##### agentProfile

###### name

`string` = `...`

##### task

###### id

`string` = `...`

###### description

`string` = `...`

##### context?

###### agentId

`string` = `...`

##### logger?

[`AgentLogger`](../type-aliases/AgentLogger.md)

#### Returns

`Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

#### Implementation of

`AgentOrchestrationEngine.runAgentTask`

***

### getAgentContext()

> **getAgentContext**(`agentId`): `Promise`\<\{ `agentId`: `string`; \}\>

Defined in: [src/adapters/langchainAdapter.ts:49](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L49)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<\{ `agentId`: `string`; \}\>

#### Implementation of

`AgentOrchestrationEngine.getAgentContext`

***

### listAgents()

> **listAgents**(): `Promise`\<`object`[]\>

Defined in: [src/adapters/langchainAdapter.ts:54](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L54)

#### Returns

`Promise`\<`object`[]\>

#### Implementation of

`AgentOrchestrationEngine.listAgents`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/adapters/langchainAdapter.ts:61](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L61)

Optional: Initialize the capability (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.init`

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/adapters/langchainAdapter.ts:68](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L68)

Optional: Hot-reload logic (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.reload`

***

### health()

> **health**(): `Promise`\<`HealthStatus`\>

Defined in: [src/adapters/langchainAdapter.ts:75](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L75)

Health check for capability status.

#### Returns

`Promise`\<`HealthStatus`\>

#### Implementation of

`Capability.health`

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/adapters/langchainAdapter.ts:83](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/langchainAdapter.ts#L83)

Returns a machine-usable, LLM-friendly description of the adapter capability.
NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.

#### Returns

`CapabilityDescribe`

#### Implementation of

`Capability.describe`
