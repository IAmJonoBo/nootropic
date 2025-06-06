# PlannerAgent

## Summary

The **PlannerAgent** is responsible for translating high‐level project briefs into actionable Directed Acyclic Graphs (DAGs) of tasks, using formal AI planning techniques such as the Planning Domain Definition Language (PDDL) and Hierarchical Task Network (HTN) methods. It ingests the `project-spec.md` file as input, generates a `TaskGraph` JSON structure and updates `project-spec.md` accordingly, and supports delta‐replanning when project parameters change. Internally, it manages PDDL domain and problem files, interfaces with a Temporal workflow engine for persistence, and handles edge cases such as cyclic dependencies and resource constraints. PlannerAgent integrates with ModelAdapter to retrieve LLM‐derived action heuristics, signals ProjectMgrAgent and ReflexionEngine for state changes, and is configured via parameters like search timeouts and maximum tasks per sprint.

***

## 1. Responsibilities

1. **Translating High‐Level Briefs into DAGs**

   * The PlannerAgent consumes a user‐specified project brief or `project-spec.md` file and encodes it as PDDL domain and problem definitions. For example, epics become PDDL "objects," stories and tasks become actions or goals, and dependencies map to PDDL preconditions and effects.
   * It invokes a PDDL or HTN planner (e.g., a Fast Downward planner or SHOP2) to solve the planning problem and produce a sequence or partial order of tasks that satisfies all constraints.
   * The output is normalized into a `TaskGraph` JSON schema, which includes nodes (tasks) and edges (dependencies) with metadata such as estimated effort and priority.

2. **Delta‐Replanning & Adaptation**

   * When project conditions change—such as a task's estimated hours doubling or a new dependency emerging—the PlannerAgent performs a delta‐replan. It identifies the impacted subgraph via dependency analysis and re‐solves only the affected portion of the DAG, minimizing overall disruption.
   * The agent merges the newly computed subgraph back into the in‐memory representation and updates `project-spec.md`, committing changes to Git and notifying ProjectMgrAgent via Temporal signals.

3. **Resource & Capacity Reasoning**

   * The PlannerAgent incorporates resource constraints (e.g., developer availability, machine capacity) into the PDDL model by introducing numeric fluents for hours available per sprint and cost metrics for AI calls.
   * Numeric and temporal extensions to PDDL (PDDL 2.1+) are used to model time windows, resource consumption, and deadlines, allowing the planner to generate feasible schedules that respect sprint capacities.

4. **Template & Domain Management**

   * Maintains a set of PDDL domain templates (e.g., generic "create REST endpoint" or "setup database schema") initialized via Cookiecutter or Yeoman. These templates define abstract operators that the planner can refine into concrete tasks.
   * On each planning iteration, templates are instantiated with project‐specific parameters (language, framework, tooling), ensuring the generated DAG aligns with best‐practice scaffolding patterns.

5. **Integration with Temporal & Git**
   * Implements planning steps as Temporal activities, ensuring durability and the ability to resume in case of failures. The PlannerAgent workflow publishes `TaskReadyForImplementation(taskID)` or `SprintReplanCompleted(sprintID)` signals as needed.
   * Writes back the updated `project-spec.md` file, commits to Git on a dedicated branch, and opens or merges pull requests based on configuration.

***

## 2. Inputs / Outputs

### 2.1 Inputs

1. **`project-spec.md` File**

   * Contains a YAML/Markdown specification of epics, stories, tasks, dependencies, estimates, and sprint boundaries.
   * Example YAML snippet:

     ```yaml
     epics:
       - id: "E001"
         title: "User Authentication"
         stories:
           - id: "ST001"
             title: "Email/Password Signup"
             tasks:
               - id: "T001"
                 title: "Design Signup API"
                 estimate_hours: 5
                 status: "pending"
                 dependencies: []
     ```

2. **Configuration Parameters**

   * PDDL search timeout (e.g., `60s`), maximum tasks per sprint (e.g., `10`), numeric fluents weightings (e.g., `costWeight`, `timeWeight`).
   * Defined under `plannerAgent` in `~/.nootropic/config.json`, for instance:

     ```jsonc
     {
       "plannerAgent": {
         "pddlSearchTimeout": 60,
         "maxTasksPerSprint": 10,
         "useTemporalConstraints": true,
       },
     }
     ```

