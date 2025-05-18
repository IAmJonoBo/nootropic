import { z } from 'zod';
export declare const AgentProfileSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export type AgentProfile = z.infer<typeof AgentProfileSchema>;
export declare const AgentTaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
}, {
    id: string;
    description: string;
}>;
export type AgentTask = z.infer<typeof AgentTaskSchema>;
export declare const AgentContextSchema: z.ZodObject<{
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    agentId: string;
}, {
    agentId: string;
}>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export declare const AgentResultSchema: z.ZodObject<{
    output: z.ZodOptional<z.ZodUnknown>;
    success: z.ZodBoolean;
    logs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    output?: unknown;
    logs?: string[] | undefined;
}, {
    success: boolean;
    output?: unknown;
    logs?: string[] | undefined;
}>;
export type AgentResult = z.infer<typeof AgentResultSchema>;
export type AgentLogger = (event: AgentLifecycleEvent) => void;
export type AgentLifecycleEvent = {
    type: 'start' | 'success' | 'error' | 'fallback';
    adapter: string;
    method: string;
    payload?: unknown;
    error?: unknown;
};
export type AgentEvent = {
    type: 'TaskAssigned';
    agentId: string;
    timestamp: string;
    payload: {
        task: AgentTask;
    };
} | {
    type: 'DraftFeedback';
    agentId: string;
    timestamp: string;
    payload: Record<string, unknown>;
} | {
    type: 'TaskStarted';
    agentId: string;
    timestamp: string;
    payload: {
        task: AgentTask;
    };
} | {
    type: 'DraftCreated';
    agentId: string;
    timestamp: string;
    payload: {
        draftId: string;
        content: string;
    };
} | {
    type: 'TaskCompleted';
    agentId: string;
    timestamp: string;
    payload: {
        success: boolean;
        draftId?: string;
        result?: unknown;
    };
} | {
    type: 'DataCollectionRequested';
    agentId: string;
    timestamp: string;
    payload: {
        task: AgentTask;
    };
} | {
    type: 'DataCollected';
    agentId: string;
    timestamp: string;
    payload: {
        result: unknown;
    };
} | {
    type: 'DraftReviewed';
    agentId: string;
    timestamp: string;
    payload: {
        result: unknown;
    };
} | {
    type: 'ReviewRequested';
    agentId: string;
    timestamp: string;
    payload: {
        task: AgentTask;
    };
} | {
    type: 'ReviewFeedback';
    agentId: string;
    timestamp: string;
    payload: {
        result: unknown;
    };
} | {
    type: 'Log';
    agentId: string;
    timestamp: string;
    payload: {
        level: 'info' | 'warn' | 'error';
        message: string;
        details?: Record<string, unknown>;
    };
} | {
    type: 'DLQ';
    agentId: string;
    timestamp: string;
    originalEvent: Record<string, unknown>;
    error: {
        errorType: string;
        message: string;
        stack?: string;
    };
    metadata: {
        topic: string;
        partition: number;
        offset: number;
        originalTimestamp: string;
        traceContext?: Record<string, unknown>;
    };
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    version?: string;
} | {
    type: string;
    agentId: string;
    timestamp: string;
    payload?: Record<string, unknown>;
    [key: string]: unknown;
};
export type PluginAppContext = {
    publishEvent: (event: AgentEvent) => Promise<void>;
    subscribeToEvent: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
    config?: Record<string, unknown>;
    [key: string]: unknown;
};
export interface Plugin {
    name: string;
    version?: string;
    initialize: (appContext: PluginAppContext) => void | Promise<void>;
    destroy?: () => void | Promise<void>;
    onEvent?: (event: AgentEvent) => void | Promise<void>;
    describe?: () => unknown;
    meta?: Record<string, unknown>;
    run?: (...args: unknown[]) => Promise<unknown>;
}
export interface PluginManager {
    register: (plugin: Plugin, appContext: PluginAppContext) => void | Promise<void>;
    unregister: (name: string) => void | Promise<void>;
    list: () => Plugin[];
    emitEvent: (event: AgentEvent) => Promise<void>;
    subscribe: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
    loadPluginFromDisk: (entry: string, appContext?: PluginAppContext) => Promise<Plugin | null>;
    unloadPlugin: (name: string) => void;
    reloadPlugin: (name: string, entry: string, appContext?: PluginAppContext) => Promise<void>;
}
export type AgentOrchestrationEngine = {
    runAgentTask: (agentProfile: AgentProfile, task: AgentTask, context?: AgentContext, logger?: AgentLogger) => Promise<AgentResult>;
    getAgentContext: (agentId: string) => Promise<AgentContext>;
    listAgents: () => Promise<AgentProfile[]>;
};
export declare const TaskAssignedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"TaskAssigned">;
    agentId: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodObject<{
        task: z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
        }, {
            id: string;
            description: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        task: {
            id: string;
            description: string;
        };
    }, {
        task: {
            id: string;
            description: string;
        };
    }>;
    traceId: z.ZodOptional<z.ZodString>;
    spanId: z.ZodOptional<z.ZodString>;
    parentSpanId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "TaskAssigned";
    timestamp: string;
    payload: {
        task: {
            id: string;
            description: string;
        };
    };
    agentId: string;
    traceId?: string | undefined;
    spanId?: string | undefined;
    parentSpanId?: string | undefined;
}, {
    type: "TaskAssigned";
    timestamp: string;
    payload: {
        task: {
            id: string;
            description: string;
        };
    };
    agentId: string;
    traceId?: string | undefined;
    spanId?: string | undefined;
    parentSpanId?: string | undefined;
}>;
export declare const DLQEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"DLQ">;
    agentId: z.ZodString;
    timestamp: z.ZodString;
    originalEvent: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    error: z.ZodObject<{
        errorType: z.ZodString;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        errorType: string;
        stack?: string | undefined;
    }, {
        message: string;
        errorType: string;
        stack?: string | undefined;
    }>;
    metadata: z.ZodObject<{
        topic: z.ZodString;
        partition: z.ZodNumber;
        offset: z.ZodNumber;
        originalTimestamp: z.ZodString;
        traceContext: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        topic: string;
        partition: number;
        offset: number;
        originalTimestamp: string;
        traceContext?: Record<string, unknown> | undefined;
    }, {
        topic: string;
        partition: number;
        offset: number;
        originalTimestamp: string;
        traceContext?: Record<string, unknown> | undefined;
    }>;
    traceId: z.ZodOptional<z.ZodString>;
    spanId: z.ZodOptional<z.ZodString>;
    parentSpanId: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "DLQ";
    timestamp: string;
    version: string;
    error: {
        message: string;
        errorType: string;
        stack?: string | undefined;
    };
    originalEvent: Record<string, unknown>;
    metadata: {
        topic: string;
        partition: number;
        offset: number;
        originalTimestamp: string;
        traceContext?: Record<string, unknown> | undefined;
    };
    agentId: string;
    traceId?: string | undefined;
    spanId?: string | undefined;
    parentSpanId?: string | undefined;
}, {
    type: "DLQ";
    timestamp: string;
    error: {
        message: string;
        errorType: string;
        stack?: string | undefined;
    };
    originalEvent: Record<string, unknown>;
    metadata: {
        topic: string;
        partition: number;
        offset: number;
        originalTimestamp: string;
        traceContext?: Record<string, unknown> | undefined;
    };
    agentId: string;
    version?: string | undefined;
    traceId?: string | undefined;
    spanId?: string | undefined;
    parentSpanId?: string | undefined;
}>;
export type DLQEvent = z.infer<typeof DLQEventSchema>;
export interface EventBusAdapter {
    publishEvent(event: unknown, topic?: string): Promise<void>;
    subscribeToTopic(topic: string, handler: (event: unknown) => Promise<void>): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const GenericAgentEventSchema: z.ZodObject<{
    type: z.ZodString;
    agentId: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodUnknown;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    type: z.ZodString;
    agentId: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodUnknown;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    type: z.ZodString;
    agentId: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodUnknown;
}, z.ZodUnknown, "strip">>;
export declare const AgentEventSchemas: Record<string, z.ZodTypeAny>;
export declare function validateAgentEvent(event: unknown): {
    success: boolean;
    data?: unknown;
    error?: string;
};
