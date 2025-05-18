/**
 * Run all enabled quality plugins.
 */
export declare function runQualityChecks(): Promise<void>;
/**
 * Returns a description of the nootropic quality system and its plugins.
 */
export declare function describe(): {
    name: string;
    description: string;
    plugins: {
        name: string;
        enabled: string;
    }[];
    usage: string;
    env: string[];
    schema: {
        runQualityChecks: {
            input: {
                type: string;
            };
            output: {
                type: string;
            };
        };
        pluginConfig: {
            type: string;
            properties: {
                AIHELPERS_LINT: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_MARKDOWNLINT: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SECURITY: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SONARQUBE: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_RESEARCH: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_DOCTEST: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_AIREVIEW: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SEMGREP: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
        };
    };
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    describeRegistry: boolean;
    bestPractices: string[];
    references: string[];
    llmAgentApis: {
        semgrep: {
            getFindings: string;
            explainFinding: string;
            suggestFix: string;
            autoFix: string;
        };
    };
    crossToolMemoriesApi: {
        listAll: string;
        getForFile: string;
        getForRule: string;
        rationale: string;
    };
};
/**
 * Normalizes Semgrep findings to a common format for LLM/agent workflows.
 */
export declare function getSemgrepFindings(): Promise<Array<{
    id: string;
    file: string;
    startLine: number;
    endLine: number;
    ruleId: string;
    message: string;
    severity?: string;
    cwe?: string;
    owasp?: string;
    raw?: unknown;
}>>;
/**
 * Explains a Semgrep finding in natural language for LLM/agent workflows.
 */
export declare function explainSemgrepFinding(finding: {
    ruleId: string;
    message: string;
    file: string;
    startLine: number;
    endLine: number;
    raw?: unknown;
}): Promise<string>;
/**
 * Suggests a fix for a Semgrep finding using LLM/codegen (stub for now).
 */
export declare function suggestSemgrepFix(finding: {
    ruleId: string;
    message: string;
    file: string;
    startLine: number;
    endLine: number;
    raw?: unknown;
}): Promise<{
    suggestion: string;
    rationale: string;
}>;
/**
 * Attempts to auto-fix a Semgrep finding using LLM/codegen (production-ready stub).
 * 'finding' is the Semgrep finding object. 'codeContext' is the relevant code context (string or object).
 * Returns an object with applied, patch, explanation, and validation.
 */
export declare function autoFixSemgrepFinding(finding: {
    ruleId: string;
    message: string;
    file: string;
    startLine: number;
    endLine: number;
    raw?: unknown;
}, codeContext?: string): Promise<{
    applied: boolean;
    patch?: string;
    explanation?: string;
    validation?: {
        syntax: boolean;
        tests?: boolean;
    };
}>;
declare const selfcheckCapability: {
    name: string;
    describe: typeof describe;
    schema: {
        runQualityChecks: {
            input: {
                type: string;
            };
            output: {
                type: string;
            };
        };
        pluginConfig: {
            type: string;
            properties: {
                AIHELPERS_LINT: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_MARKDOWNLINT: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SECURITY: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SONARQUBE: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_RESEARCH: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_DOCTEST: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_AIREVIEW: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                AIHELPERS_SEMGREP: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
        };
    };
    runQualityChecks: typeof runQualityChecks;
    getSemgrepFindings: typeof getSemgrepFindings;
    explainSemgrepFinding: typeof explainSemgrepFinding;
    suggestSemgrepFix: typeof suggestSemgrepFix;
    autoFixSemgrepFinding: typeof autoFixSemgrepFinding;
    addSemgrepMemory: (findingId: string, memory: Partial<{
        id: string;
        tool: string;
        file: string;
        memoryType: string;
        rationale: string;
        timestamp?: string | undefined;
        user?: string | undefined;
        ruleId?: string | undefined;
        line?: number | undefined;
        triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
        tags?: string[] | undefined;
        project?: string | undefined;
        organization?: string | undefined;
        context?: Record<string, unknown> | undefined;
        version?: string | undefined;
    }>) => Promise<void>;
    listSemgrepMemories: (findingId: string) => Promise<{
        id: string;
        tool: string;
        file: string;
        memoryType: string;
        rationale: string;
        timestamp?: string | undefined;
        user?: string | undefined;
        ruleId?: string | undefined;
        line?: number | undefined;
        triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
        tags?: string[] | undefined;
        project?: string | undefined;
        organization?: string | undefined;
        context?: Record<string, unknown> | undefined;
        version?: string | undefined;
    }[]>;
    applySemgrepMemories: (findings: unknown[]) => Promise<unknown[]>;
    llmTriageSemgrepFinding: (finding: {
        id: string;
        severity?: string;
    }, memories?: {
        id: string;
        tool: string;
        file: string;
        memoryType: string;
        rationale: string;
        timestamp?: string | undefined;
        user?: string | undefined;
        ruleId?: string | undefined;
        line?: number | undefined;
        triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
        tags?: string[] | undefined;
        project?: string | undefined;
        organization?: string | undefined;
        context?: Record<string, unknown> | undefined;
        version?: string | undefined;
    }[] | undefined) => Promise<{
        triage: "true_positive" | "false_positive" | "needs_review";
        rationale: string;
        memory?: {
            id: string;
            tool: string;
            file: string;
            memoryType: string;
            rationale: string;
            timestamp?: string | undefined;
            user?: string | undefined;
            ruleId?: string | undefined;
            line?: number | undefined;
            triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
            tags?: string[] | undefined;
            project?: string | undefined;
            organization?: string | undefined;
            context?: Record<string, unknown> | undefined;
            version?: string | undefined;
        };
    }>;
};
export default selfcheckCapability;
