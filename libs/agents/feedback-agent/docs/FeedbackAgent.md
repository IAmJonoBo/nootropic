# FeedbackAgent

## 1. Responsibilities

The **FeedbackAgent** is responsible for collecting, aggregating, and leveraging feedback signals to continuously improve nootropic’s AI-driven workflows. Its core functions include:

1. **Human Feedback Ingestion**

   * Capture explicit user feedback (e.g., thumbs up/down, “accept patch,” “reject patch,” free-text comments) via VS Code extension and Electron dashboard.
   * Collect implicit feedback signals such as code review approvals or rejections in Git, manual edits overriding LLM-generated code, and user corrections during interactive sessions.

2. **Test Outcome Monitoring**

   * Subscribe to test execution results from CriticAgent (unit, integration, and regression test pass/fail statuses).
   * Record test coverage metrics and track fluctuations over time to identify areas where generated tests may be inadequate.

3. **Cost & Performance Metrics Aggregation**

   * Consume OpenTelemetry spans (via ObservabilityAdapter) tagged with `cost_usd`, `latency_ms`, and `tokens_in/tokens_out` for every LLM call and static-analysis check.
   * Maintain historical time series of resource usage, enabling detection of model performance degradation or cost spikes.

4. **LoRA Fine-Tuning Pipeline**

   * Consolidate “episodes” consisting of (prompt, generated patch, validation outcome) pairs from successful code generations or fixes approved by users.
   * At scheduled intervals (e.g., nightly), orchestrate off-policy PPO-based LoRA fine-tuning jobs that update selected base models (e.g., StarCoder2, Llama2) to better align with project style and reduce future errors.
   * Validate new LoRA weights in a canary environment (10% of inference traffic by default) before promoting them fully into the local model pool.

5. **Prompt Template Optimization**

   * Analyze historical prompt usages and corresponding success/failure outcomes.
   * Train a bandit-style policy (PPO) that ranks and adjusts prompt templates, few-shot examples, and sampling parameters (temperature, top-k/top-p) to maximize code accuracy and adherence to style guidelines.
   * Periodically evaluate candidate prompt modifications in small A/B tests (e.g., “Use fewer context examples vs. more”) and adopt winning templates.

6. **Feedback Aggregation & Reporting**
   * Expose aggregated metrics and insights (e.g., “model X had 12% higher rate of failed unit tests compared to model Y this week”) through the Electron dashboard or CLI.
   * Provide summary reports (weekly or per-sprint) indicating areas for improvement:
     * LLM accuracy per language or framework
     * Frequent static-analysis failures that bypass autofix
     * Declining test coverage trends
     * Cost anomalies requiring model reconfiguration.

***

## 2. Inputs & Outputs

### 2.1 Inputs

1. **User Feedback Signals**

   * **Explicit signals**: Thumbs up/down, “approve patch,” “request revision” from VS Code extension or Electron UI.
   * **Implicit signals**: Code review events (merge vs. revert), manual edits that override LLM-generated code, pull-request comments indicating dissatisfaction.

2. **OTEL Spans & Observability Data**

   * Attributes such as:
     * `component`: (e.g., `model-adapter`, `coder-agent`, `critic-agent`)
     * `model.name`, `tokens_in`, `tokens_out`
     * `latency_ms`, `cost_usd`
     * `taskID`, `workflowID`

3. **Test Execution Results**

   * Structured `TestResult` objects from CriticAgent containing:
     * `testSuite`, `tests[]` with pass/fail status, and `coverage` percentage.
   * Failure/anomaly logs (stack traces, error messages) for each test suite.

4. **MemoryAgent Episodes**

   * Collections of past `(prompt, accepted_patch)` pairs used as fine-tuning training examples.

5. **Configuration Parameters**

   * LoRA hyperparameters (learning rate, batch size, number of epochs), canary rollout ratio, PPO policy settings, and scheduling (e.g., nightly at 02:00).
   * Prompt optimization settings: initial set of templates, exploration rate, reward function definitions.

6. **External Data (Optional)**
   * Public code style guides or lint rule sets (e.g., ESLint configurations, PEP8 rules) for computing reward signals.
   * Downloaded benchmark datasets (e.g., code generation benchmarks) if used for periodic validation.

### 2.2 Outputs

