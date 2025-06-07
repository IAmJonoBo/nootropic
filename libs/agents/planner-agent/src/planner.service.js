var _a, _b, _c;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
import { ProjectContextService } from "@nootropic/context";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
/**
 * @todo Implement planner agent service
 * - Add task graph planning
 * - Implement critical path analysis
 * - Add resource optimization
 * - Add cost-aware scheduling
 */
let PlannerServiceImpl = class PlannerServiceImpl {
  constructor(modelAdapter, storageAdapter, projectContext) {
    this.modelAdapter = modelAdapter;
    this.storageAdapter = storageAdapter;
    this.projectContext = projectContext;
    this.logger = new Logger("planner-agent");
  }
  async initialize() {
    // TODO: Initialize task graph service
    // TODO: Set up critical path analysis
    // TODO: Configure resource constraints
  }
  async execute(input) {
    // TODO: Implement task planning
    // TODO: Generate execution plan
    // TODO: Optimize resource allocation
    return {};
  }
  async cleanup() {
    // TODO: Clean up resources
    // TODO: Save execution history
  }
  async createPlan(goal) {
    try {
      this.logger.info("Creating plan for goal", { goal });
      // Get project context
      const context = await this.projectContext.getContext();
      // Generate plan using model
      const plan = await this.modelAdapter.generatePlan({
        goal,
        context: context.config,
        constraints: context.config.constraints,
      });
      // Store plan in vector store
      await this.storageAdapter.storePlan(plan);
      return plan;
    } catch (error) {
      throw new AgentError("Failed to create plan", { cause: error });
    }
  }
  async updatePlan(planId, updates) {
    try {
      this.logger.info("Updating plan", { planId, updates });
      // Get existing plan
      const existingPlan = await this.storageAdapter.getPlan(planId);
      if (!existingPlan) {
        throw new AgentError("Plan not found", { planId });
      }
      // Update plan
      const updatedPlan = {
        ...existingPlan,
        ...updates,
      };
      // Store updated plan
      await this.storageAdapter.storePlan(updatedPlan);
      return updatedPlan;
    } catch (error) {
      throw new AgentError("Failed to update plan", { cause: error });
    }
  }
  async getPlan(planId) {
    try {
      this.logger.info("Getting plan", { planId });
      const plan = await this.storageAdapter.getPlan(planId);
      if (!plan) {
        throw new AgentError("Plan not found", { planId });
      }
      return plan;
    } catch (error) {
      throw new AgentError("Failed to get plan", { cause: error });
    }
  }
  async generatePlan(spec) {
    // TODO: Implement plan generation logic
    throw new Error("Method not implemented.");
  }
  async replanSubtree(taskId, context) {
    // TODO: Implement subtree replanning logic
    throw new Error("Method not implemented.");
  }
  async validatePlan(graph) {
    // TODO: Implement plan validation logic
    throw new Error("Method not implemented.");
  }
};
PlannerServiceImpl = __decorate(
  [
    Injectable(),
    __metadata("design:paramtypes", [
      typeof (_a = typeof ModelAdapter !== "undefined" && ModelAdapter) ===
      "function"
        ? _a
        : Object,
      typeof (_b = typeof StorageAdapter !== "undefined" && StorageAdapter) ===
      "function"
        ? _b
        : Object,
      typeof (_c =
        typeof ProjectContextService !== "undefined" &&
        ProjectContextService) === "function"
        ? _c
        : Object,
    ]),
  ],
  PlannerServiceImpl,
);
export { PlannerServiceImpl };
//# sourceMappingURL=planner.service.js.map
