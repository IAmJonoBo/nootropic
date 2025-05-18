import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
/**
 * SupervisorAgent: Monitors other agents for health, compliance, and performance; can trigger self-healing or escalation.
 * Implements the Capability interface for unified orchestration and registry.
 */
export declare class SupervisorAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    /**
     * Hierarchical Agent Supervision: Implements a two-level hierarchy, delegates sub-agents, aggregates health/status reports.
     * Extension: Integrate sub-agent registry and delegation logic.
     */
    superviseAgents(subAgents: string[]): Promise<{
        healthReports: Record<string, unknown>;
    }>;
    /**
     * Event-Driven Anomaly Detection: Stream agent metrics into a lightweight anomaly detector (e.g., streaming Z-score).
     * Extension: Integrate real anomaly detection logic.
     */
    detectAnomalies(metrics: number[]): Promise<{
        anomaly: boolean;
        score: number;
    }>;
    /**
     * Self-Healing Workflows: Automatically restart or reconfigure misbehaving agents using predefined remediation playbooks.
     * Extension: Integrate real remediation logic and playbook storage.
     */
    selfHeal(agent: string): Promise<{
        healed: boolean;
        action: string;
    }>;
    /**
     * Enhanced supervision logic: hierarchical supervision, anomaly detection, self-healing.
     */
    runTask(task: unknown): Promise<AgentResult>;
    private subAgentRegistryStub;
    private streamingAnomalyDetectionStub;
    private remediationPlaybookStub;
    static eventSchemas: {
        supervision: {
            type: string;
            properties: {
                subAgents: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        anomalyDetection: {
            type: string;
            properties: {
                metrics: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        selfHealing: {
            type: string;
            properties: {
                agent: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        escalation: {
            type: string;
            properties: {
                subAgents: {
                    type: string;
                };
                status: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    /**
     * Initialize the agent (stub).
     */
    init(): Promise<void>;
    /**
     * Shutdown the agent (stub).
     */
    shutdown(): Promise<void>;
    /**
     * Reload the agent (stub).
     */
    reload(): Promise<void>;
    static describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        extensionPoints: string[];
        references: string[];
        bestPractices: string[];
        promptTemplates: {
            name: string;
            description: string;
            template: string;
            usage: string;
        }[];
    };
    describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        extensionPoints: string[];
        references: string[];
        bestPractices: string[];
        promptTemplates: {
            name: string;
            description: string;
            template: string;
            usage: string;
        }[];
    };
    health(): Promise<{
        status: "ok";
        timestamp: string;
    }>;
}
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
    promptTemplates: {
        name: string;
        description: string;
        template: string;
        usage: string;
    }[];
}>;