3. **PDDL Domain & Problem Files**

   * The PlannerAgent composes a PDDL domain file (`domain.pddl`) containing action schemas, predicates, and type definitions.
   * Generates a PDDL problem file (`problem.pddl`) with initial state (all tasks unstarted) and goal conditions corresponding to "all tasks completed."
   * Example domain snippet:

     ```lisp
     (define (domain nootropic-project)
       (:requirements :strips :typing :fluents)
       (:types task)
       (:predicates (task-pending ?t - task) (task-completed ?t - task))
       (:functions (resource-available))
       (:action start-task
         :parameters (?t - task)
         :precondition (and (task-pending ?t) (> (resource-available) 0))
         :effect (and (not (task-pending ?t)) (task-completed ?t)
                      (decrease (resource-available) (task-duration ?t))))
       ...
     )
     ```

4. **Change Triggers / User Overrides**
   * When ProjectMgrAgent or the user edits `project-spec.md` (e.g., changes dependency graph), a "replan requested" event is emitted, containing impacted task IDs and context.
   * PlannerAgent listens to Temporal signals such as `SprintAdjustRequested(sprintID, adjustmentDetails)` to re‐execute planning tasks.

### 2.2 Outputs

1. **`TaskGraph` JSON**

   * A serialized representation of the DAG:

     ```json
     {
       "tasks": [
         {
           "id": "T001",
           "title": "Design Signup API",
           "estimate": 5,
           "dependencies": []
         },
         {
           "id": "T002",
           "title": "Implement Signup Endpoint",
           "estimate": 10,
           "dependencies": ["T001"]
         }
       ],
       "edges": [{ "from": "T001", "to": "T002", "type": "depends_on" }]
     }
     ```

2. **Updated `project-spec.md`**

   * Contains newly assigned sprint boundaries, updated status fields (e.g., `status: "ready"`), and any re‐estimated task durations.
   * Example diff:

     ```diff
     - status: "pending"
     + status: "ready"
     + sprint: "S001"
     ```

3. **PDDL Plan Output (Optional)**

   * Raw plan steps extracted from planner output (e.g.,

     ```lisp
     0: (start-task T001)
     5: (start-task T002)
     15: (complete T002)
     ```

   ) for debugging and logging.

4. **Temporal Signals**
   * `TaskGraphReady(taskGraphJSON)`: Indicates that the initial DAG is computed.
   * `DeltaReplanCompleted(updatedTaskIDs)`: Indicates that affected tasks have been re‐planned.
   * `ReplanFailed(errorDetails)`: If the PDDL solver fails or returns `unsolvable` due to cyclical constraints.

***

## 3. Data Structures

### 3.1 In‐Memory Types (TypeScript)