1. **LoRA Checkpoints**

   * Fine-tuned LoRA weights saved as separate files (e.g., `starcoder2-3b-lora-2025-06-20.pt`) stored under `~/.nootropic/lora/`.
   * Metadata JSON accompanying each checkpoint:

     ```jsonc
     {
       "base_model": "starcoder2-3b-4bit",
       "date": "2025-06-20T02:00:00Z",
       "num_epochs": 3,
       "train_loss": 0.035,
       "val_loss": 0.042,
       "validation_accuracy": 0.89,
       "canary_key": "lora_canary_2025-06-20",
     }
     ```

2. **Updated Prompt Templates & Sampling Policies**

   * JSON or YAML files containing revised prompt templates, few-shot example selection rules, and optimal sampling parameters (temperature, top-k, top-p).
   * Example:

     ```yaml
     prompt_templates:
       - name: "default"
         template: |
           You are an expert {language} developer. Given the task:
           {task_description}

           Here is relevant context:
           {code_context}

           Using these examples:
           {few_shot_examples}

           Provide the patch in unified diff format.
         temperature: 0.2
         top_p: 0.9
       - name: "concise_context"
         template: |
           Task: {task_description}

           Code context (concise):
           {summarized_context}

           Generate patch only.
         temperature: 0.1
         top_p: 0.8
     ```

3. **Feedback Statistics & Reports**

   * Aggregated CSV or JSON summary files per time period (daily, weekly, per-sprint) containing:
     * **LLM Accuracy**: percentage of generated code patches that passed CriticAgent checks on first attempt.
     * **Average Cost**: mean `cost_usd` per code generation request, broken down by model.
     * **Prompt Template Performance**: reward scores for each template (e.g., “default” yielded 0.82 success, “concise\_context” yielded 0.76).
     * **Test Coverage Trends**: average coverage per patch, number of failing tests triggered.
     * **User Feedback Ratios**: ratio of thumbs-up to thumbs-down by task category (e.g., “refactor” vs. “new feature”).

4. **Canary Deployment Signals**

   * Boolean flags or metrics indicating whether a newly fine-tuned LoRA checkpoint met performance thresholds (e.g., coverage ≥ 90%, validation accuracy ≥ 0.85) during canary testing.
   * If canary passes, publish the new checkpoint into Tabby ML’s model pool with a higher priority score.

5. **Reward Signals for PPO**

   * Numeric reward values per prompt invocation used to train policy:
     * +1 for user acceptance, 0 for no feedback, -1 for rejection or manual override.
     * Additional reward adjustments based on cost (< budget yields +0.5, > budget yields -0.5), test coverage improvements, and latency improvements.

6. **Telemetry & OTEL Spans**
   * Emit custom OTEL spans for feedback-processing steps:
     * `feedback.ingest` (attributes: `num_signals`, `source`),
     * `feedback.lora_training` (`epochs`, `train_loss`, `val_loss`, `duration_ms`),
     * `feedback.prompt_optimize` (`template_count`, `avg_reward`, `duration_ms`).

***

## 3. Data Structures

### 3.1 Feedback Signal Types

````ts
/** Explicit user feedback for a single task or patch */
interface UserFeedback {
  taskID: string;
  patchID: string;            // Identifier for the specific generated patch
  feedbackType: "approve" | "reject" | "partial";
  comment?: string;           // Optional free-text rationale
  timestamp: string;          // ISO 8601
  userID: string;             // For multi-user scenarios
}

/** Implicit feedback derived from code repository actions */
interface ImplicitFeedback {
  taskID: string;
  actionType: "merge" | "revert" | "manual_edit";
  details: string;            // E.g., commit SHA or PR link
  timestamp: string;          // ISO 8601
}

/** Test outcome for a single test suite */
interface TestOutcome {
  taskID: string;
  testSuite: string;
  tests: {
    name: string;
    status: "passed" | "failed";
    errorMessage?: string;
  }[];
  coverage: number;           // 0–100
  timestamp: string;          // ISO 8601
}

/** Cost & performance record per LLM invocation */
interface InvocationMetrics {
  taskID: string;
  modelName: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  costUsd: number;
  timestamp: string;          // ISO 8601
}

3.2 LoRA Training Structures

/** Single training example for LoRA fine-tuning */
interface LoRAExample {
  prompt: string;             // Full expanded prompt (with context and few-shots)
  generatedPatch: string;     // Unified diff or code snippet
  successLabel: boolean;      // True if patch passed CriticAgent on first attempt
  timestamp: string;          // ISO 8601
}

