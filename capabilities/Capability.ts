// ============================================================================
// Unified Capability interface for nootropic
//
// This interface is the canonical contract for all extensible features:
// agents, plugins, adapters, and tools. It is designed for maximal
// LLM/agent usability, registry-driven automation, and compliance.
//
// References:
// - State of AI Agents in 2025: https://carlrannaberg.medium.com/state-of-ai-agents-in-2025-5f11444a5c78
// - Architecting AI Agents with TypeScript: https://apeatling.com/articles/architecting-ai-agents-with-typescript/
// - Scaling AI Agents in the Enterprise: https://thenewstack.io/scaling-ai-agents-in-the-enterprise-the-hard-problems-and-how-to-solve-them/
// - ETHOS/DeGov for AI Agents: https://arxiv.org/abs/2412.17114
//
// NOTE: Keep this interface in sync with latest industry best practices.
// ============================================================================

export interface Capability {
  /**
   * Unique name of the capability (agent, plugin, adapter, tool)
   */
  name: string;

  /**
   * Returns a machine-usable, LLM/agent-friendly description of the capability.
   * Must include compliance, provenance, schemas, usage, and references.
   */
  describe(): CapabilityDescribe;

  /**
   * Optional: Initialize the capability with config/context (e.g., registry, env, secrets).
   */
  init?(config?: unknown): Promise<void>;

  /**
   * Optional: Health/status check for observability, orchestration, and registry.
   */
  health?(): Promise<HealthStatus>;

  /**
   * Optional: Graceful shutdown/cleanup for resource management.
   */
  shutdown?(): Promise<void>;

  /**
   * Optional: Hot-reload logic for dynamic updates (e.g., config, code, model).
   */
  reload?(): Promise<void>;

  /**
   * Optional: Event hooks for event-driven orchestration and composability.
   */
  onEvent?(event: unknown): Promise<void>;
}

/**
 * Canonical describe output for all Capability-compliant modules (agents, plugins, adapters, tools).
 * Includes compliance, provenance, schemas, usage, and LLM/agent-friendly metadata.
 */
export interface CapabilityDescribe {
  /** Unique name of the capability */
  name: string;
  /** Human-readable description */
  description: string;
  /** SPDX license string (e.g., MIT, Apache-2.0, proprietary) */
  license: string;
  /** True if the capability is open-source and free to use by default */
  isOpenSource: boolean;
  /** Provenance or source URL (e.g., repo, docs, vendor) */
  provenance?: string;
  /** True if the capability is only available via cloud/paid API */
  cloudOnly?: boolean;
  /** True if explicit user opt-in is required (e.g., for paid APIs) */
  optInRequired?: boolean;
  /** Cost or pricing info (if applicable) */
  cost?: string;
  /** Usage example or import path */
  usage?: string;
  /** Methods/functions provided (name, signature, description) */
  methods?: Array<{ name: string; signature: string; description?: string }>;
  /** JSON schema or Zod schema for API (input/output) */
  schema?: unknown;
  /** References, docs, or research links */
  references?: string[];
  /** True if the module follows docs-first engineering */
  docsFirst?: boolean;
  /** True if the docs are LLM/agent-friendly */
  aiFriendlyDocs?: boolean;
  /**
   * Prompt templates for LLM/agent workflows.
   * Each entry should include a name, description, template string, and usage example.
   * Enables agents/LLMs to discover, generate, and validate prompts for this capability.
   */
  promptTemplates?: Array<{
    name: string;
    description: string;
    template: string;
    usage?: string;
  }>;
  /**
   * Event-driven patterns supported (e.g., market-based, blackboard, supervisor/sub-agent).
   * Used for LLM/agent introspection and registry-driven docs.
   */
  supportedEventPatterns?: string[];
  /**
   * Event types/topics the capability subscribes to (for event-driven orchestration).
   */
  eventSubscriptions?: string[];
  /**
   * Event types/topics the capability emits (for event-driven orchestration).
   */
  eventEmissions?: string[];
}

/**
 * Health/status object for observability and orchestration.
 */
export interface HealthStatus {
  /** Health status: 'ok', 'degraded', or 'error' */
  status: 'ok' | 'degraded' | 'error';
  /** Optional details for diagnostics */
  details?: string;
  /** Optional ISO timestamp */
  timestamp?: string;
} 