var ExecutorService_1;
var _a, _b, _c, _d, _e, _f, _g;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
import { PlannerService } from "@nootropic/agents/planner-agent";
import { CoderService } from "@nootropic/agents/coder-agent";
import { CriticService } from "@nootropic/agents/critic-agent";
import { ReasoningService } from "@nootropic/agents/reasoning-agent";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
let ExecutorService = (ExecutorService_1 = class ExecutorService {
  constructor(
    plannerService,
    coderService,
    criticService,
    reasoningService,
    modelAdapter,
    storageAdapter,
    projectContext,
  ) {
    this.plannerService = plannerService;
    this.coderService = coderService;
    this.criticService = criticService;
    this.reasoningService = reasoningService;
    this.modelAdapter = modelAdapter;
    this.storageAdapter = storageAdapter;
    this.projectContext = projectContext;
    this.logger = new Logger(ExecutorService_1.name);
  }
  async executePlan(planId) {
    try {
      this.logger.info("Executing plan", { planId });
      // Get plan
      const plan = await this.plannerService.getPlan(planId);
      if (!plan) {
        throw new AgentError("Plan not found", { planId });
      }
      // Execute steps
      const results = await this.executeSteps(plan.steps);
      // Generate summary
      const summary = await this.generateSummary(plan, results);
      return {
        success: results.every((step) => step.status === "completed"),
        steps: results,
        summary,
      };
    } catch (error) {
      throw new AgentError("Failed to execute plan", { cause: error });
    }
  }
  async executeSteps(steps) {
    const results = [];
    for (const step of steps) {
      try {
        this.logger.info("Executing step", { stepId: step.id });
        // Check dependencies
        const dependencies = step.dependencies || [];
        const dependencyResults = results.filter((r) =>
          dependencies.includes(r.id),
        );
        if (dependencyResults.some((r) => r.status === "failed")) {
          results.push({
            id: step.id,
            status: "skipped",
            error: "Dependencies failed",
          });
          continue;
        }
        // Execute step based on agent type
        let result;
        switch (step.agent) {
          case "coder":
            result = await this.coderService.generateCode({
              description: step.description,
              language: "typescript",
            });
            break;
          case "critic":
            result = await this.criticService.reviewCode({
              code: step.code,
              language: "typescript",
            });
            break;
          case "reasoning":
            result = await this.reasoningService.reason({
              question: step.description,
            });
            break;
          default:
            throw new Error(`Unknown agent type: ${step.agent}`);
        }
        results.push({
          id: step.id,
          status: "completed",
          result,
        });
      } catch (error) {
        this.logger.error("Step execution failed", { stepId: step.id, error });
        results.push({
          id: step.id,
          status: "failed",
          error: error.message,
        });
      }
    }
    return results;
  }
  async generateSummary(plan, results) {
    try {
      const prompt = `
        Generate a summary of the plan execution:
        
        Plan:
        ${JSON.stringify(plan, null, 2)}
        
        Results:
        ${JSON.stringify(results, null, 2)}
        
        Please provide a concise summary of what was accomplished and any issues encountered.
      `;
      const response = await this.modelAdapter.generateText(prompt, {
        provider: "ollama",
        model: "mistral",
        temperature: 0.3,
      });
      return response.text;
    } catch (error) {
      this.logger.error("Failed to generate summary", { error });
      return "Failed to generate execution summary";
    }
  }
});
ExecutorService = ExecutorService_1 = __decorate(
  [
    Injectable(),
    __metadata("design:paramtypes", [
      typeof (_a = typeof PlannerService !== "undefined" && PlannerService) ===
      "function"
        ? _a
        : Object,
      typeof (_b = typeof CoderService !== "undefined" && CoderService) ===
      "function"
        ? _b
        : Object,
      typeof (_c = typeof CriticService !== "undefined" && CriticService) ===
      "function"
        ? _c
        : Object,
      typeof (_d =
        typeof ReasoningService !== "undefined" && ReasoningService) ===
      "function"
        ? _d
        : Object,
      typeof (_e = typeof ModelAdapter !== "undefined" && ModelAdapter) ===
      "function"
        ? _e
        : Object,
      typeof (_f = typeof StorageAdapter !== "undefined" && StorageAdapter) ===
      "function"
        ? _f
        : Object,
      typeof (_g =
        typeof ProjectContextService !== "undefined" &&
        ProjectContextService) === "function"
        ? _g
        : Object,
    ]),
  ],
  ExecutorService,
);
export { ExecutorService };
//# sourceMappingURL=executor.service.js.map
