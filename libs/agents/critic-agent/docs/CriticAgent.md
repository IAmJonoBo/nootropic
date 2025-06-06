# CriticAgent

***

## Table of Contents

* [CriticAgent](#criticagent)
  * [Table of Contents](#table-of-contents)
  * [Overview](#overview)
  * [Responsibilities](#responsibilities)
  * [Inputs & Outputs](#inputs--outputs)
    * [Inputs](#inputs)
    * [Outputs](#outputs)
  * [Data Structures](#data-structures)
  * [Algorithms & Workflow](#algorithms--workflow)
    * [Static Analysis Workflow](#static-analysis-workflow)
    * [Test Generation Workflow](#test-generation-workflow)
  * [Integration Points](#integration-points)
  * [Edge Cases & Failure Modes](#edge-cases--failure-modes)
  * [Configuration](#configuration)
  * [Metrics & Instrumentation](#metrics--instrumentation)
  * [Testing & Validation](#testing--validation)
  * [Future Enhancements](#future-enhancements)
  * [Summary](#summary)

***

## Overview

The **CriticAgent** safeguards code quality, security, and reliability within nootropic's self-healing ecosystem. It combines static analysis (Semgrep), AI-driven autofix generation, automated test generation/execution, and robust instrumentation to ensure all code meets quality gates before integration.

***

## Responsibilities

1. **Static Analysis & Vulnerability Detection**
   * Run semantic and syntactic checks using Semgrep and custom rule sets.
   * Identify vulnerabilities and anti-patterns, producing structured issue reports.
2. **Autofix Generation & Application**
   * For high-confidence findings, generate AI-driven autofix suggestions via LLM prompts.
   * Apply AST-level or text-based patches in diff format for review or auto-commit.
3. **Test Generation & Execution**
   * Generate and execute unit/integration tests based on code changes using LLMs.
   * Integrate new tests and verify they pass.
4. **Quality & Coverage Metrics**
   * Compute metrics (coverage, complexity, lint warnings, duplication) and annotate PRs or logs.
5. **Collaboration with Other Agents**
   * Communicate issues and autofix patches to CoderAgent or ReasoningAgent for repair loops.
   * Escalate unfixable findings to ProjectMgrAgent.
6. **Rule Management & Customization**
   * Load/apply user-defined Semgrep rule packs and OpenRewrite recipes.
   * Allow dynamic rule updates and expose config parameters via `~/.nootropic/config.json`.

***

## Inputs & Outputs

### Inputs

* **Code Patch or Code Snippet**: Unified diff patches or raw file contents from CoderAgent or user.
* **Configuration Parameters**: Semgrep rule sets, severity thresholds, autofix confidence, and patch size from config.
* **Project Context**: Project-specific settings (language, framework, test framework).
* **MemoryAgent & SearchAgent Results (Optional)**: Historical examples and relevant code snippets for context.

### Outputs

* **Issue Reports**: Structured JSON or YAML with fields:

  ```json
  {
    "file": "src/routes/users.js",
    "line": 42,
    "rule_id": "javascript.injection.detected",
    "severity": "HIGH",
    "message": "Potential SQL injection vulnerability detected.",
    "details": "User input is concatenated into query without sanitization.",
    "confidence": 0.92
  }
  ```

* **Autofix Patches**: Unified diff representing proposed changes, with metadata (rule ID, confidence, patch size).

  ```diff
  diff --git a/src/db/userQueries.js b/src/db/userQueries.js
  index a1b2c3d..e4f5g6h 100644
  --- a/src/db/userQueries.js
  +++ b/src/db/userQueries.js
  @@ -10,7 +10,12 @@ async function getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    const res = await db.query(query);
    return res.rows[0];
  }
  +// Autofix: use parameterized query
  +async function getUserByEmail(email) {
  +  const query = 'SELECT * FROM users WHERE email = $1';
  +  const res = await db.query(query, [email]);
  +  return res.rows[0];
  +}
  ```

* **Test Files & Results**: New test files and execution results as pass/fail status with logs.

  ```json
  {
    "testSuite": "userQueries",
    "tests": [
      { "name": "getUserByEmail returns correct user", "status": "passed" },
      {
        "name": "getUserByEmail throws on invalid email",
        "status": "failed",
        "error": "TypeError: Invalid email format"
      }
    ],
    "coverage": 85.4
  }
  ```

* **OTEL Span Metadata**: Span attributes capturing analysis duration, issue/autofix/test counts, and errors.

  ```json
  {
    "component": "critic-agent",
    "analysis.duration_ms": 450,
    "issues.count": 3,
    "autofixes.count": 2,
    "tests.generated": 1
  }
  ```

***

## Data Structures

```typescript
interface IssueReport {
  filePath: string;
  lineNumber: number;
  ruleId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  details: string;
  confidence: number;
}

interface AutofixPatch {
  ruleId: string;
  confidence: number;
  diffText: string;
  filesAffected: string[];
}

interface TestResult {
  testSuite: string;
  tests: {
    name: string;
    status: "passed" | "failed";
    error?: string;
  }[];
  coverage: number;
  timestamp: string;
}
```

***

## Algorithms & Workflow

### Static Analysis Workflow

1. **Receive Code Input**
   * Accept `CodePatch` or raw file/directory path.
   * If a patch, reconstruct post-patch state in a temp copy.
2. **Invoke Semgrep**
   * Run Semgrep CLI and parse JSON output into `IssueReport[]`.
   * Filter findings below autofix confidence threshold if needed.
3. **Generate Autofix Suggestions**
   * For each high-confidence issue, build LLM prompt and call ModelAdapter.
   * Parse returned diff, validate syntax, retry or flag as unfixable if needed.
4. **Apply Autofixes (Optional)**
   * If not in dry-run and confidence is high, apply patch and commit on a branch.
   * Emit OTEL span for applied autofix.
5. **Run Tests & Coverage**
   * Run or generate tests, capture results and coverage.
   * Mark as quality issue if coverage below threshold.
6. **Return Results**
   * Return structured object with issues, autofixes, tests, and metadata.
   * Signal ProjectMgrAgent or ReasoningAgent for unfixable/critical issues.

### Test Generation Workflow

1. **Identify Functions or Classes to Test**
   * Analyze diff/AST for new or changed functions.
2. **Generate Prompt for LLM**
   * Use template and call ModelAdapter.
3. **Invoke ModelAdapter**
   * Parse output into test file.
4. **Validate Tests**
   * Place and run test file, retry or escalate if failing.
5. **Report Test Results**
   * Include pass/fail status and update OTEL span.

***

## Integration Points

* **ModelAdapter**: All LLM calls for autofix/test generation go through ModelAdapter.
* **SearchAgent & MemoryAgent**: Used for context and prior examples.
* **Temp Workspace Management**: Isolated temp dir for patch analysis.
* **OTEL & ReflexionAdapter**: Emit spans and metrics for observability and self-healing.
* **ReasoningAgent**: Handles failed autofixes and iterative repair.
* **ProjectMgrAgent**: Receives signals for unfixable issues and sprint health.

***

## Edge Cases & Failure Modes

1. **False Positives & Rule Tuning**: Suppress or reduce severity for rules with frequent false positives.
2. **Autofix Patch Breaks Build**: Roll back patch and create review ticket if build fails.
3. **Unpatchable Code**: Categorize and escalate to ProjectMgrAgent.
4. **Test Flakiness**: Retry flaky tests, mark as Flaky, and notify ReasoningAgent.
5. **Performance Bottlenecks**: Shard large codebases and run Semgrep in parallel.
6. **Contextual Misalignment for Test Generation**: Pre-validate signatures and request annotation if needed.

***

## Configuration

All configuration parameters are under `criticAgent` in `~/.nootropic/config.json`:

```jsonc
{
  "criticAgent": {
    "semgrepRulesPath": "config/semgrep/rules/",
    "autofixConfidenceThreshold": 0.8,
    "maxPatchSizeLines": 500,
    "testFramework": "jest",
    "additionalIgnorePatterns": ["node_modules/", "dist/"],
    "runCoverage": true,
    "coverageThreshold": 80,
    "autofixOnDryRun": false,
    "maxTestRetries": 2,
    "parallelSemgrepBatches": 4,
  },
}
```

* `semgrepRulesPath`: Directory for Semgrep rule files (YAML).
* `autofixConfidenceThreshold`: Minimum LLM confidence (0–1) to auto-apply a patch.
* `maxPatchSizeLines`: Limits diff lines to avoid overwhelming patches.
* `testFramework`: Specifies test runner for test generation and execution.
* `additionalIgnorePatterns`: Glob patterns to skip certain files or directories.
* `runCoverage`: Whether to calculate test coverage.
* `coverageThreshold`: Minimum coverage (%) for a passing analysis.
* `autofixOnDryRun`: If `true`, autofixes are only previewed and not committed.
* `maxTestRetries`: Number of attempts for flaky or failing tests during generation.
* `parallelSemgrepBatches`: Number of concurrent Semgrep processes for large codebases.

***

## Metrics & Instrumentation

* **Span:** `critic.analysis` (taskID, issues, autofixes, duration, critical count, tests generated)
* **Counter:** `critic.issue_found`
* **Counter:** `critic.autofix_attempt`
* **Gauge:** `critic.coverage_percentage`
* **Span:** `critic.test_generation` (tests, passed, duration)

These metrics feed into ReflexionEngine for automated detection, self-healing, and escalation.

***

## Testing & Validation

* **Unit Tests:** Validate Semgrep output parsing, mock ModelAdapter, test config validation.
* **Integration Tests:** Use sample projects with known vulnerabilities, verify detection and autofix, validate test generation and coverage.
* **End-to-End Testing:** Simulate full workflow, including unfixable vulnerabilities and escalation.

***

## Future Enhancements

1. **Rule Learning & Prioritization**: Dynamically reprioritize or disable rules based on feedback.
2. **Multi-Language & Multi-Framework Support**: Extend support to more languages and frameworks.
3. **Interactive Remediation Suggestions**: Integrate with editors for inline fixes.
4. **Dependency Graph Analysis**: Identify transitive vulnerabilities and suggest upgrades.
5. **Automated Security Reporting**: Generate periodic security reports for stakeholders.

***

## Summary

> The CriticAgent safeguards code quality, security, and reliability within nootropic's self-healing ecosystem. By combining rapid static analysis, AI-driven autofix, automated test generation, and robust instrumentation, CriticAgent ensures that any code meets established quality gates before integration.
