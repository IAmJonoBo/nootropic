[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / CollectionAgent

# Class: CollectionAgent

Defined in: [src/agents/CollectionAgent.ts:20](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L20)

BaseAgent: Base class for all nootropic agents.

LLM/AI-usage: Implements runtime validation for all agent contracts using Zod schemas. All subclasses must validate inputs/outputs. Extension points for new agent types, tools, and event-driven logic.
Extension: Add new agent types, tools, or event-driven logic as needed.

Main Methods:
  - listTools(): Dynamically discover available tools/plugins
  - runTask(task, logger?): Run a task using available tools (stub)
  - getContext(): Get agent context (stub)
  - startEventLoop(): Stub for starting an event-driven runtime loop
  - describe(): Returns a machine-usable description of the agent capability

## Extends

- [`BaseAgent`](BaseAgent.md)

## Constructors

### Constructor

> **new CollectionAgent**(`options`): `CollectionAgent`

Defined in: [src/agents/CollectionAgent.ts:53](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L53)

#### Parameters

##### options

`BaseAgentOptions`

#### Returns

`CollectionAgent`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`constructor`](BaseAgent.md#constructor)

## Properties

### context?

> `optional` **context**: `object`

Defined in: [src/agents/BaseAgent.ts:40](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L40)

#### agentId

> **agentId**: `string`

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`context`](BaseAgent.md#context)

***

### tools

> **tools**: `AgentTool`[] = `[]`

Defined in: [src/agents/BaseAgent.ts:41](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L41)

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`tools`](BaseAgent.md#tools)

***

### profile

> **profile**: `object`

Defined in: [src/agents/BaseAgent.ts:43](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L43)

#### name

> **name**: `string`

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`profile`](BaseAgent.md#profile)

***

### name

> `readonly` **name**: `string`

Defined in: [src/agents/CollectionAgent.ts:21](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L21)

Unique name of the capability (agent, plugin, adapter, tool)

#### Overrides

[`BaseAgent`](BaseAgent.md).[`name`](BaseAgent.md#name)

***

### inputSchema

> `static` **inputSchema**: `object`

Defined in: [src/agents/CollectionAgent.ts:23](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L23)

#### type

> **type**: `string` = `'object'`

#### properties

> **properties**: `object`

##### properties.task

> **task**: `object`

##### properties.task.type

> **type**: `string` = `'object'`

##### properties.task.properties

> **properties**: `object`

##### properties.task.properties.query

> **query**: `object`

##### properties.task.properties.query.type

> **type**: `string` = `'string'`

##### properties.task.properties.query.description

> **description**: `string` = `'The data query or topic to collect.'`

##### properties.task.required

> **required**: `string`[]

##### properties.logger

> **logger**: `object`

##### properties.logger.type

> **type**: `string`[]

#### required

> **required**: `string`[]

***

### outputSchema

> `static` **outputSchema**: `object`

Defined in: [src/agents/CollectionAgent.ts:37](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L37)

#### type

> **type**: `string` = `'object'`

#### properties

> **properties**: `object`

##### properties.output

> **output**: `object`

##### properties.output.type

> **type**: `string` = `'object'`

##### properties.output.properties

> **properties**: `object`

##### properties.output.properties.data

> **data**: `object`

##### properties.output.properties.data.type

> **type**: `string` = `'object'`

##### properties.output.required

> **required**: `string`[]

##### properties.success

> **success**: `object`

##### properties.success.type

> **type**: `string` = `'boolean'`

##### properties.logs

> **logs**: `object`

##### properties.logs.type

> **type**: `string` = `'array'`

##### properties.logs.items

> **items**: `object`

##### properties.logs.items.type

> **type**: `string` = `'string'`

#### required

> **required**: `string`[]

## Methods

### listTools()

> **listTools**(): `Promise`\<`AgentTool`[]\>

Defined in: [src/agents/BaseAgent.ts:56](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L56)

Dynamically discover available tools/plugins.

#### Returns

`Promise`\<`AgentTool`[]\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`listTools`](BaseAgent.md#listtools)

***

### getContext()

> **getContext**(): `Promise`\<\{ `agentId`: `string`; \}\>

Defined in: [src/agents/BaseAgent.ts:74](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L74)

Get agent context (stub: override in subclasses).

#### Returns

`Promise`\<\{ `agentId`: `string`; \}\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`getContext`](BaseAgent.md#getcontext)

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

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`subscribeToEvent`](BaseAgent.md#subscribetoevent)

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

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`publishEvent`](BaseAgent.md#publishevent)

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

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`buildAgentEvent`](BaseAgent.md#buildagentevent)

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

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`logEvent`](BaseAgent.md#logevent)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:199](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L199)

Optional: Graceful shutdown/cleanup.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`shutdown`](BaseAgent.md#shutdown)

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:204](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L204)

Optional: Hot-reload logic for dynamic updates.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`reload`](BaseAgent.md#reload)

***

### onEvent()

> **onEvent**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:209](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L209)

Optional: Event hook for event-driven orchestration.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`onEvent`](BaseAgent.md#onevent)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/agents/BaseAgent.ts:214](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L214)

Optional: Initialization logic for agent startup.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`init`](BaseAgent.md#init)

***

### baseAgentStub()

> `protected` **baseAgentStub**(`_`): `Promise`\<`string`\>

Defined in: [src/agents/BaseAgent.ts:219](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L219)

#### Parameters

##### \_

`string`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`baseAgentStub`](BaseAgent.md#baseagentstub)

***

### runTask()

> **runTask**(`task`, `logger?`): `Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

Defined in: [src/agents/CollectionAgent.ts:58](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L58)

Run a task using available tools (stub: override in subclasses).

#### Parameters

##### task

###### id

`string` = `...`

###### description

`string` = `...`

###### query

`string` = `...`

##### logger?

[`AgentLogger`](../type-aliases/AgentLogger.md)

#### Returns

`Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`runTask`](BaseAgent.md#runtask)

***

### startEventLoop()

> **startEventLoop**(): `Promise`\<`void`\>

Defined in: [src/agents/CollectionAgent.ts:89](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L89)

Stub for starting an event-driven runtime loop.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`startEventLoop`](BaseAgent.md#starteventloop)

***

### describe()

> `static` **describe**(): `CapabilityDescribe`

Defined in: [src/agents/CollectionAgent.ts:153](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L153)

Returns a machine-usable description of the agent capability.

#### Returns

`CapabilityDescribe`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe)

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/agents/CollectionAgent.ts:179](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L179)

Instance describe() for registry compliance.

#### Returns

`CapabilityDescribe`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe-2)

***

### health()

> **health**(): `Promise`\<\{ `status`: `"ok"`; `timestamp`: `string`; \}\>

Defined in: [src/agents/CollectionAgent.ts:183](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/CollectionAgent.ts#L183)

Optional: Health/status check for observability and orchestration.

#### Returns

`Promise`\<\{ `status`: `"ok"`; `timestamp`: `string`; \}\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`health`](BaseAgent.md#health)
