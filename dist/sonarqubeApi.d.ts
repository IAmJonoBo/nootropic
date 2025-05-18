export declare function getSonarQubeFindings(projectKey?: string): Promise<any>;
export declare function explainSonarQubeFinding(finding: unknown): Promise<string>;
export declare function suggestSonarQubeFix(finding: unknown): Promise<{
    suggestion: string;
    rationale: string;
}>;
export declare function autoFixSonarQubeFinding(finding: unknown): Promise<{
    applied: boolean;
    patch?: string;
    explanation?: string;
    validation?: {
        syntax: boolean;
        tests?: boolean;
    };
}>;
declare const sonarqubeApiCapability: {
    name: string;
    describe: typeof describe;
    getSonarQubeFindings: typeof getSonarQubeFindings;
    explainSonarQubeFinding: typeof explainSonarQubeFinding;
    suggestSonarQubeFix: typeof suggestSonarQubeFix;
    autoFixSonarQubeFinding: typeof autoFixSonarQubeFinding;
    addSonarQubeMemory: any;
    listSonarQubeMemories: any;
    applySonarQubeMemories: any;
};
export default sonarqubeApiCapability;
export declare function describe(): {
    name: string;
    description: string;
    usage: string;
    env: string[];
    llmAgentApis: {
        getFindings: string;
        explainFinding: string;
        suggestFix: string;
        autoFix: string;
    };
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    crossToolMemoriesApi: {
        listAll: string;
        getForFile: string;
        getForRule: string;
        rationale: string;
    };
    references: string[];
};
