[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / CrewAIAdapter

# Class: CrewAIAdapter

Defined in: [src/adapters/crewAIAdapter.ts:11](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L11)

CrewAIAdapter: Adapter for CrewAI agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.

## Implements

- `unknown`
- `Capability`

## Constructors

### Constructor

> **new CrewAIAdapter**(): `CrewAIAdapter`

#### Returns

`CrewAIAdapter`

## Properties

### name

> `readonly` **name**: `"CrewAIAdapter"` = `'CrewAIAdapter'`

Defined in: [src/adapters/crewAIAdapter.ts:12](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L12)

Unique name of the capability (agent, plugin, adapter, tool)

#### Implementation of

`Capability.name`

## Methods

### runAgentTask()

> **runAgentTask**(`agentProfile`, `task`, `context?`, `logger?`): `Promise`\<`AgentResult`\>

Defined in: [src/adapters/crewAIAdapter.ts:14](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L14)

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

Defined in: [src/adapters/crewAIAdapter.ts:48](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L48)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<`AgentContext`\>

***

### listAgents()

> **listAgents**(): `Promise`\<`AgentProfile`[]\>

Defined in: [src/adapters/crewAIAdapter.ts:53](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L53)

#### Returns

`Promise`\<`AgentProfile`[]\>

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/adapters/crewAIAdapter.ts:60](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L60)

Optional: Initialize the capability (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.init`

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/adapters/crewAIAdapter.ts:67](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L67)

Optional: Hot-reload logic (no-op for now).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.reload`

***

### health()

> **health**(): `Promise`\<`HealthStatus`\>

Defined in: [src/adapters/crewAIAdapter.ts:74](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L74)

Health check for capability status.

#### Returns

`Promise`\<`HealthStatus`\>

#### Implementation of

`Capability.health`

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/adapters/crewAIAdapter.ts:81](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/adapters/crewAIAdapter.ts#L81)

Returns a machine-usable, LLM-friendly description of the adapter capability.

#### Returns

`CapabilityDescribe`

#### Implementation of

`Capability.describe`
