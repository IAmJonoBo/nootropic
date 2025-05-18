[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / ReviewAgent

# Class: ReviewAgent

Defined in: [src/agents/ReviewAgent.ts:26](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L26)

ReviewAgent: Reviews drafts and provides feedback. Event-driven.
Enhancements: Sentiment-and-aspect analysis, multi-pass chain-of-thought (SCoT) review, ensemble scoring.
Extension points: LLM/embedding backend for sentiment/aspect analysis, multi-model ensemble scoring, custom multi-pass review logic.
Reference: https://huggingface.co/tasks/sentiment-analysis

## Extends

- [`BaseAgent`](BaseAgent.md)

## Constructors

### Constructor

> **new ReviewAgent**(`options`): `ReviewAgent`

Defined in: [src/agents/ReviewAgent.ts:60](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L60)

#### Parameters

##### options

`BaseAgentOptions` & `object`

#### Returns

`ReviewAgent`

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

### inputSchema

> `static` **inputSchema**: `object`

Defined in: [src/agents/ReviewAgent.ts:27](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L27)

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

##### properties.task.properties.content

> **content**: `object`

##### properties.task.properties.content.type

> **type**: `string` = `'string'`

##### properties.task.properties.content.description

> **description**: `string` = `'Content to review.'`

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

Defined in: [src/agents/ReviewAgent.ts:41](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L41)

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

##### properties.output.properties.review

> **review**: `object`

##### properties.output.properties.review.type

> **type**: `string` = `'string'`

##### properties.output.properties.score

> **score**: `object`

##### properties.output.properties.score.type

> **type**: `string` = `'number'`

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

***

### name

> `readonly` **name**: `string`

Defined in: [src/agents/ReviewAgent.ts:58](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L58)

Unique name of the capability (agent, plugin, adapter, tool)

#### Overrides

[`BaseAgent`](BaseAgent.md).[`name`](BaseAgent.md#name)

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

### sentimentAndAspectAnalysis()

> **sentimentAndAspectAnalysis**(`content`): `Promise`\<\{ `sentiment`: `string`; `aspects`: `Record`\<`string`, `string`\>; \}\>

Defined in: [src/agents/ReviewAgent.ts:70](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L70)

LLM-powered sentiment and aspect analysis. Extension: HuggingFace, Ollama, or local LLM.
'content' is the content to analyze.
Returns sentiment and aspects.

#### Parameters

##### content

`string`

#### Returns

`Promise`\<\{ `sentiment`: `string`; `aspects`: `Record`\<`string`, `string`\>; \}\>

***

### multiPassChainOfThought()

> **multiPassChainOfThought**(`content`): `Promise`\<`string`[]\>

Defined in: [src/agents/ReviewAgent.ts:94](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L94)

Multi-pass chain-of-thought review. Extension: SCoT pipeline, LLM/embedding backend.
'content' is the content to review.
Returns an array of review pass results.

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`string`[]\>

***

### ensembleScoring()

> **ensembleScoring**(`content`): `Promise`\<`number`\>

Defined in: [src/agents/ReviewAgent.ts:114](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L114)

Aggregate scores from multiple models. Extension: quantized LLMs, voting/aggregation strategies.
'content' is the content to score.
Returns a heuristic score (0-10).

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`number`\>

***

### runTask()

> **runTask**(`task`, `logger?`): `Promise`\<\{ `output?`: `unknown`; `success`: `boolean`; `logs?`: `string`[]; \}\>

Defined in: [src/agents/ReviewAgent.ts:130](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L130)

Reviews outputs using sentiment analysis, multi-pass SCoT, and ensemble scoring.
'task' is the ReviewerTask input. 'logger' is an optional logger.
Returns AgentResult.

#### Parameters

##### task

###### id

`string` = `...`

###### description

`string` = `...`

###### content

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

Defined in: [src/agents/ReviewAgent.ts:160](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L160)

Starts the ReviewerAgent event-driven runtime loop.
Subscribes to DraftCreated, ReviewRequested, and TaskAssigned events, processes them, and emits results.
Returns a Promise that resolves when the event loop is started.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`startEventLoop`](BaseAgent.md#starteventloop)

***

### describe()

> `static` **describe**(): `CapabilityDescribe`

Defined in: [src/agents/ReviewAgent.ts:271](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L271)

Returns a machine-usable, LLM-friendly description of the agent.
Returns a CapabilityDescribe object.

#### Returns

`CapabilityDescribe`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe)

***

### describe()

> **describe**(): `CapabilityDescribe`

Defined in: [src/agents/ReviewAgent.ts:308](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L308)

Instance describe for registry compliance.

#### Returns

`CapabilityDescribe`

#### Overrides

[`BaseAgent`](BaseAgent.md).[`describe`](BaseAgent.md#describe-2)

***

### health()

> **health**(): `Promise`\<\{ `status`: `"ok"`; `timestamp`: `string`; \}\>

Defined in: [src/agents/ReviewAgent.ts:315](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/agents/ReviewAgent.ts#L315)

Instance health for registry compliance.

#### Returns

`Promise`\<\{ `status`: `"ok"`; `timestamp`: `string`; \}\>

#### Overrides

[`BaseAgent`](BaseAgent.md).[`health`](BaseAgent.md#health)