/** LoRA training metadata */
interface LoRAMetadata {
  baseModel: string;          // E.g., "starcoder2-3b-4bit"
  numEpochs: number;
  batchSize: number;
  learningRate: number;
  datasetSize: number;        // Number of training examples
  trainLoss: number;
  valLoss: number;
  validationAccuracy: number; // 0–1
  trainingTimestamp: string;  // ISO 8601
}

3.3 Prompt Template & Policy Schema

/** Single prompt template entry */
interface PromptTemplate {
  name: string;
  templateText: string;       // Template with placeholders (e.g., {task_description})
  temperature: number;        // Sampling temperature
  topP: number;               // nucleus sampling parameter
  fewShotExampleCount: number;
}

/** Policy state for PPO-based prompt selection */
interface PromptPolicyState {
  templateName: string;
  cumulativeReward: number;
  selectionCount: number;
  averageReward: number;      // cumulativeReward / selectionCount
}

/** PPO policy hyperparameters */
interface PPOConfig {
  learningRate: number;
  gamma: number;              // Discount factor
  epsilon: number;            // Clipping parameter
  batchSize: number;
  updateFrequency: number;    // Number of examples before policy update
}


⸻

4. Algorithms & Workflow

4.1 Feedback Ingestion & Normalization
 1. Collect Signals
 • Subscribe to explicit user feedback events from the VS Code extension and Electron UI through a WebSocket or gRPC channel.
 • Poll or subscribe to Git repository webhooks (via a local Git listener or service) to detect merges, reverts, or manual edits, transforming them into ImplicitFeedback records.
 • Listen to OTEL spans exposed via ObservabilityAdapter to capture cost and latency for each LLM invocation, converting them into InvocationMetrics.
 • Capture test outcomes from CriticAgent as TestOutcome.
 2. Normalize & Dedupe
 • Convert all timestamps to UTC.
 • If multiple feedback signals arrive for the same (taskID, patchID) within a short window (e.g., 5 minutes), aggregate them (e.g., multiple approves become a single “strong approve”).
 • Filter out ambiguous signals (e.g., explicit “reject” followed by “approve” within 1 minute) by timestamp ordering.
 3. Store in Local Database
 • Persist normalized feedback records into a lightweight embedded store (e.g., SQLite under ~/.nootropic/feedback.db).
 • Indexed tables: user_feedback, implicit_feedback, test_outcomes, invocation_metrics.

4.2 LoRA Fine-Tuning Pipeline
 1. Build Training Dataset
 • Query SQLite for all LoRAExample candidates: those (prompt, generatedPatch) where successLabel === true.
 • Ensure a balanced dataset by sampling across task types (e.g., new feature vs. refactor vs. bugfix).
 • Optionally, filter out examples older than a retention period (e.g., 90 days) to avoid stale patterns.
 2. PPO-Based Prompt Policy Update
 • For each recorded invocation, compute a reward:
 • +1 if successLabel === true; -1 if false.
 • Add +0.5 if costUsd < costThreshold, -0.5 if costUsd > costThreshold.
 • Add +0.5 if coverage > coverageThreshold, else 0.
 • Append to a replay buffer. When buffer size ≥ PPOConfig.updateFrequency, run a PPO optimization step:
 • Compute policy gradients for selecting templates.
 • Update policy parameters to maximize expected reward.
 3. LoRA Training Job
 • Initialize base model checkpoint (e.g., starcoder2-3b-4bit).
 • Configure LoRA hyperparameters from ~/.nootropic/config.json under feedbackAgent:

{
  "feedbackAgent": {
    "loRAConfig": {
      "learningRate": 1e-4,
      "batchSize": 32,
      "numEpochs": 3
    },
    "canaryRolloutRatio": 0.1
  }
}


 • Launch fine-tuning job (e.g., via Hugging Face Accelerate or a Python script) on local GPU (if available) or CPU fallback:

python3 scripts/train_lora.py \
  --base_model starcoder2-3b-4bit \
  --dataset_path ~/.nootropic/lora_dataset.jsonl \
  --output_dir ~/.nootropic/lora/starcoder2-3b-lora-<date> \
  --batch_size 32 \
  --learning_rate 1e-4 \
  --epochs 3


 • Track training loss and validation accuracy; store metrics in LoRAMetadata.

 4. Canary Deployment & Evaluation
 • Copy newly generated LoRA weights to Tabby ML’s model pool with a temporary model ID (e.g., starcoder2-3b-lora-canary).
 • Update ModelAdapter’s candidate list to include the canary model with a low initial priority.
 • Run a set of benchmarks (e.g., standard code generation tests, sample tasks) comparing benchmark metrics (accuracy, cost, latency) between canary and base model.
 • If canary meets or exceeds defined thresholds (e.g., +2% accuracy, cost within 5% of base), promote canary to full model: rename ID to starcoder2-3b-lora-latest and increase priority.
 • Remove older canary checkpoints beyond retention policy (e.g., keep last 5 LoRA checkpoints).

