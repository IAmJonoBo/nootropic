/**
 * Returns a description of the agents module and its exports.
 */
export declare function init(): Promise<void>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
export declare function describe(): Promise<{
    name: string;
    description: string;
    promptTemplates: never[];
    schema: {};
}>;
declare const AgentsCapability: {
    name: string;
    describe: typeof describe;
    schema: {};
};
export default AgentsCapability;
export * from './BaseAgent.js';
export declare const schema: {};
