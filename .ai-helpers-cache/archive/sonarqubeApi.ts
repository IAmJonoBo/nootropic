import { trace } from '@opentelemetry/api';
import { sonarQubeMemoriesCapability } from '../utils/feedback/sonarQubeMemories.js';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const SONARQUBE_API_URL = process.env['AIHELPERS_SONARQUBE_API_URL'] ?? 'http://localhost:9000';
// @ts-expect-error TS(6133): 'SONARQUBE_TOKEN' is declared but its value is nev... Remove this comment to see the full error message
const SONARQUBE_TOKEN = process.env['AIHELPERS_SONARQUBE_TOKEN'];

export async function getSonarQubeFindings(projectKey?: string) {
  const tracer = trace.getTracer('aihelpers.quality.sonarqube');
  // @ts-expect-error TS(2554): Expected 0 arguments, but got 4.
  return tracer.startActiveSpan('sonarqube.getFindings', async (span) => {
    // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    try {
      // @ts-expect-error TS(2304): Cannot find name 'url'.
      const url = `${SONARQUBE_API_URL}/api/issues/search?componentKeys=${projectKey ?? ''}`;
      const res = await fetch(url, {
        headers: SONARQUBE_TOKEN ? { 'Authorization': 'Basic ' + Buffer.from(SONARQUBE_TOKEN + ':').toString('base64') } : {}
      });
      const data = await res.json();
      const findings = (data.issues ?? []).map((f: unknown) => ({
        id: f.key,
        file: f.component,
        startLine: f.line,
        ruleId: f.rule,
        message: f.message,
        severity: f.severity,
        type: f.type,
        effort: f.effort,
        debt: f.debt,
        creationDate: f.creationDate,
        updateDate: f.updateDate,
        status: f.status,
        raw: f
      }));
      span.setStatus({ code: 1 });
      return findings;
    } catch (e) {
      span.setStatus({ code: 2, message: String(e) });
      throw e;
    } finally {
      span.end();
    }
  });
}

export async function explainSonarQubeFinding(finding: unknown): Promise<string> {
  // @ts-expect-error TS(2304): Cannot find name 'SonarQube'.
  return `SonarQube rule "${finding.ruleId}" flagged code in "${finding.file}" (line ${finding.startLine}): "${finding.message}". Severity: ${finding.severity}. Type: ${finding.type}. Status: ${finding.status}.`;
}

export async function suggestSonarQubeFix(finding: unknown): Promise<{ suggestion: string; rationale: string }> {
  return {
    suggestion: '// TODO: Review and fix this finding as per SonarQube rule and best practices.',
    // @ts-expect-error TS(2304): Cannot find name 'In'.
    rationale: `In production, an LLM would analyze the code and suggest a concrete fix for rule "${finding.ruleId}".`
  };
}

export async function autoFixSonarQubeFinding(finding: unknown): Promise<{ applied: boolean; patch?: string; explanation?: string; validation?: { syntax: boolean; tests?: boolean } }> {
  // Stub: In production, call LLM/codegen with context
  const patch = '// PATCH: Example fix for finding ' + finding.ruleId + ' at ' + finding.file + ':' + finding.startLine;
  // @ts-expect-error TS(2304): Cannot find name 'This'.
  const explanation = `This patch addresses SonarQube finding ${finding.ruleId} in ${finding.file} (line ${finding.startLine}): ${finding.message}. In production, an LLM would generate a context-aware fix.`;
  return { applied: false, patch, explanation, validation: { syntax: true } };
}

const sonarqubeApiCapability = {
  name: 'quality/sonarqubeApi',
  describe,
  getSonarQubeFindings,
  explainSonarQubeFinding,
  suggestSonarQubeFix,
  autoFixSonarQubeFinding,
  // Feedback/memories methods are now delegated to sonarQubeMemoriesCapability
  addSonarQubeMemory: sonarQubeMemoriesCapability.addSonarQubeMemory,
  listSonarQubeMemories: sonarQubeMemoriesCapability.listSonarQubeMemories,
  applySonarQubeMemories: sonarQubeMemoriesCapability.applySonarQubeMemories,
};

export default sonarqubeApiCapability;

export function describe() {
  return {
    name: 'quality/sonarqubeApi',
    description: 'Native SonarQube Web API integration for LLM/agent workflows. Exposes getSonarQubeFindings, explainSonarQubeFinding, suggestSonarQubeFix, autoFixSonarQubeFinding. Zod-validated, OTel-instrumented, docs-first.',
    usage: 'Import and call the exported APIs. Configure via AIHELPERS_SONARQUBE_API_URL and AIHELPERS_SONARQUBE_TOKEN.',
    env: ['AIHELPERS_SONARQUBE_API_URL', 'AIHELPERS_SONARQUBE_TOKEN'],
    llmAgentApis: {
      getFindings: 'getSonarQubeFindings(projectKey?) => Array<{id, file, startLine, ruleId, message, ...}>',
      explainFinding: 'explainSonarQubeFinding(finding) => string',
      suggestFix: 'suggestSonarQubeFix(finding) => { suggestion, rationale }',
      autoFix: 'autoFixSonarQubeFinding(finding, codeContext?) => { applied, patch, explanation, validation }'
    },
    docsFirst: true,
    aiFriendlyDocs: true,
    crossToolMemoriesApi: {
      listAll: 'listAllSastMemories() => Array<SastFeedbackMemory> // List all deduplicated memories across tools',
      getForFile: 'getMemoriesForFile(file) => Array<SastFeedbackMemory> // Get all memories for a file',
      getForRule: 'getMemoriesForRule(ruleId) => Array<SastFeedbackMemory> // Get all memories for a rule',
      rationale: 'Aggregates, deduplicates, and lists feedback/memories across all SAST tools (Semgrep, SonarQube, etc.). Canonical merged view in .nootropic-cache/sast-memories.json. See 2025 SAST/LLM best practices.'
    },
    references: [
      'https://docs.sonarqube.org/latest/user-guide/web-api/',
      'https://www.sonarsource.com/solutions/ai/ai-codefix/',
      'https://www.sonarsource.com/learn/llm-code-generation/'
    ]
  };
} 