4.3 Prompt Template Optimization
 1. Collect Prompt Outcomes
 • For each invocation, record:
 • promptTemplateName, samplingParams, successLabel, rewardValue (computed as in 4.2.2).
 • Store in SQLite table prompt_history(templateName, samplingParams, rewardValue, timestamp).
 2. Policy Evaluation & Update
 • Periodically (e.g., every 100 new experiences), run PPO update step using the replay buffer of prompt interactions.
 • Update PromptPolicyState for each template, adjusting exploration/exploitation balance (ε‐greedy or Gaussian noise).
 3. A/B Testing of New Templates
 • If there are new candidate templates (e.g., introduced by developers or generated by ReasoningAgent), include them in exploration at a lower initial probability.
 • Compare their average reward to existing templates over a fixed window (e.g., 500 tasks).
 • Automatically remove templates whose average reward falls below a performance threshold (e.g., 0.5) over the window.
 4. Update Configurations
 • Write updated prompt templates and sampling parameters to ~/.nootropic/prompt_templates.yaml.
 • Notify ModelAdapter and CoderAgent to reload templates on-demand or at next process restart.

⸻

5. Integration Points
 1. ReflexionAdapter & ObservabilityAdapter
 • Subscribe to ReflexionAdapter events to detect when a model switch or code-fix retry occurs, adjusting reward signals accordingly (e.g., penalize a prompt if it required a model switch due to latency).
 • Listen to ObservabilityAdapter’s OTEL spans for accurate cost and latency data; use these metrics to calculate reward adjustments.
 2. ModelAdapter
 • After LoRA promotion, update ModelAdapter’s candidate list and priority scores so that the new LoRA-enhanced model is preferred.
 • Receive real-time performance feedback (e.g., “LoRA model failed syntax checks 10% more than base model”) to potentially roll back or re-train.
 3. MemoryAgent
 • Provide a curated set of high-quality episodes (prompts + patches) to use as few-shot examples; exclude examples causing repeated failures.
 • Access MemoryAgent’s similarity search to cluster “hard” tasks requiring manual intervention and add them to a “hard example” queue for specialized fine-tuning.
 4. PlannerAgent & ProjectMgrAgent
 • Supply aggregated metrics (e.g., “feature X has a 30% first-pass failure rate”) to PlannerAgent to adjust future task estimates or reprioritize backlog.
 • Inform ProjectMgrAgent of significant LoRA updates or prompt template changes that might impact sprint capacity or quality SLOs.
 5. CriticAgent & CoderAgent
 • Provide immediate feedback on whether generated patches passed static analysis and tests, enabling real-time reinforcement signals.
 • When prompt optimization suggests new templates, CoderAgent uses them for subsequent code generations, closing the feedback loop.
 6. External Notification Systems (Optional)
 • On critical feedback metrics (e.g., “LoRA canary failed on benchmark” or “Prompt template loss trending upward”), send alerts via Slack or email using NotificationAdapter.
 • Integrate with dashboards (Grafana) to visualize trends in feedback metrics over time.

⸻

6. Configuration

All FeedbackAgent parameters are defined under the feedbackAgent key in ~/.nootropic/config.json. Example configuration:

