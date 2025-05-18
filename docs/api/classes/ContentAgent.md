[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / ContentAgent

# Class: ContentAgent

Defined in: [src/agents/ContentAgent.ts:28](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L28)

ContentAgent: Generates content drafts and responds to feedback. Event-driven.

LLM/AI-usage: Fully event-driven, RAG-driven planning, map-reduce summarisation, adaptive tone tuning. Extension points for RAG pipeline, summarisation, and tone model.
Extension: Add new event types, planning/summarisation/tone strategies as needed.

Main Methods:
  - runTask(task, logger?): Enhanced content generation logic
  - runRagPlanning(): Generates a content outline using a RAG pipeline (stub)
  - mapReduceSummarise(content): Summarises content using map-reduce (stub)
  - tuneTone(content, tone): Tunes content tone (stub)
  - submitFeedback(feedback): Accepts feedback for continuous improvement (stub)
  - health(): Health check
  - describe(): Returns a machine-usable description of the agent
Reference: https://github.com/hwchase17/langchain, https://arxiv.org/abs/2304.05128

## Extends

- [`BaseAgent`](BaseAgent.md)

## Constructors

### Constructor

> **new ContentAgent**(`options`): `ContentAgent`

Defined in: [src/agents/ContentAgent.ts:60](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L60)

#### Parameters

##### options

`BaseAgentOptions`

#### Returns

`ContentAgent`

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

Defined in: [src/agents/ContentAgent.ts:29](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L29)

Unique name of the capability (agent, plugin, adapter, tool)

#### Overrides

[`BaseAgent`](BaseAgent.md).[`name`](BaseAgent.md#name)

***

### inputSchema

> `static` **inputSchema**: `object`

Defined in: [src/agents/ContentAgent.ts:30](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L30)

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

##### properties.task.properties.contentPlan

> **contentPlan**: `object`

##### properties.task.properties.contentPlan.type

> **type**: `string` = `'object'`

##### properties.task.properties.contentPlan.description

> **description**: `string` = `'Structured plan or data for content generation.'`

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

Defined in: [src/agents/ContentAgent.ts:44](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L44)

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

##### properties.output.properties.content

> **content**: `object`

##### properties.output.properties.content.type

> **type**: `string` = `'string'`

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

### describe()

> `static` **describe**(): `CapabilityDescribe`

Defined in: [src/agents/BaseAgent.ts:127](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/BaseAgent.ts#L127)

Returns a machine-usable description of the agent capability.

#### Returns

`CapabilityDescribe`

#### Inherited from

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe)

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

### runRagPlanning()

> **runRagPlanning**(): `Promise`\<`string`\>

Defined in: [src/agents/ContentAgent.ts:69](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L69)

Generates a content outline using a RAG pipeline (stub).
Returns a content outline string.

#### Returns

`Promise`\<`string`\>

***

### mapReduceSummarise()

> **mapReduceSummarise**(`content`): `Promise`\<`string`\>

Defined in: [src/agents/ContentAgent.ts:80](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L80)

Summarises content using map-reduce (stub).
'content' is the content to summarise.
Returns a summary string.

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`string`\>

***

### tuneTone()

> **tuneTone**(`content`, `tone`): `Promise`\<`string`\>

Defined in: [src/agents/ContentAgent.ts:91](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L91)

Tunes content tone (stub).
'content' is the content to tune. 'tone' is the target tone.
Returns the tuned content string.

#### Parameters

##### content

`string`

##### tone

`string`

#### Returns

`Promise`\<`string`\>

***

### submitFeedback()

> **submitFeedback**(`feedback`): `Promise`\<`void`\>

Defined in: [src/agents/ContentAgent.ts:101](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L101)

Accepts feedback for continuous improvement (stub).
'feedback' is the feedback string.

#### Parameters

##### feedback

`string`

#### Returns

`Promise`\<`void`\>

***

### health()

> **health**(): `Promise`\<`HealthStatus`\>

Defined in: [src/agents/ContentAgent.ts:110](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L110)

Health check for ContentAgent.
Returns a HealthStatus object.

#### Returns

`Promise`\<`HealthStatus`\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`health`](BaseAgent.md#health)

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/agents/ContentAgent.ts:117](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L117)

Returns a machine-usable description of the agent.

#### Returns

`CapabilityDescribe`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe-2)

***

### runTask()

> **runTask**(`task`, `logger?`): `Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

Defined in: [src/agents/ContentAgent.ts:154](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L154)

Enhanced content generation logic for a given task.
'task' is the content generation task. 'logger' is an optional logger.
Returns an AgentResult.

#### Parameters

##### task

`unknown`

##### logger?

[`AgentLogger`](../type-aliases/AgentLogger.md)

#### Returns

`Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`runTask`](BaseAgent.md#runtask)

***

### startEventLoop()

> **startEventLoop**(): `Promise`\<`void`\>

Defined in: [src/agents/ContentAgent.ts:186](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ContentAgent.ts#L186)

Starts the ContentAgent event-driven runtime loop.
Subscribes to TaskAssigned and DraftFeedback events, processes them, and emits results.
Returns a Promise that resolves when the event loop is started.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`startEventLoop`](BaseAgent.md#starteventloop)