```ts
/** Status of a task in the planning stage */
type TaskStatus = "pending" | "ready" | "in-progress" | "blocked" | "done";

/** Representation of a single task node */
interface TaskNode {
  id: string;                    // e.g., "T001"
  title: string;                 // e.g., "Design Signup API"
  estimateHours: number;         // e.g., 5
  status: TaskStatus;
  dependencies: string[];        // IDs of tasks that must complete first
  assignedSprint?: string;       // e.g., "S001"
  priorityScore?: number;        // Computed by PlannerAgent
  metadata?: Record<string, any>; // Arbitrary additional info
}

/** Directed edge between two tasks */
interface TaskEdge {
  from: string;                  // e.g., "T001"
  to: string;                    // e.g., "T002"
  type: "depends_on" | "blocks" | "related_to";
}

/** Full TaskGraph JSON schema */
interface TaskGraph {
  tasks: TaskNode[];
  edges: TaskEdge[];
  generatedAt: string;          // ISO 8601 timestamp
}

/** PDDL domain template placeholders */
interface PDDLDomainTemplate {
  domainName: string;
  actionSchemas: string[];       // Raw PDDL strings
  predicateDefinitions: string[]; // e.g., "(task-pending ?t - task)"
  typeDefinitions: string[];      // e.g., "(task)"
  functionDefinitions?: string[]; // e.g., "(resource-available)"
}

/** PDDL problem specification */
interface PDDLProblemSpec {
  problemName: string;
  domainName: string;
  objects: Record<string, string[]>; // Map from type to list of objects
  initialState: string[];            // Ground atoms, e.g., "(task-pending T001)"
  goalState: string[];               // Atoms to achieve, e.g., "(task-completed T002)"
  numericFluents?: Record<string, number>; // e.g., {"resource-available": 80}
}

 • TaskNode encapsulates all relevant details for planning and sprint assignment.
 • TaskGraph is the JSON‐serializable output that other agents (e.g., ProjectMgrAgent, CoderAgent) can consume.
 • PDDL templates are built dynamically by filling in these structures into string templates, ensuring syntactic correctness.

⸻

4. Algorithms & Workflow

4.1 Initial Planning
 1. Parse project-spec.md
 • Read and parse the YAML/Markdown into an in‐memory ProjectSpec object.
 • Extract epics, stories, and tasks; build preliminary TaskNode[] with status="pending" and dependencies from the specification.
 2. Build PDDL Domain & Problem Files
 • Instantiate a PDDLDomainTemplate by mapping each task type to PDDL action schemas, using a library like mustache for templating.
 • For numeric fluents (e.g., leftover sprint hours), add (:functions (resource-available)) and :effect (decrease (resource-available) (task-duration ?t)) to each action.
 • Generate domain.pddl and problem.pddl strings and save to a temporary workspace.
 3. Invoke PDDL Solver
 • Call a PDDL solver (e.g., Fast Downward) via a child process:

./fast-downward.py --plan --alias seq-opt-bt-lama-2011 domain.pddl problem.pddl --search "lazy_greedy([ff()], preferred=[ff()])"

• Capture the solver's output plan, parse timestamps, and extract ordered action names corresponding to task IDs.

 4. Construct TaskGraph
 • Convert plan actions to TaskNode entries: for each action start-task T001, mark T001 as status="ready" and assign it to the earliest feasible sprint based on numeric fluents and dependencies.
 • Create TaskEdge[] from the PDDL "depends_on" relations or from explicit plan order for tasks that share resources.
 • Compute priorityScore using a heuristic (e.g., tasks with many dependents get higher scores).
 5. Output & Notification
 • Return TaskGraph JSON via Temporal activity response.
 • Write back any assignments (e.g., assignedSprint: "S001") into project-spec.md under each task node:

- id: "T001"
- status: "pending"
+ status: "ready"
+ assignedSprint: "S001"

• Emit signal TaskGraphReady(taskGraphJSON) for downstream agents.

4.2 Delta‐Replanning
 1. Change Detection
 • Listen for Temporal signals such as TaskBlocked(taskID, reason) or user edits to project-spec.md (detected via Git hook).
 • Identify the impacted task IDs; for each, collect all downstream dependent tasks via a graph traversal on the existing TaskGraph.
 2. Subgraph Extraction
 • Extract the sub‐DAG containing only impacted tasks and their dependencies.
 • Reconstruct a mini‐PDDL domain and problem for this subgraph, reusing the same action schemas but restricting objects to subgraph task IDs.
 3. Solve Subproblem
 • Invoke PDDL solver with the subproblem; set a shorter pddlSearchTimeout to optimize responsiveness (e.g., 30s).
 • Parse new plan and compare against old subgraph to compute a diff of assignments and orderings.
 4. Merge & Commit
 • Merge updated subgraph back into the full TaskGraph in memory, preserving unaffected tasks.
 • Update project-spec.md by editing only the relevant task entries: adjust status, assignedSprint, and estimateHours if changed.
 • Commit changes on a new Git branch replan/<timestamp> and, if configured, automatically open a pull request.
 5. Emit Replan Signal
 • Emit Temporal signal DeltaReplanCompleted(impactedTaskIDs) with details such as new estimates or sprint assignments.

⸻

5. Edge Cases & Failure Modes
 1. Cyclic Dependencies
 • If the initial or delta subgraph contains a cycle (e.g., tasks A → B → C → A), the PDDL solver will report unsolvable or fail.
 • PlannerAgent detects cycles by running a depth‐first search on the dependencies list before PDDL invocation. If a cycle is found, it emits ReplanFailed("Cyclic dependency detected: " + cycleList).
 2. Insufficient Resources
 • When numeric fluents (e.g., available sprint hours) cannot satisfy all tasks (total estimates > capacity), the PDDL problem becomes unsolvable.
 • PlannerAgent detects "no plan found" from the solver and triggers a backlog‐overflow protocol:
 1. Identify lowest‐priority tasks and remove them from the current sprint.
 2. Create a new sprint entry automatically (with default capacity) and assign overflow tasks there.
 3. Re‐invoke solver to generate a new valid plan.
 3. Ambiguous Task Specifications
 • If a task lacks required fields (e.g., missing estimate_hours or undefined dependencies), the parsing step flags a validation error.
 • PlannerAgent returns ReplanFailed("Missing field: estimate_hours for task T_xyz") to prompt the user for correction.
 4. Long‐Running PDDL Solves
 • Large projects (e.g., > 100 tasks with temporal constraints) may cause PDDL solves to exceed pddlSearchTimeout.
 • PlannerAgent gracefully terminates the solver process after timeout, logs a warning, and falls back to a heuristic greedy scheduler:
 1. Sort tasks by descending priorityScore.
 2. Assign to available sprints in order, respecting simple dependencies.
 3. Emit TaskGraphHeuristicFallback(taskIDs) signal indicating approximate plan.
 5. Configuration Drift
 • If the PDDL domain template or heuristic weights change between runs, previously valid plans may become obsolete.
 • PlannerAgent checks the Git diff of domain templates; if changes are detected, it triggers a full replan rather than a delta replan to ensure consistency.

⸻

6. Integration Points
 1. ModelAdapter
 • PlannerAgent may query ModelAdapter for LLM‐derived heuristics or estimated durations (e.g., average codegen latency for a given task type).
 • It sends a prompt like:

Estimate the development time for implementing a REST endpoint with JWT-based authentication in Node.js.

and uses the response to refine estimateHours before PDDL encoding.

 2. ProjectMgrAgent
 • Receives signals from PlannerAgent (TaskGraphReady, DeltaReplanCompleted) and updates sprint logic, SLO tracking, and Git commits accordingly.
 • When PlannerAgent emits ReplanFailed, ProjectMgrAgent escalates to stakeholders or UI to resolve blocking issues.
 3. ReflexionEngine
 • On solving failures or heuristic fallbacks, PlannerAgent emits ReflexionRequest(planValidation). ReflexionEngine can then spawn ReasoningAgent to analyze why the PDDL solve failed and propose domain or constraint adjustments.
 • It also listens to ReplanCompleted events to log planning traces for ExplainabilityAgent.
 4. Git Operations
 • Uses a lightweight Git library (e.g., simple‐git in Node.js) to commit updates to project-spec.md.
 • Tags commits with structured messages, such as:

feat(planner): assign T005 to Sprint S002 (estimate updated from 8h to 10h)
```

