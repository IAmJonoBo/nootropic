# ProjectMgrAgent

***

## Table of Contents

* [ProjectMgrAgent](#projectmgragent)
  * [Table of Contents](#table-of-contents)
  * [Overview](#overview)
  * [Responsibilities](#responsibilities)
  * [Inputs / Outputs](#inputs--outputs)
    * [Inputs](#inputs)
    * [Outputs](#outputs)
  * [Data Structures](#data-structures)
    * [`project-spec.md` Schema (YAML/Markdown)](#project-specmd-schema-yamlmarkdown)

***

## Overview

The **ProjectMgrAgent** is the primary steward of the project specification and overall project health in nootropic. It maintains the canonical `project-spec.md`, coordinates with other agents, tracks SLOs and sprints, and ensures the project proceeds in a structured, predictable fashion.

***

## Responsibilities

1. **Maintaining `project-spec.md`**
   * Parse and validate the YAML/Markdown schema that defines epics, stories, and tasks.
   * Ensure updates from onboarding, PlannerAgent, or user edits are merged, versioned, and saved to Git.
   * Track each task's status (e.g., `pending`, `in-progress`, `blocked`, `done`) and update the spec accordingly.
2. **Tracking SLOs and Sprint Planning**
   * Monitor Service Level Objectives (SLOs) for time, cost, and quality at sprint and project level.
   * Calculate sprint capacity and propose boundaries, assign tasks, and adjust scheduling as needed.
3. **Coordinating with PlannerAgent**
   * Integrate task graphs from PlannerAgent into `project-spec.md`.
   * On "replan" signals, trigger delta‐replan and merge updated subgraphs.
4. **Emitting Signals to Other Agents**
   * Notify **CoderAgent**/**CriticAgent** when a task is ready for implementation.
   * Alert **FeedbackAgent** on task completion for continuous learning.
   * Inform **ReasoningAgent**/**ProjectStakeholderAgent** if a task is blocked beyond a threshold.
5. **Git Integration & Auditing**
   * Commit every change to `project-spec.md` on a dedicated branch, then merge to main after validation.
   * Tag commits with metadata for audit trail.
   * Expose a "spec history" view via Electron dashboard or VS Code extension.

***

## Inputs / Outputs

### Inputs

* **TaskGraph Updates**: JSON/YAML task graph from PlannerAgent (nodes, dependencies, estimates, priorities).
* **OpenTelemetry Metrics**: SLO metrics (e.g., codegen latency, cost per 1,000 tokens), task-level metrics as OTEL spans.
* **Manual Edits & User Overrides**: Direct edits to `project-spec.md` (via VS Code, Electron, or CLI), sprint/priority changes, ad-hoc tasks.

### Outputs

* **Updated `project-spec.md`**: Synchronized YAML/Markdown file reflecting current state (status, assignees, estimates, dependencies).
* **Temporal Signals**:
  * `TaskReadyForImplementation(taskID)`
  * `TaskBlocked(taskID, reason)`
  * `SprintAdjustRequested(sprintID, adjustmentDetails)`
* **Git Commits / Pull Requests**: Automated commits/PRs for major changes, tagging stakeholders for review.

***

## Data Structures

### `project-spec.md` Schema (YAML/Markdown)

```yaml
project:
  name: "Project Name"
  description: "High-level project description"
  start_date: "2025-06-15"
  end_date: "2025-09-30"
  stakeholders:
    - name: "Alice"
      role: "Product Owner"
    - name: "Bob"
      role: "Lead Developer"

sprints:
  - id: "S001"
    name: "Sprint 1"
    start: "2025-06-15"
    end: "2025-06-29"
    capacity_hours: 80
    tasks:
      - "T001"
      - "T002"

epics:
  - id: "E001"
    title: "User Authentication"
    description: "Implement signup/login flows"
    stories:
      - id: "ST001"
        title: "Email/Password Signup"
        description: "Allow users to create accounts via email."
        tasks:
          - id: "T001"
            title: "Design Signup API"
            estimate_hours: 5
            status: "done"
            assigned_to: "Bob"
            dependencies: []
          - id: "T002"
            title: "Implement Signup Endpoint"
            estimate_hours: 10
            status: "in-progress"
            assigned_to: "Bob"
            dependencies: ["T001"]

      - id: "ST002"
        title: "OAuth Integration"
        description: "Allow users to sign in with Google and Facebook."
        tasks:
          - id: "T003"
            title: "Google OAuth Flow"
            estimate_hours: 8
            status: "pending"
            assigned_to: ""
            dependencies: []
          - id: "T004"
            title: "Facebook OAuth Flow"
            estimate_hours: 8
            status: "pending"
            assigned_to: ""
            dependencies: []

 • Fields Explanation:
 • project: Top‐level metadata (name, description, timeline, stakeholders).
 • sprints: Each sprint has an id, name, start/end dates, total capacity_hours, and a list of tasks assigned.
 • epics:
 • id, title, description for grouping related functionality.
 • Under each epic, multiple stories.
 • Under each story, multiple tasks, each with:
 • id: Unique identifier (e.g., "T001").
 • title: Short summary.
 • estimate_hours: Estimated effort.
 • status: One of [pending, in-progress, blocked, done].
 • assigned_to: Developer or agent responsible.
 • dependencies: List of other task IDs that must complete first.

In‐Memory Structures

Within the agent's runtime, ProjectMgrAgent may keep the following in-memory structures (TypeScript types shown as an example):

type TaskStatus = "pending" | "in-progress" | "blocked" | "done";

interface Task {
  id: string;
  title: string;
  estimateHours: number;
  status: TaskStatus;
  assignedTo: string;
  dependencies: string[];
  actualHours?: number;        // Populated once work is complete
  lastUpdated: Date;           // Timestamp of last status change
}

interface Story {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

interface Epic {
  id: string;
  title: string;
  description: string;
  stories: Story[];
}

interface Sprint {
  id: string;
  name: string;
  start: string;               // ISO date string
  end: string;                 // ISO date string
  capacityHours: number;
  tasks: string[];             // List of Task IDs
}

interface ProjectSpec {
  project: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    stakeholders: { name: string; role: string }[];
  };
  sprints: Sprint[];
  epics: Epic[];
}

 • Task Graph Cache
 • The agent may cache a flattened view of Task[] with adjacency lists to quickly navigate dependencies and identify critical path tasks when monitoring SLOs.
 • SLO & Sprint Tracking Structures

interface SprintMetrics {
  sprintID: string;
  totalEstimate: number;
  totalActual: number;
  percentComplete: number;     // totalActual / totalEstimate * 100
  costToDate: number;          // Computed via OTEL spans with OpenCost tags
}

interface SLO {
  id: string;
  type: "latency" | "cost" | "quality";
  threshold: number;           // e.g., 500 ms, $0.10, 95% test coverage
  window: string;              // e.g., "1h", "1d"
  actionOnBreach: "triggerReplan" | "notifySlack" | "escalate";
}

 • Allows ProjectMgrAgent to compute sprint‐level and project‐level health metrics continuously.

⸻

Algorithms

1. Budget Forecasting & Resource Allocation
 1. Compute Sprint Capacity
 • Sum estimateHours of all tasks assigned to the sprint.
 • Compare with capacityHours; if sum > capacityHours, mark the sprint as "over-allocated" and trigger a re-prioritization alert.
 2. Priority Scoring
 • Assign each task a priorityScore = businessValue / estimateHours * riskFactor, where:
 • businessValue: Assigned by product owner (1–10 scale) or computed heuristically (e.g., tasks with many dependents get higher values).
 • riskFactor: Inversely proportional to the number of successful "episode" patches in MemoryAgent relevant to that task's context.
 • Use priorityScore to sort tasks when capacity changes or new tasks are added mid-sprint.
 3. SLO Monitoring & Early Warning
 • Continuously retrieve OTEL metrics via ObservabilityAdapter:
 • Latency SLO: Compute rolling average of "code generation latency" over the last N tasks. If > threshold, raise an alert.
 • Cost SLO: Sum cost_usd tags on spans for tasks in the current sprint. If > budget, notify PlannerAgent to reprioritize to cheaper models or delay non-critical tasks.
 • Quality SLO: Track test pass rates. If coverage < threshold, instruct CriticAgent to generate additional tests or escalate to Story‐level review.

2. Delta-Replanning on Drift
 1. Detect Drift Condition
 • A task's status changes to blocked due to a CriticAgent failure that cannot be auto-fixed.
 • An SLO breach event arrives (e.g., "average codegen latency > 500 ms for the last 5 tasks").
 • A sprint is over-allocated (sum of estimates > capacity).
 2. Identify Impacted Subgraph
 • Find the task(s) that triggered the drift.
 • Using the dependency graph, collect all downstream tasks dependent on the blocked/overrun task. This defines the "impacted subtree."
 3. Invoke PlannerAgent
 • Generate a "delta‐replan request" containing:
 • List of impacted task IDs.
 • Context data (actual vs. estimate, SLO details).
 • PlannerAgent recomputes a new DAG for that subtree (using PDDL or FAST-Downward if large).
 • PlannerAgent returns the updated subgraph (possibly with new tasks, re‐estimated times, or re-ordered dependencies).
 4. Merge & Commit
 • Merge the updated subtree into the in-memory ProjectSpec, replacing the old subgraph.
 • Write the updated project-spec.md to disk, commit on a new branch (replan/<timestamp>), and open a pull request (or auto‐merge if configured).
 • Emit a Temporal signal SprintReplanCompleted(sprintID) with details about moved tasks and new estimates.

3. Sprint Adjustment & Capacity Shifts
 1. Weekly Sprint Review
 • At a configurable time (e.g., every Monday at 9 AM), compute SprintMetrics for the previous sprint.
 • If actual hours + estimated hours of incomplete tasks > next sprint capacity, prompt user (or auto-redistribute) to move tasks to a future sprint.
 2. Ad‐hoc Capacity Changes
 • If user manually edits capacityHours in project-spec.md, recalculate and either:
 • Move tasks from the current sprint to the backlog (status → "pending").
 • Pull tasks from the backlog into the current sprint if spare capacity exists.
 3. Escalation Triggers
 • If a task has been blocked for longer than maxBlockedDuration (configurable, e.g., 48 hours), emit TaskEscalation(taskID, reason) so human stakeholders (via Slack, email) can intervene.

⸻

Edge Cases
 1. Overlapping Stories
 • Two stories under different epics share tasks (task ID duplicates).
 • Handling: Validate uniqueness of task IDs; if a duplicate is detected, raise an error and prompt user to rename one.
 2. Changing Requirements Mid-Sprint
 • A story's description or priority changes after sprint start.
 • Handling:
 • Detect re-opened story (status "in-progress" but description changed).
 • Re‐assign dependent tasks: recalculate estimates, update priorityScore, and notify PlannerAgent for possible reordering.
 3. Insufficient Sprints for Task Load
 • All sprints have available capacity < sum of remaining estimates.
 • Handling:
 • Automatically create a new sprint entry with default capacity (configurable).
 • Notify stakeholders that additional sprints were added.
 4. Rapidly Flapping Task Status
 • Tasks repeatedly move between in-progress and blocked within short intervals (e.g., due to flaky tests).
 • Handling:
 • Debounce status changes: only propagate "blocked" to PlannerAgent if it remains blocked for > N minutes (configurable).
 • Encourage ReasoningAgent to insert diagnostic tasks (e.g., "Investigate test flakiness") to stabilize.
 5. Project Specification Merge Conflicts
 • Two parallel edits to project-spec.md conflict in Git.
 • Handling:
 • Upon pull or merge, detect conflicts; open a VS Code merge editor with highlights.
 • Provide a "Merge Assistant" prompt via VS Code extension that suggests merging based on timestamps or task IDs.

⸻

Integration Points
 • ReflexionAdapter
 • Subscribes to ReflexionEngine events (e.g., ModelSwitched, CodeFixApplied, TaskRetryInitiated).
 • Logs these events as annotations on tasks in project-spec.md, e.g., "Task T002: code fixed automatically by LLM at 2025‐06‐16 14:23."
 • Git Operations
 • Uses a Git library (e.g., isomorphic-git or simple-git) to programmatically commit changes to project-spec.md.
 • Tags commits with semantic messages:
 • feat(spec): add T005 "Configure GitHub Actions" (epic E002)
 • fix(spec): update estimate for T003 from 5h to 8h
 • If running in a GitHub Actions CI/CD context, opens a pull request via the GitHub CLI (gh pr create) or API, tagging relevant stakeholders.
 • Temporal Signals & Queries
 • Emits Temporal signals to inform PlannerAgent of re-planning triggers or capacity issues.
 • Exposes a query interface (HTTP gRPC) for other agents to request the current ProjectSpec JSON.
 • Slack/Email Notifications
 • When critical events occur—SLO breach, sprint over-allocation, unrecoverable task failure—ProjectMgrAgent can send notifications via a NotificationAdapter (integrating Slack webhook or SMTP).
 • Templates for messages (configurable via .nootropic/config.json):
 • "🚨 SLO Breach: Average codegen latency 750 ms (threshold 500 ms). PlannerAgent has been notified to replan."
 • "🔔 Sprint 3 is over‐allocated by 12 hours. Consider moving tasks T012, T015 to Sprint 4."

⸻

Configuration

All configuration parameters for ProjectMgrAgent live in ~/.nootropic/config.json under a nested key projectManager, for example:

{
  "projectManager": {
    // Maximum hours a task can remain blocked before escalation
    "maxBlockedDurationMinutes": 120,

    // Sprint auto‐review schedule (cron syntax)
    "sprintReviewCron": "0 9 * * MON",

    // Default new sprint capacity (hours)
    "defaultSprintCapacityHours": 80,

    // SLO definitions (used if not explicitly defined in project-spec)
    "defaultSLOs": [
      { "id": "latency‐codegen", "type": "latency", "threshold": 500, "window": "1h", "actionOnBreach": "triggerReplan" },
      { "id": "cost‐daily", "type": "cost", "threshold": 10.0, "window": "1d", "actionOnBreach": "notifySlack" },
      { "id": "testCoverage", "type": "quality", "threshold": 90, "window": "1d", "actionOnBreach": "triggerReplan" }
    ],

    // Notification settings
    "notifyOn": {
      "sloBreach": true,
      "overAllocation": true,
      "taskEscalation": true
    },

    // Integration with external services
    "slackWebhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    "email": {
      "smtpHost": "smtp.example.com",
      "smtpPort": 587,
      "from": "nootropic-bot@example.com"
    }
  }
}

 • maxBlockedDurationMinutes: How long a task can stay in "blocked" status before escalation.
 • sprintReviewCron: Cron expression determining when to run the weekly sprint review.
 • defaultSprintCapacityHours: When a new sprint is auto-created, this capacity is used unless overridden in project-spec.md.
 • defaultSLOs: If project-spec.md omits SLOs, these defaults apply.
 • notifyOn: Toggles for which events should trigger Slack/email notifications.
 • slackWebhookUrl / email: Connection details for external alerting.

⸻

Summary

The ProjectMgrAgent sits at the heart of nootropic's project orchestration. By maintaining the definitive project-spec.md, coordinating with PlannerAgent for initial and delta replanning, tracking sprint capacity and SLOs, and emitting signals to other agents and external systems, it ensures that development proceeds in a structured, predictable fashion. Its algorithms for budget forecasting, priority scoring, and sprint adjustment keep the project on track, while integration points with Git, Temporal, and notification systems guarantee transparency and accountability.

For further details on individual agent implementations (e.g., PlannerAgent, CoderAgent, CriticAgent), consult the corresponding files under the COMPONENTS/ directory.

---

```
