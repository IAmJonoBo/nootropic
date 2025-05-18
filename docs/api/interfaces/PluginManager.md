[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / PluginManager

# Interface: PluginManager

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:73](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L73)

## Properties

### register()

> **register**: (`plugin`, `appContext`) => `void` \| `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:74](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L74)

#### Parameters

##### plugin

[`Plugin`](Plugin.md)

##### appContext

`PluginAppContext`

#### Returns

`void` \| `Promise`\<`void`\>

***

### unregister()

> **unregister**: (`name`) => `void` \| `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:75](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L75)

#### Parameters

##### name

`string`

#### Returns

`void` \| `Promise`\<`void`\>

***

### list()

> **list**: () => [`Plugin`](Plugin.md)[]

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:76](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L76)

#### Returns

[`Plugin`](Plugin.md)[]

***

### emitEvent()

> **emitEvent**: (`event`) => `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:77](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L77)

#### Parameters

##### event

[`AgentEvent`](../type-aliases/AgentEvent.md)

#### Returns

`Promise`\<`void`\>

***

### subscribe()

> **subscribe**: (`type`, `handler`) => `void`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:78](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L78)

#### Parameters

##### type

`string`

##### handler

(`event`) => `void` \| `Promise`\<`void`\>

#### Returns

`void`

***

### loadPluginFromDisk()

> **loadPluginFromDisk**: (`entry`, `appContext?`) => `Promise`\<`null` \| [`Plugin`](Plugin.md)\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:79](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L79)

#### Parameters

##### entry

`string`

##### appContext?

`PluginAppContext`

#### Returns

`Promise`\<`null` \| [`Plugin`](Plugin.md)\>

***

### unloadPlugin()

> **unloadPlugin**: (`name`) => `void`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:80](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L80)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### reloadPlugin()

> **reloadPlugin**: (`name`, `entry`, `appContext?`) => `Promise`\<`void`\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:81](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L81)

#### Parameters

##### name

`string`

##### entry

`string`

##### appContext?

`PluginAppContext`

#### Returns

`Promise`\<`void`\>
