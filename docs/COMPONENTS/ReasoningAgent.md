# ReasoningAgent

***

## Table of Contents

- [ReasoningAgent](#reasoningagent)
  - [Table of Contents](#table-of-contents)
  - [Summary](#summary)
  - [Responsibilities](#responsibilities)
  - [Inputs \& Outputs](#inputs--outputs)
    - [Inputs](#inputs)
    - [Outputs](#outputs)
  - [Data Structures](#data-structures)
  - [Algorithms \& Workflow](#algorithms--workflow)
    - [Initial Candidate Generation](#initial-candidate-generation)
    - [LATS \& Ensemble Voting](#lats--ensemble-voting)
    - [Patch Instruction Finalization](#patch-instruction-finalization)
  - [Integration Points](#integration-points)
  - [Configuration](#configuration)
  - [Metrics \& Instrumentation](#metrics--instrumentation)
  - [Testing \& Validation](#testing--validation)
    - [Unit Tests](#unit-tests)
    - [Integration Tests](#integration-tests)
    - [End-to-End Multistep Test](#end-to-end-multistep-test)
  - [Edge Cases \& Failure Modes](#edge-cases--failure-modes)
  - [Future Enhancements](#future-enhancements)

***

## Summary

The **ReasoningAgent*- orchestrates multi-step decision-making by leveraging self-reflection loops, candidate generation, and critique evaluation to iteratively improve code quality or architectural decisions. It integrates the ReAct paradigm—interleaving reasoning and acting—with Reflexion-style verbal reinforcement to generate candidate solutions, evaluate them using CriticAgent, and refine subsequent outputs based on feedback. By implementing the LATS (Language-model-based Adaptive Tree Search) approach, it produces multiple candidate paths, scores them via CriticAgent, and uses an ensemble-voting mechanism to converge on high-confidence solutions.

In practice, the ReasoningAgent fetches an initial prompt—such as a code snippet with CriticAgent feedback or a high-level architecture brief—and outputs revised code instructions or a detailed plan. It employs safeguards against infinite reflection loops and low-quality critiques, monitors reflection depth, and integrates seamlessly with ModelAdapter for LLM calls and CoderAgent for patch applications.

***

## Responsibilities

1. **Initial Reasoning & Candidate Generation**
   - Given an input—either a code snippet accompanied by a CriticAgent report or an architectural decision prompt—the ReasoningAgent constructs a chain-of-thought (CoT) prompt and invokes the LLM via ModelAdapter to generate an initial set of hypotheses or sub-goals.
   - Uses the ReAct framework to interleave reasoning traces with action calls, enabling the model to query documentation or execute static analysis as part of its reasoning flow.
2. **Self-Reflection Loops**
   - Upon receiving LLM output, triggers a self-reflection step, examining the generated CoT logs and CriticAgent feedback to identify logical inconsistencies or potential errors.
   - Summarizes failure modes—such as failing a unit test or violating a style guideline—and formulates corrective prompts for subsequent iterations.
3. **Multi-Path Decision Search (LATS)**
   - Implements LATS by generating N distinct candidate solutions (e.g., code patches or design proposals) in parallel, each with a separate CoT trace.
   - Scores candidates via CriticAgent—assessing static analysis results, test pass rates, or architectural soundness—and the top k candidates proceed to further reflection or are aggregated via ensemble voting.
4. **Critique & Ensemble Voting**
   - After CriticAgent assigns scores or labels (e.g., pass/fail, severity levels), combines these signals using a weighted voting mechanism to determine the most promising candidate.
   - If no candidate meets quality thresholds, triggers an extended reflection phase—either generating new variations or escalating to human-in-the-loop.
5. **Patch Instruction Generation**
   - Once a candidate is selected, formulates precise instructions or diffs—constructed as unified diffs or API calls—for CoderAgent to apply.
   - Ensures that patches are context-aware, referencing file paths, line numbers, and specific rule IDs when available.
6. **Loop Termination & Safety Checks**
   - Monitors reflection depth (configurable via `maxReflectionDepth`) to prevent infinite loops; if exceeded, returns the best available candidate with a warning.
   - Detects low-quality critiques—e.g., those with negligible differential improvement or high hallucination probability—and aborts further iterations, optionally flagging for human review.

***

## Inputs & Outputs

### Inputs

- **Primary Input Prompt:**
  - For code-centric tasks: a code snippet (e.g., a failing function) and a CriticAgent report containing static analysis findings or test failures.
  - For architectural decisions: a natural-language brief detailing requirements (e.g., "Design a scalable microservice using Node.js and Fastify, with JWT auth").
- **ModelAdapter Handles:**
  - `modelSelection`: chosen LLM model and backend (e.g., `starcoder2-3b-4bit` via Ollama) from ModelAdapter, along with relevant sampling parameters (`temperature`, `top-p`).
- **CriticAgent Feedback:**
  - A structured `CriticReport` object with fields:
    - `issues[]`: array of static analysis issue descriptors (`ruleID`, `severity`, `file`, `line`)
    - `testOutcomes[]`: list of test suites with pass/fail status and coverage percentage.
- **Configuration Parameters:**
  - Under `reasoningAgent` in `~/.nootropic/config.json`:
    - `maxReflectionDepth`: maximum number of self-reflection iterations (default: 3)
    - `numCandidates`: number of parallel paths to generate in LATS (default: 5)
    - `critiqueThreshold`: minimum CriticAgent score to accept a candidate.

### Outputs

- **Revised Plan or Patch Instructions:**
  - For code tasks: a unified diff or a series of in-context patch instructions that CoderAgent can apply directly to the repository.
  - For architectural tasks: a step-by-step plan document (e.g., "Create auth.js with following route handlers...") that can be used by human developers or other agents.
- **Chain-of-Thought Logs:**
  - A truncated CoT summary of each iteration, capturing intermediate reasoning traces (e.g., "Candidate A failed due to missing null check; Candidate B addresses schema validation...").
- **Reflection Report:**
  - A `ReflectionSummary` object containing:
    - `iterations`: number of self-reflection loops executed
    - `finalCandidateID`: identifier of the selected solution
    - `critPath`: array of CriticAgent scores per iteration
    - `warnings[]`: any safety or termination warnings (e.g., "Max reflection depth reached").
- **Ensemble Voting Metadata:**
  - A `VoteResult` structure summarizing how many votes each candidate received and which criteria (e.g., `testCoverage`, `staticScore`) contributed most to the final ranking.

***

## Data Structures

```typescript
/*- CriticAgent's feedback for a given code snippet */
interface CriticReport {
  issues: {
    ruleID: string; // e.g., "javascript.injection.detected"
    severity: "LOW" | "MEDIUM" | "HIGH";
    file: string; // e.g., "src/users.js"
    line: number; // e.g., 42
    message: string; // e.g., "Possible SQL injection"
  }[];
  testOutcomes: {
    suiteName: string; // e.g., "UserService tests"
    passed: boolean;
    coverage: number; // 0–100
  }[];
}

/*- Candidate solution produced by ReasoningAgent */
interface CandidateSolution {
  id: string; // Unique ID (e.g., "cand-20250605-01")
  codeOrPlan: string; // Unified diff or plan text
  costEstimate?: number; // If cost-based ranking is used
  tokensIn: number; // Number of tokens consumed
  tokensOut: number; // Number of tokens generated
  reflectionDepth: number; // Iteration count when generated
}

/*- Reflection iteration metadata */
interface ReflectionIteration {
  iteration: number; // 1-based index
  candidateIDs: string[]; // IDs of all candidates at this iteration
  criticScores: Record<string, number>; // Map candidateID → score
  selectedCandidateID?: string; // If a candidate is immediately accepted
  notes: string; // Brief summary of reasoning outcome
}

/*- Final output from ReasoningAgent */
interface ReasoningResult {
  finalCandidateID: string;
  codeOrPlan: string;
  totalIterations: number;
  reflectionSummary: ReflectionIteration[];
  warnings: string[]; // E.g., ["Max reflection depth reached without passing CriticAgent"]
}
```

***

## Algorithms & Workflow

### Initial Candidate Generation

1. **Formulate CoT Prompt**

   - Construct a prompt comprising:
     1. A declarative instruction (e.g., "You are a senior JavaScript developer tasked with fixing the following issue...")
     2. The code snippet and CriticReport, with issues enumerated.
     3. A directive to generate N candidate fixes with chain-of-thought reasoning.
   - *Example:*

     CriticReport:

     - Possible SQL injection in `getUserByID` at line 42.
     - Missing null check in `updateUser`.
       Generate 3 candidate patches using chain-of-thought reasoning. For each candidate, explain your logic before providing the patch.

2. **Invoke ModelAdapter**

   - Call `ModelAdapter.infer(prompt, {modelID, temperature, topP})`.
   - Capture raw LLM response, including token-level CoT logs.

3. **Parse Candidates**

   - Split the response into distinct `CandidateSolution` entries by detecting explicit delimiters (e.g., "Candidate 1:", "Candidate 2:").
   - Assign unique IDs and record token usage metrics.

4. **Immediate Critic Scoring**

   - For each candidate's `codeOrPlan`, send to CriticAgent for static analysis and/or test execution.
   - Record `criticScores[candidateID] = weightedScore`, where score combines severity-weighted issue counts and test pass rates.

5. **Early Termination Check**
   - If any `criticScores[candidateID] ≥ critiqueThreshold`, select that candidate immediately, populate a single `ReflectionIteration`, and terminate workflow.

### LATS & Ensemble Voting

1. **Parallel Reflection Iterations**

   - If no candidate passes `critiqueThreshold`, proceed to iteration 2.
   - For each of the top k candidates (by critic score), generate new sub-prompts instructing the LLM to refine or correct that candidate:

     ```text
     PreviousCandidate: [codeOrPlan text]
     CriticScore: 62/100 (2 high-severity issues in SQL injection).
     Reflect on these issues and generate an improved patch with corrected SQL parameterization.
     ```

2. **Candidate Expansion**

   - For iteration *i*, generate N updated candidates per previous top k, resulting in up to N×k new candidates.
   - Deduplicate identical patches using a simple text hash to avoid redundant CriticAgent calls.

3. **Second-Round Critic Scoring**

   - Score all new candidates via CriticAgent. If any candidate surpasses `critiqueThreshold`, add to `ReflectionIteration.selectedCandidateID` and exit loop.
   - Otherwise, record the scores and select top k candidates for next iteration.
   - Append this iteration's data into `reflectionSummary[i]`.

4. **Ensemble Voting**
   - After reaching either `maxReflectionDepth` or exhausting iterations, aggregate scores across all candidates in `reflectionSummary`.
   - Compute a vote for each candidate weighted by normalized `criticScores` across iterations.
   - Choose candidate with highest total vote as `finalCandidateID`.

### Patch Instruction Finalization

1. **Generate Final Diff or Plan**
   - If `finalCandidate` is a code patch, ensure it conforms to unified-diff format (e.g., apply `diff -u` style).
   - If it is an architectural plan, structure as a bulleted list of steps with associated file paths and scaffolding templates (e.g., "Use Cookiecutter to scaffold auth-service").
2. **Validate Application Feasibility**
   - Optionally run a dry-run apply (e.g., `git apply --check`) to verify patch validity.
   - If invalid (e.g., malformed diff or patch conflicts), demote `finalCandidate` and pick the next-highest voted candidate; repeat validation.
3. **Return ReasoningResult**
   - Construct a `ReasoningResult` with fields:
     - `finalCandidateID` and its `codeOrPlan`
     - `totalIterations = reflectionSummary.length`
     - Full `reflectionSummary[]` array
     - Any `warnings[]` (e.g., "Second-best candidate chosen due to patch validation failure")

***

## Integration Points

- **CriticAgent:**
  - Programmatically called to analyze candidates and provide issue lists and test results after each candidate generation.
  - Subscribes to CriticAgent events via ReflexionAdapter (e.g., `critic.analysisComplete`) to trigger scoring workflows.
- **ModelAdapter:**
  - All LLM calls (CoT prompting and reflection prompts) route through ModelAdapter's `infer()` method, benefiting from dynamic model selection, local/quantized inference, or cloud fallback.
- **CoderAgent:**
  - Once a `finalCandidate` is determined, ReasoningAgent emits a `PatchReady` event with the unified diff. CoderAgent listens for this event to apply the patch to the codebase and commit changes.
  - If applying the patch fails, CoderAgent emits `PatchApplyFailed`, causing ReasoningAgent to select an alternative candidate or escalate.
- **ReflexionAdapter:**
  - Wires together the event streams between ModelAdapter, CriticAgent, CoderAgent, and ReasoningAgent, enabling context propagation and trace logging for ExplainabilityAgent.
  - Triggers re-scoring if CriticAgent reports SLA breaches (e.g., too many high-severity issues) mid-reflection.
- **Temporal Workflows:**
  - ReasoningAgent's main loop is implemented as a Temporal workflow with activities: `generateCandidates`, `scoreCandidates`, `reflectCandidates`, `validatePatch`, `finalizeSolution`.
  - Temporal ensures durability, retries on transient failures (e.g., LLM timeouts), and persists interim state across restarts.
- **ProjectMgrAgent:**
  - Receives `ReasoningResult` for architectural decisions and updates `project-spec.md` with the chosen plan or revised task list.
  - If ReasoningAgent flags a blocking issue (e.g., no candidate meets minimum quality), ProjectMgrAgent may adjust sprint priorities or request user intervention.

***

## Configuration

All ReasoningAgent settings reside under the `reasoningAgent` key in `~/.nootropic/config.json`:

```jsonc
{
  "reasoningAgent": {
    // Maximum number of self-reflection iterations
    "maxReflectionDepth": 3,

    // Number of distinct candidates to generate per iteration
    "numCandidates": 5,

    // CriticAgent score threshold to accept a candidate immediately (0–100)
    "critiqueThreshold": 85,

    // Sampling parameters for LLM calls
    "temperature": 0.2,
    "topP": 0.9,

    // Minimum improvement (in CriticAgent score) required to continue reflection
    "minImprovementDelta": 5,

    // Cosine similarity threshold to consider two candidates as duplicates
    "deduplicationSimilarity": 0.95,

    // Time (ms) to wait for CriticAgent response before retrying
    "criticTimeoutMs": 2000,

    // Default model preferences for initial generation (ordered list)
    "modelPreference": [
      "starcoder2-3b-4bit",
      "codeLlama-7b-instruct",
      "openai:gpt-4o",
    ],

    // Flag to enable early termination on single high-quality candidate
    "enableEarlyTerminate": true,
  },
}
```

- `maxReflectionDepth`: Ensures a bounded number of iterative refinements, preventing infinite loops.
- `numCandidates`: Controls branching factor in LATS; higher values improve coverage but increase CriticAgent calls and cost.
- `critiqueThreshold`: If any candidate's score ≥ this value, the loop ends early; useful for high-stakes tasks requiring strong correctness.
- `temperature`, `topP`: Used for initial and reflective LLM calls to balance creativity and coherence.
- `minImprovementDelta`: If successive iterations produce negligible CriticAgent score improvements, ReasoningAgent can abort further reflection.
- `deduplicationSimilarity`: Cosine similarity threshold to consider two candidates as duplicates.
- `criticTimeoutMs`: Time (ms) to wait for CriticAgent response before retrying.
- `modelPreference`: Ordered list of preferred models for initial generation.
- `enableEarlyTerminate`: Enable early termination on a single high-quality candidate.

***

## Metrics & Instrumentation

ReasoningAgent is instrumented via ObservabilityAdapter to emit the following telemetry:

- **Span:*- `reasoning.generateCandidates`
  - Fired for each invocation of candidate generation.
  - Attributes:
    - `numCandidates` (e.g., 5)
    - `modelID` (e.g., starcoder2-3b-4bit)
    - `tokensIn`, `tokensOut`
    - `generationLatencyMs`
- **Span:*- `reasoning.scoreCandidates`
  - Fired when scoring candidates via CriticAgent.
  - Attributes:
    - `numCandidatesScored`
    - `criticLatencyMs`
    - `averageCriticScore` (0–100)
- **Counter:*- `reasoning.reflectionIterationsTotal`
  - Incremented each time a full reflection iteration completes.
- **Gauge:*- `reasoning.activeCandidatesCount`
  - Current number of live candidates in memory during LATS.
- **Histogram:*- `reasoning.criticScoreDistribution`
  - Records distribution of CriticAgent scores across all candidates, enabling analysis of scoring trends.
- **Span:*- `reasoning.patchValidation`
  - Fired during patch validation.
  - Attributes:
    - `patchID`
    - `validationStatus` (success / failure)
    - `validationLatencyMs`
- **Counter:*- `reasoning.earlyTerminatesTotal`
  - Number of times the agent ended early due to a candidate passing `critiqueThreshold`.

These metrics feed into external dashboards (Prometheus + Grafana) and facilitate dynamic tuning—such as increasing `numCandidates` if average `criticScore` remains low or adjusting `temperature` based on generation latency.

***

## Testing & Validation

### Unit Tests

1. CoT Prompt Construction
   • Given a sample CriticReport with two issues, assert that buildCotPrompt(critReport, N) includes all issue descriptions and "Generate N candidate..." directive.
2. Candidate Parsing
   • Provide a mock LLM response with correctly delimited "Candidate 1:" and "Candidate 2:" sections. Verify parseCandidates() returns two distinct CandidateSolution objects with proper IDs.
3. Critic Scoring Integration
   • Mock CriticAgent to return known scores for each candidate (e.g., {"cand-1": 50, "cand-2": 90}). Verify that ReasoningAgent immediately selects "cand-2" if critiqueThreshold=85.
4. Reflection Loop Termination
   • Simulate three iterations where no candidate meets threshold but second iteration candidates improve by only 2 points (< minImprovementDelta=5). Assert that the agent halts at iteration 2 with a warning.

### Integration Tests

1. End-to-End Code Fix Scenario
   • Start with a repository containing a function throwing a NullReferenceException.
   • CriticAgent reports missing null check.
   • Run ReasoningAgent; confirm it generates valid patch, CriticAgent scores ≥ threshold, and CoderAgent applies patch successfully.
   • Assert that tests pass afterward.
2. Architectural Decision Workflow
   • Provide a sample architecture prompt: "Design a REST API with Redis caching for session storage."
   • ReasoningAgent should output a plan with steps: "1. Install Fastify, 2. Implement Redis client integration...", and CriticAgent (mocked to validate plan feasibility) returns positive score.
   • Ensure ReasoningResult contains finalCandidateID, codeOrPlan as structured plan, and totalIterations=1.
3. Temporal Retry Logic
   • Force ModelAdapter's LLM call to timeout on the first attempt. Confirm ReasoningAgent retries up to maxRetries and succeeds on second attempt.
   • Verify that OTEL spans reasoning.generateCandidates reflect retry occurrences.

### End-to-End Multistep Test

1. High-Load Candidate Generation
   • Configure numCandidates=10 and maxReflectionDepth=5.
   • Simulate a large codebase with a complex bug (e.g., race condition).
   • Run ReasoningAgent; measure total time, ensure not exceeding SLA (e.g., 30s).
   • Verify all iterations produce distinct candidateIDs (no duplicates) and final patch resolves race condition.
2. Self-Reflection Efficacy
   • Compare performance with and without reflection loops on a suite of buggy functions.
   • Metrics: average number of iterations to reach passing score, average CriticAgent scores per iteration.
   • Confirm self-reflection yields statistically significant improvement (p<0.05) in fewer iterations and higher final scores.

***

## Edge Cases & Failure Modes

1. Infinite Reflection Loops
   • If LLM keeps generating near-identical candidates with minor variations (e.g., cosmetic whitespace changes), reflection iterations may not converge.
   • Mitigation: enforce deduplicationSimilarity threshold; if cosine similarity between top k candidates > 0.95, abort loop with warning "Candidates too similar; aborting further reflection".
2. Low-Quality Critiques
   • CriticAgent might misclassify a correct candidate as failing due to an overzealous static rule.
   • Mitigation: use a secondary evaluator—e.g., run minimal tests—and require unanimous failure before rejecting a candidate.
   • If discrepancies persist for > 2 iterations, flag for human review via ReasoningResult.warnings.
3. LLM Hallucinations
   • When the LLM invents code constructs unsupported by the codebase (e.g., referencing undefined variables), patches will fail validation.
   • Mitigation: immediately validate each candidate via git apply --check or a static syntax parser; discard hallucinated patches and continue with next candidate.
4. Slow CriticAgent Feedback
   • If CriticAgent takes too long (e.g., long test suite execution), LATS may stall.
   • Mitigation: set criticTimeoutMs; if exceeded, assign a provisional low score (e.g., 0) to that candidate and proceed.
   • Log criticTimeout event and include in metrics.
5. Resource Exhaustion
   • Generating too many candidates or iterations may exceed memory or API rate limits.
   • Mitigation: cap numCandidates × maxReflectionDepth to a configurable upper bound (e.g., 25 total candidates).
   • If bound exceeded, abort gracefully with "Maximum search budget reached" warning.

***

## Future Enhancements

1. Adaptive Reflection Depth
   • Instead of fixed maxReflectionDepth, dynamically adjust based on task complexity metrics (e.g., number of CriticAgent issues) to use fewer iterations for simple tasks and more for complex ones.
2. Learning-Based Critic Integration
   • Incorporate a learned critic (e.g., a fine-tuned DistilBERT model) alongside static-analysis-based CriticAgent to predict patch quality from patch text alone, reducing latency for quick rejections.
3. Meta-Learning for Prompt Optimization
   • Use FeedbackAgent's logs to train a meta-model that suggests prompt templates likely to yield better initial candidates, reducing the need for deep reflection loops.
4. Hierarchical LATS
   • Implement a multi-level candidate generation: high-level sketch → medium-level function outline → low-level detailed code, each with its own CriticAgent stage.
   • This could mirror HTN planning, decomposing tasks into subtasks before generating code.
5. Cross-Domain Reasoning
   • Extend ReasoningAgent to handle not only code and architecture but also documentation generation, security policy compliance checks, or even user-facing content creation by abstracting CriticAgent to different domains.
6. Interactive Debugging Mode
   • Develop a REPL-based interface for human developers to interact with ReasoningAgent in real time—querying intermediate CoT steps, injecting manual fixes, and seeing on-the-fly critique results.
