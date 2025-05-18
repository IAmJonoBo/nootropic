[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / Plugin

# Interface: Plugin

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:62](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L62)

## Properties

### name

> **name**: `string`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:63](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L63)

***

### version?

> `optional` **version**: `string`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:64](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L64)

***

### initialize()

> **initialize**: (`appContext`) => `void` \| `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:65](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L65)

#### Parameters

##### appContext

`PluginAppContext`

#### Returns

`void` \| `Promise`\<`void`\>

***

### destroy()?

> `optional` **destroy**: () => `void` \| `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:66](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L66)

#### Returns

`void` \| `Promise`\<`void`\>

***

### onEvent()?

> `optional` **onEvent**: (`event`) => `void` \| `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:67](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L67)

#### Parameters

##### event

[`AgentEvent`](../type-aliases/AgentEvent.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### describe()?

> `optional` **describe**: () => `unknown`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:68](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L68)

#### Returns

`unknown`

***

### meta?

> `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:69](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L69)

***

### run()?

> `optional` **run**: (...`args`) => `Promise`\<`unknown`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:70](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L70)

#### Parameters

##### args

...`unknown`[]

#### Returns

`Promise`\<`unknown`\>