{
  "feedbackAgent": {
    // LoRA fine-tuning hyperparameters
    "loRAConfig": {
      "learningRate": 0.0001,
      "batchSize": 32,
      "numEpochs": 3
    },
    // Fraction of inference traffic for canary model (0–1)
    "canaryRolloutRatio": 0.1,

    // Reward function weights
    "rewardWeights": {
      "success": 1.0,
      "costBonus": 0.5,
      "costPenalty": 0.5,
      "coverageBonus": 0.5
    },

    // PPO policy hyperparameters
    "ppoConfig": {
      "learningRate": 0.00005,
      "gamma": 0.99,
      "epsilon": 0.2,
      "batchSize": 64,
      "updateFrequency": 100
    },

    // Prompt optimization settings
    "initialTemplates": [
      {
        "name": "default",
        "templateText": "You are an expert {language} developer. Given the task:\n{task_description}\n\nHere is relevant context:\n{code_context}\n\nUsing these examples:\n{few_shot_examples}\n\nProvide the patch in unified diff format.",
        "temperature": 0.2,
        "topP": 0.9,
        "fewShotExampleCount": 2
      },
      {
        "name": "concise_context",
        "templateText": "Task: {task_description}\n\nCode context (concise):\n{summarized_context}\n\nGenerate patch only.",
        "temperature": 0.1,
        "topP": 0.8,
        "fewShotExampleCount": 1
      }
    ],

    // Database and storage settings
    "databasePath": "~/.nootropic/feedback.db",
    "loraOutputDir": "~/.nootropic/lora/",

    // Scheduling (cron) for LoRA training and prompt updates
    "schedules": {
      "loraTrainingCron": "0 2 * * *",       // 02:00 UTC daily
      "promptOptimizeCron": "0 3 * * 0"     // 03:00 UTC weekly (Sunday)
    }
  }
}

 • loRAConfig: Controls learning rate, batch size, and number of epochs for fine-tuning.
 • canaryRolloutRatio: Fraction of inference traffic routed to new LoRA model for evaluation.
 • rewardWeights: Weighting factors for computing composite reward signals.
 • ppoConfig: Hyperparameters for PPO-based prompt policy optimization.
 • initialTemplates: List of default prompt templates with associated sampling parameters.
 • databasePath & loraOutputDir: File system locations for SQLite feedback database and LoRA output checkpoints.
 • schedules: Cron expressions for automated LoRA training and prompt policy updates.

⸻

7. Metrics & Instrumentation

The FeedbackAgent emits OpenTelemetry metrics and spans to facilitate monitoring, analysis, and self-healing actions:
 1. Span: feedback.ingest
 • Fired when a batch of feedback signals is processed.
 • Attributes:
 • numExplicitSignals: number of explicit user feedback events
 • numImplicitSignals: number of implicit feedback events
 • ingestDurationMs: time taken to parse and store signals
 2. Counter: feedback.loRA_examples
 • Increments by 1 for each new (prompt,patch) example added to the LoRA training set.
 3. Span: feedback.loRA_training
 • Fired during each LoRA training job.
 • Attributes:
 • baseModel: e.g., "starcoder2-3b-4bit"
 • numEpochs: number of epochs run
 • trainLoss: final training loss
 • valLoss: final validation loss
 • durationMs: total training time in milliseconds
 4. Counter: feedback.loRA_published
 • Increments by 1 each time a new LoRA checkpoint is successfully promoted out of canary.
 5. Gauge: feedback.loRA_success_rate
 • Reports the success ratio (validationAccuracy) of the most recent LoRA checkpoint.
 6. Span: feedback.prompt_optimize
 • Fired during each prompt policy update.
 • Attributes:
 • templatesEvaluated: number of prompt templates considered
 • averageReward: average reward across evaluated prompts
 • durationMs: time taken for policy optimization
 7. Counter: feedback.prompt_removed
 • Number of prompt templates removed due to poor performance.
 8. Counter: feedback.alerts_sent
 • Number of notifications triggered (e.g., canary failures, cost spikes, coverage drops).

By instrumenting these metrics, the ReflexionEngine or external monitoring systems can detect when feedback pipelines are lagging, when LoRA training fails to converge, or when prompt policies degrade—enabling automated intervention or alerts.

⸻

8. Testing & Validation
 1. Unit Tests
 • Test normalization logic for explicit and implicit feedback to ensure correct deduplication and timestamp handling.
 • Validate reward function calculations under various cost/coverage scenarios.
 • Mock SQLite interactions to verify data insertion and retrieval for feedback signals and LoRA examples.
 2. Integration Tests
 • Run a simulated workflow:
 1. Generate a dummy code patch via CoderAgent.
 2. Simulate user feedback (approve or reject).
 3. Verify that FeedbackAgent stores the correct UserFeedback record.
 4. Insert corresponding TestOutcome and InvocationMetrics records.
 5. Trigger a LoRA training job (with a tiny dataset) and verify that the resulting LoRA checkpoint meets expected format and directory placement.
 3. End-to-End Testing
 • In a Temporal local environment, execute several tasks with varied outcomes:
 • Tasks with successful patches on first attempt (approve).
 • Tasks requiring multiple fix cycles.
 • Tasks routed to cloud due to local inference failure.
 • Run FeedbackAgent’s scheduled jobs (LoRA training, prompt optimization) and assert that new LoRA models appear in Tabby ML and that prompt templates update appropriately.
 • Verify canary deployment logic by simulating a benchmark suite: compare performance of new LoRA model against base and ensure it is either promoted or rolled back.
 4. Load Testing
 • Simulate a high volume of feedback signals (e.g., 1,000 signals per minute) and measure feedback.ingest latency to ensure FeedbackAgent can scale.
 • Stress-test LoRA training pipeline with a large dataset (e.g., 10,000 examples) on CPU-only environments to validate resource handling and progress logs.

