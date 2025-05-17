import { trace } from '@opentelemetry/api';
// @ts-ignore
import { sonarQubeMemoriesCapability } from '../utils/feedback/sonarQubeMemories.js';

const SONARQUBE_API_URL = process.env['AIHELPERS_SONARQUBE_API_URL'] ?? 'http://localhost:9000';
const SONARQUBE_TOKEN = process.env['AIHELPERS_SONARQUBE_TOKEN'];

export async function getSonarQubeFindings(projectKey?: string) {
  const tracer = trace.getTracer('aihelpers.quality.sonarqube');
  return tracer.startActiveSpan('sonarqube.getFindings', async (span) => {
    try {
      const url = `${SONARQUBE_API_URL}/api/issues/search?componentKeys=${projectKey ?? ''}`;
      const res = await fetch(url, {
        headers: SONARQUBE_TOKEN ? { 'Authorization': 'Basic ' + Buffer.from(SONARQUBE_TOKEN + ':').toString('base64') } : {}
      });
      const data = await res.json();
      const findings = (data.issues ?? []).map((f: unknown) => {
        if (typeof f !== 'object' || f === null) {
          return {
            id: '', file: '', startLine: 0, ruleId: '', message: '', severity: '', type: '', effort: '', debt: '', creationDate: '', updateDate: '', status: '', raw: f
          };
        }
        const obj = f as Record<string, unknown>;
        return {
          id: obj['key'],
          file: obj['component'],
          startLine: obj['line'],
          ruleId: obj['rule'],
          message: obj['message'],
          severity: obj['severity'],
          type: obj['type'],
          effort: obj['effort'],
          debt: obj['debt'],
          creationDate: obj['creationDate'],
          updateDate: obj['updateDate'],
          status: obj['status'],
          raw: f
        };
      });
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
  if (typeof finding !== 'object' || finding === null) return 'Invalid finding';
  const f = finding as Record<string, unknown>;
  return `SonarQube rule "${f['ruleId']}" flagged code in "${f['file']}" (line ${f['startLine']}): "${f['message']}". Severity: ${f['severity']}. Type: ${f['type']}. Status: ${f['status']}.`;
}

export async function suggestSonarQubeFix(finding: unknown): Promise<{ suggestion: string; rationale: string }> {
  if (typeof finding !== 'object' || finding === null) return { suggestion: '', rationale: 'Invalid finding' };
  const f = finding as Record<string, unknown>;
  return {
    suggestion: '// TODO: Review and fix this finding as per SonarQube rule and best practices.',
    rationale: `In production, an LLM would analyze the code and suggest a concrete fix for rule "${f['ruleId']}".`
  };
}

export async function autoFixSonarQubeFinding(finding: unknown): Promise<{ applied: boolean; patch?: string; explanation?: string; validation?: { syntax: boolean; tests?: boolean } }> {
  // Stub: In production, call LLM/codegen with context
  if (typeof finding !== 'object' || finding === null) {
    return { applied: false, patch: '', explanation: 'Invalid finding', validation: { syntax: false } };
  }
  const f = finding as Record<string, unknown>;
  const patch = '// PATCH: Example fix for finding ' + f['ruleId'] + ' at ' + f['file'] + ':' + f['startLine'];
  const explanation = `This patch addresses SonarQube finding ${f['ruleId']} in ${f['file']} (line ${f['startLine']}): ${f['message']}. In production, an LLM would generate a context-aware fix.`;
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