5. Temporal Workflows
   • Defines activities:
   • generateInitialPlan: orchestrates the steps in 4.1.
   • deltaReplan: handles steps in 4.2.
   • Workflows ensure retries in case of solver timeouts or Git conflicts, and propagate failures to upstream orchestrators.
6. ConfigurationService
   • Loads plannerAgent settings from ~/.nootropic/config.json on startup.
   • If remote configuration is enabled, can pull additional domain templates or heuristics from a central repository.

⸻

7. Configuration

All PlannerAgent settings reside under the plannerAgent key in ~/.nootropic/config.json:

{
"plannerAgent": {
// PDDL search timeout in seconds
"pddlSearchTimeout": 60,

```
// Maximum number of tasks allowed in a single sprint
"maxTasksPerSprint": 10,

// Toggle to enable numeric and temporal fluents in PDDL
"useTemporalConstraints": true,

// Heuristic weights used for priority scoring: throughput vs. complexity
"heuristicWeights": {
  "dependencyWeight": 0.5,
  "estimateWeight": 0.3,
  "riskWeight": 0.2
},

// Fallback strategy when PDDL solver fails: "heuristic" or "error"
"fallbackStrategy": "heuristic",

// Location of PDDL templates (mustache or handlebars files)
"pddlTemplateDir": "~/.nootropic/pddl-templates/",

// Number of iterations to run delta-replanning before giving up
"maxReplanAttempts": 3,

// Numeric fluent initial value (e.g., total sprint hours)
"initialFluentValues": {
  "resource-available": 80
}
```

}
}

• pddlSearchTimeout: Limits solver runtime to prevent blocking; must be ≥ 1.
• maxTasksPerSprint: When exceeded, PlannerAgent splits overflow tasks into new sprints.
• useTemporalConstraints: Enables PDDL 2.1+ features for modeling action durations and deadlines.
• heuristicWeights: Configurable weights for priority scoring to reflect business importance vs. effort.
• fallbackStrategy: Determines behavior when the solver fails (e.g., use greedy heuristic vs. abort).
• pddlTemplateDir: Directory containing mustache or handlebars templates for domain and problem files.
• initialFluentValues: Sets starting numeric values for functions like resource-available (total sprint hours).

⸻

8. Metrics & Instrumentation

PlannerAgent emits OpenTelemetry spans and metrics to enable observability and self‐healing:

1. Span: plannerAgent.generatePlan
   • Attributes:
   • numTasks (number of tasks included)
   • numDependencies (total edges)
   • solverTimeMs (time taken by PDDL solver)
   • planFound (boolean)
2. Span: plannerAgent.deltaReplan
   • Attributes:
   • impactedTasksCount (number of tasks being replanned)
   • solverTimeMs
   • success (boolean)
3. Counter: plannerAgent.planAttemptsTotal
   • Incremented each time a full plan or delta replan is invoked.
4. Gauge: plannerAgent.lastPlanDurationMs
   • Records the time for the most recent planning operation.
