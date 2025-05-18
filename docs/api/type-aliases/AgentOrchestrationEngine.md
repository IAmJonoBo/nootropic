[**nootropic v0.1.0**](../README.md)

***

[nootropic](../globals.md) / AgentOrchestrationEngine

# Type Alias: AgentOrchestrationEngine

> **AgentOrchestrationEngine** = `object`

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:84](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L84)

## Properties

### runAgentTask()

> **runAgentTask**: (`agentProfile`, `task`, `context?`, `logger?`) => `Promise`\<[`AgentResult`](AgentResult.md)\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:85](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L85)

#### Parameters

##### agentProfile

[`AgentProfile`](AgentProfile.md)

##### task

[`AgentTask`](AgentTask.md)

##### context?

[`AgentContext`](AgentContext.md)

##### logger?

[`AgentLogger`](AgentLogger.md)

#### Returns

`Promise`\<[`AgentResult`](AgentResult.md)\>

***

### getAgentContext()

> **getAgentContext**: (`agentId`) => `Promise`\<[`AgentContext`](AgentContext.md)\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:86](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L86)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<[`AgentContext`](AgentContext.md)\>

***

### listAgents()

> **listAgents**: () => `Promise`\<[`AgentProfile`](AgentProfile.md)[]\>

Defined in: [src/schemas/AgentOrchestrationEngineSchema.ts:87](https://github.com/IAmJonoBo/nootropic/blob/18343f4cf73e7672754af62a2e7ab6ac765931cf/src/schemas/AgentOrchestrationEngineSchema.ts#L87)

#### Returns

`Promise`\<[`AgentProfile`](AgentProfile.md)[]\>
