[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / BaseAgent

# Class: BaseAgent

Defined in: [src/agents/BaseAgent.ts:38](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L38)

BaseAgent: Base class for all nootropic agents.

LLM/AI-usage: Implements runtime validation for all agent contracts using Zod schemas. All subclasses must validate inputs/outputs. Extension points for new agent types, tools, and event-driven logic.
Extension: Add new agent types, tools, or event-driven logic as needed.

Main Methods:
  - listTools(): Dynamically discover available tools/plugins
  - runTask(task, logger?): Run a task using available tools (stub)
  - getContext(): Get agent context (stub)
  - startEventLoop(): Stub for starting an event-driven runtime loop
  - describe(): Returns a machine-usable description of the agent capability

## Extended by

- [`ContentAgent`](ContentAgent.md)
- [`CollectionAgent`](CollectionAgent.md)
- [`ReviewAgent`](ReviewAgent.md)

## Implements

- `Capability`

## Constructors

### Constructor

> **new BaseAgent**(`profile`): `BaseAgent`

Defined in: [src/agents/BaseAgent.ts:43](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L43)

#### Parameters

##### profile

###### name

`string` = `...`

#### Returns

`BaseAgent`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [src/agents/BaseAgent.ts:39](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L39)

Unique name of the capability (agent, plugin, adapter, tool)

#### Implementation of

`Capability.name`

***

### context?

> `optional` **context**: `object`

Defined in: [src/agents/BaseAgent.ts:40](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L40)

#### agentId

> **agentId**: `string`

***

### tools

> **tools**: `AgentTool`[] = `[]`

Defined in: [src/agents/BaseAgent.ts:41](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L41)

***

### profile

> **profile**: `object`

Defined in: [src/agents/BaseAgent.ts:43](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L43)

#### name

> **name**: `string`

## Methods

### listTools()

> **listTools**(): `Promise`\<`AgentTool`[]\>

Defined in: [src/agents/BaseAgent.ts:56](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L56)

Dynamically discover available tools/plugins.

#### Returns

`Promise`\<`AgentTool`[]\>

***

### runTask()

> **runTask**(`task`, `logger?`): `Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

Defined in: [src/agents/BaseAgent.ts:67](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L67)

Run a task using available tools (stub: override in subclasses).

#### Parameters

##### task

###### id

`string` = `...`

###### description

`string` = `...`

##### logger?

[`AgentLogger`](../type-aliases/AgentLogger.md)

#### Returns

`Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

***

### getContext()

> **getContext**(): `Promise`\<\{ `agentId`: `string`; \}\>

Defined in: [src/agents/BaseAgent.ts:74](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L74)

Get agent context (stub: override in subclasses).

#### Returns

`Promise`\<\{ `agentId`: `string`; \}\>

***

### subscribeToEvent()

> `protected` **subscribeToEvent**(`topic`, `handler`): `void`

Defined in: [src/agents/BaseAgent.ts:79](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L79)

Subscribe to an event topic with a handler.

#### Parameters

##### topic

`string`

##### handler

(`event`) => `void` \| `Promise`\<`void`\>

#### Returns

`void`

***

### publishEvent()

> `protected` **publishEvent**(`event`): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:84](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L84)

Publish an event to the event bus.

#### Parameters

##### event

[`AgentEvent`](../type-aliases/AgentEvent.md)

#### Returns

`Promise`\<`void`\>

***

### buildAgentEvent()

> `protected` **buildAgentEvent**(`partial`): [`AgentEvent`](../type-aliases/AgentEvent.md)

Defined in: [src/agents/BaseAgent.ts:90](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L90)

Helper to build a valid AgentEvent from partials (adds type, timestamp, etc.).

#### Parameters

##### partial

`Partial`\<[`AgentEvent`](../type-aliases/AgentEvent.md)\> & `object`

#### Returns

[`AgentEvent`](../type-aliases/AgentEvent.md)

***

### logEvent()

> `protected` **logEvent**(`level`, `message`, `details?`): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:111](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L111)

Emit a structured log event for observability.

#### Parameters

##### level

`"error"` | `"info"` | `"warn"`

##### message

`string`

##### details?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>

***

### startEventLoop()

> **startEventLoop**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:121](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L121)

Stub for starting an event-driven runtime loop.

#### Returns

`Promise`\<`void`\>

***

### describe()

> `static` **describe**(): `CapabilityDescribe`

Defined in: [src/agents/BaseAgent.ts:127](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L127)

Returns a machine-usable description of the agent capability.

#### Returns

`CapabilityDescribe`

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/agents/BaseAgent.ts:188](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L188)

Instance describe() for registry compliance.

#### Returns

`CapabilityDescribe`

#### Implementation of

`Capability.describe`

***

### health()

> **health**(): `Promise`\<`HealthStatus`\>

Defined in: [src/agents/BaseAgent.ts:193](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L193)

Optional: Health/status check for observability and orchestration.

#### Returns

`Promise`\<`HealthStatus`\>

#### Implementation of

`Capability.health`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:199](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L199)

Optional: Graceful shutdown/cleanup.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.shutdown`

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:204](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L204)

Optional: Hot-reload logic for dynamic updates.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.reload`

***

### onEvent()

> **onEvent**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:209](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L209)

Optional: Event hook for event-driven orchestration.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.onEvent`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:214](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L214)

Optional: Initialization logic for agent startup.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Capability.init`

***

### baseAgentStub()

> `protected` **baseAgentStub**(`_`): `Promise`\<`string`\>

Defined in: [src/agents/BaseAgent.ts:219](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L219)

#### Parameters

##### \_

`string`

#### Returns

`Promise`\<`string`\>