5. Counter: plannerAgent.fallbacksUsedTotal
   • Incremented when the fallback strategy (heuristic scheduler) is employed.
6. Gauge: plannerAgent.activeTasksCount
   • Number of tasks currently marked as "ready" in the TaskGraph memory.

These metrics feed into ReflexionEngine, which can automatically adjust planning parameters (e.g., increase pddlSearchTimeout) or alert stakeholders when the planning pipeline becomes a bottleneck.

⸻

9. Testing & Validation
10. Unit Tests
    • PDDL Generation: Given a small ProjectSpec with two tasks and one dependency, assert that domain.pddl and problem.pddl strings contain the correct predicates and initial/goal definitions.
    • Priority Scoring: Test computePriorityScore logic by providing synthetic TaskNode objects and verifying sorted order matches expected weights.
    • Cycle Detection: Supply a graph with a cycle (A → B → C → A) and verify that PlannerAgent detects the cycle and returns a ReplanFailed error.
11. Integration Tests
    • PDDL Solver Invocation:
12. Create a minimal PDDL domain and problem for a "two‐task" scenario.
13. Run generateInitialPlan and verify that the returned TaskGraph JSON matches the known sequence of tasks in the solver's solution.
    • Delta Replanning:
14. Start with three tasks in a chain: T1 → T2 → T3.
15. Mark T2 as blocked; run deltaReplan.
16. Confirm that PlannerAgent generates a new plan only for T2 and T3, leaving T1 unchanged.
17. End‐to‐End Workflow Tests
    • In a local Temporal environment:
18. Submit a high‐level project brief.
19. PlannerAgent generates the initial plan, ProjectMgrAgent assigns tasks to sprints, CoderAgent implements code, CriticAgent validates, and FeedbackAgent triggers a delta replan when a test fails.
20. Assert that PlannerAgent's deltaReplan results in new task assignments and that the updated plan flows downstream to CoderAgent.
21. Performance & Scalability Tests
    • Large Task Sets: Generate a synthetic ProjectSpec with 200 tasks and random dependencies. Measure generateInitialPlan latency; ensure it completes under pddlSearchTimeout.
    • Resource Constraint Stress: Set initialFluentValues.resource-available very low (e.g., 10 hours) for 50 tasks requiring 80 hours. Verify that PlannerAgent triggers the resource‐overflow protocol and properly splits tasks across multiple sprints.

⸻

10. Future Enhancements
11. HTN Planning Support
    • Extend PlannerAgent to support Hierarchical Task Network (HTN) planning natively, enabling the specification of abstract tasks that decompose into subtasks, reducing the need for manual operator templates.
    • Integrate a library like SHOP2 or PANDA to handle HTN domain definitions, allowing high‐level project intents to be authored more naturally.
12. PDDL 3 Preference Handling
    • Incorporate PDDL 3 features such as preferences and soft constraints, enabling PlannerAgent to optimize "nice‐to-have" goals (e.g., minimize cost, maximize parallelism).
13. Learning‐Enabled Heuristics
    • Leverage FeedbackAgent data to train a heuristic model that predicts task estimates or priority scores, refining the PDDL domain with learned heuristics for faster planning.
14. Graphical Planning UI
    • Develop a visual interface (Electron or VS Code Webview) that displays intermediate plan DAGs, allows users to drag‐and‐drop tasks, and triggers delta replans automatically on UI edits.
15. Multi‐Project & Multi‐Agent Planning
    • Scale PlannerAgent to handle multiple concurrent projects or multi‐team environments by introducing collaborative planning features, such as distributed PDDL solving or multi‐agent negotiation for shared resources.
16. Domain & Template Marketplace
    • Create a plugin marketplace for PDDL domain templates, allowing community‐contributed templates for common project types (e.g., microservices, data pipelines), fostering reuse and rapid onboarding.

⸻

11. Summary

The PlannerAgent translates high‐level project briefs into executable DAGs of tasks using robust AI planning techniques (PDDL/HTN), while dynamically adapting via delta replanning when project states shift. By generating PDDL domain and problem files, invoking external planners, and merging results back into project-spec.md, it ensures each task is scheduled optimally given resource and time constraints. With integration into Temporal workflows, Git, ModelAdapter, and ReflexionEngine, PlannerAgent maintains continuous alignment between project intent and actionable tasks, handling edge cases like cyclic dependencies and resource shortages gracefully. Its instrumentation via OpenTelemetry enables real‐time performance monitoring, and its modular design paves the way for future enhancements—such as HTN support, preference handling, and learning‐based heuristics—ensuring nootropic remains a lean, intelligent, and scalable project planning powerhouse.