⸻

9. Edge Cases & Failure Modes
 1. Cold Start (No Historical Data)
 • When no episodes exist, LoRA training should skip or run a minimal epoch to avoid overfitting on an empty dataset.
 • Prompt optimization should default to initial templates until sufficient reward data accumulates (e.g., at least 50 interactions).
 2. Overfitting LoRA Model
 • If validation accuracy far exceeds training accuracy (e.g., train=0.98, val=0.40), flag the checkpoint as “overfit” and do not promote.
 • Maintain a sliding window of past validation accuracies; if overfitting persists for three consecutive rounds, reduce learning rate by a factor of 0.5.
 3. Erroneous or Malicious Feedback
 • Detect outlier feedback values (e.g., 100 consecutive rejections) and flag for manual review.
 • Rate-limit explicit feedback per user (e.g., maximum 5 feedback actions per minute) to mitigate spam or accidental rapid clicks.
 4. Disk Space Constraints
 • LoRA checkpoints can be large; enforce a retention policy (keep only last N checkpoints, configurable, e.g., 5).
 • When disk usage > threshold (e.g., 80% of allocated space), automatically prune oldest checkpoints and archived feedback records.
 5. Database Corruption or Locking
 • If SQLite database becomes locked or corrupted, fallback to in-memory buffer and retry background writes when DB is available.
 • Emit OTEL span feedback.db_error and notify user to check disk health.
 6. Canary Model Underperforms
 • If canary model fails benchmark or causes increased cost/spikes in latency, automatically roll back: remove canary from ModelAdapter’s pool and delete LoRA checkpoint.
 • Send an alert via NotificationAdapter indicating the reason for rollback.
 7. Prompt Policy Instability
 • If new prompt templates consistently yield negative average rewards, revert to last stable set of templates.
 • Log policy update failures and alert maintainers for manual intervention.

⸻

10. Future Enhancements
 1. Multi-Task LoRA Specialization
 • Instead of a single LoRA model per base, train specialized LoRA adapters based on project modules or language frameworks (e.g., starcoder2-python-lora, starcoder2-javascript-lora) to capture domain-specific nuances.
 2. Federated Feedback Aggregation
 • Support multi-user or distributed setups by aggregating feedback from multiple developer machines into a central server, running a federated LoRA training process.
 3. Active Learning for Hard Examples
 • Automatically identify tasks with high failure rates (“hard tasks”) and solicit explicit user labeling (e.g., “Is this patch acceptable?”) to enrich the LoRA training dataset with informative examples.
 4. Automated Prompt Generation via Meta-Learning
 • Use meta-learning techniques to generate entirely new prompt template structures rather than just optimizing existing templates, potentially yielding stronger improvements in code quality.
 5. Explainable Feedback Insights
 • Integrate with ExplainabilityAgent to highlight which parts of the prompt or code context contributed most to a patch’s failure, guiding better prompt design.
 6. Cross-Project Transfer Learning
 • Leverage feedback and LoRA checkpoints from similar open-source projects to bootstrap new project models, reducing cold-start overhead.

⸻

11. Summary

The FeedbackAgent closes the loop on nootropic’s AI-driven development workflows by gathering explicit and implicit feedback, monitoring test outcomes, aggregating cost and performance metrics, and orchestrating LoRA fine-tuning and prompt optimization. Through a combination of off-policy PPO, scheduled training pipelines, and robust integration with other agents (ModelAdapter, CoderAgent, CriticAgent, PlannerAgent), it ensures that nootropic continuously learns from real-world usage, adapting models and prompts to maximize accuracy, efficiency, and developer satisfaction. Robust instrumentation, careful handling of edge cases, and clear configuration options make FeedbackAgent a foundational component for maintaining long-term code quality and performance.```
````
