interface AgentProfile {
    name: string;
    capabilities?: string[];
    tags?: string[];
    updated?: string;
    [key: string]: unknown;
}
declare function registerProfile(agent: string, profile: AgentProfile): Promise<void>;
declare function listProfiles(): Promise<Record<string, AgentProfile>>;
declare function recommendAgents(requirements?: string[]): Promise<{
    agent: string;
    profile: AgentProfile;
}[]>;
/**
 * Returns a description of the agent profile registry plugin/capability.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
    schema: {
        registerProfile: {
            input: {
                type: string;
                properties: {
                    agent: {
                        type: string;
                    };
                    profile: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        getProfiles: {
            input: {
                type: string;
            };
            output: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
    };
};
export { registerProfile, listProfiles, recommendAgents };
