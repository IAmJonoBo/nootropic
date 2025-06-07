var FeedbackServiceImpl_1;
var _a, _b, _c, _d;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
import { MemoryService } from "@nootropic/agents/memory-agent";
let FeedbackServiceImpl = (FeedbackServiceImpl_1 = class FeedbackServiceImpl {
  constructor(modelAdapter, storageAdapter, projectContext, memoryService) {
    this.modelAdapter = modelAdapter;
    this.storageAdapter = storageAdapter;
    this.projectContext = projectContext;
    this.memoryService = memoryService;
    this.logger = new Logger(FeedbackServiceImpl_1.name);
  }
  async collectFeedback(feedback) {
    // TODO: Implement feedback collection logic
    throw new Error("Method not implemented.");
  }
  async scheduleTraining(data) {
    // TODO: Implement training scheduling logic
    throw new Error("Method not implemented.");
  }
  async updatePreferences(prefs) {
    // TODO: Implement preferences update logic
    throw new Error("Method not implemented.");
  }
  async analyzeFeedback(params) {
    try {
      this.logger.info("Analyzing feedback", { params });
      // Retrieve relevant feedback
      const feedback = await this.retrieveFeedback(params);
      // Generate analysis using model
      const prompt = this.buildAnalysisPrompt(feedback);
      const response = await this.modelAdapter.generateText(prompt, {
        provider: "ollama",
        model: "mistral",
        temperature: 0.3,
      });
      // Parse analysis results
      const analysis = this.parseAnalysisResponse(response.text);
      // Store analysis as memory
      await this.memoryService.storeMemory({
        type: "knowledge",
        content: JSON.stringify(analysis),
        metadata: {
          timestamp: Date.now(),
          source: "feedback_analysis",
          importance: 0.8,
          tags: ["feedback", "analysis", "improvement"],
        },
      });
      return analysis;
    } catch (error) {
      throw new AgentError("Failed to analyze feedback", { cause: error });
    }
  }
  async retrieveFeedback(params) {
    try {
      const query = this.buildFeedbackQuery(params);
      const results = await this.storageAdapter.searchDocuments(query, {
        limit: 100,
        filter: {
          type: "feedback",
          ...(params.type && { feedbackType: params.type }),
          ...(params.timeRange && {
            timestamp: {
              $gte: params.timeRange.start,
              $lte: params.timeRange.end,
            },
          }),
          ...(params.minSeverity && { severity: { $gte: params.minSeverity } }),
        },
      });
      return results.map((doc) => ({
        id: doc.id,
        type: doc.metadata.feedbackType,
        content: doc.content,
        metadata: {
          timestamp: doc.metadata.timestamp,
          source: doc.metadata.source,
          context: doc.metadata.context,
          severity: doc.metadata.severity,
          tags: doc.metadata.tags,
          relatedItems: doc.metadata.relatedItems,
        },
      }));
    } catch (error) {
      throw new AgentError("Failed to retrieve feedback", { cause: error });
    }
  }
  buildFeedbackQuery(params) {
    const queryParts = [];
    if (params.type) {
      queryParts.push(`type:${params.type}`);
    }
    if (params.timeRange) {
      queryParts.push(
        `timestamp:>=${params.timeRange.start} timestamp:<=${params.timeRange.end}`,
      );
    }
    if (params.minSeverity) {
      queryParts.push(`severity:>=${params.minSeverity}`);
    }
    return queryParts.join(" ");
  }
  buildAnalysisPrompt(feedback) {
    return `
      Analyze the following feedback:
      
      ${feedback
        .map(
          (f) => `
        Type: ${f.type}
        Content: ${f.content}
        Severity: ${f.metadata.severity}
        Tags: ${f.metadata.tags.join(", ")}
        Context: ${JSON.stringify(f.metadata.context)}
      `,
        )
        .join("\n")}
      
      Please provide:
      1. A summary of the feedback
      2. Key insights
      3. Specific recommendations
      4. Action items with priorities
      
      Format the response as:
      SUMMARY:
      // Summary here
      
      INSIGHTS:
      // List of insights
      
      RECOMMENDATIONS:
      // List of recommendations
      
      ACTION_ITEMS:
      // List of action items in format:
      // - description: action description
      //   priority: 1-5
      //   assignedTo: optional assignee
    `;
  }
  parseAnalysisResponse(response) {
    try {
      const summaryMatch = response.match(
        /SUMMARY:\s*([\s\S]*?)(?=INSIGHTS:|RECOMMENDATIONS:|ACTION_ITEMS:|$)/,
      );
      const insightsMatch = response.match(
        /INSIGHTS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|ACTION_ITEMS:|$)/,
      );
      const recommendationsMatch = response.match(
        /RECOMMENDATIONS:\s*([\s\S]*?)(?=ACTION_ITEMS:|$)/,
      );
      const actionItemsMatch = response.match(/ACTION_ITEMS:\s*([\s\S]*?)$/);
      const summary = summaryMatch ? summaryMatch[1].trim() : "";
      const insights = insightsMatch
        ? insightsMatch[1].trim().split("\n").filter(Boolean)
        : [];
      const recommendations = recommendationsMatch
        ? recommendationsMatch[1].trim().split("\n").filter(Boolean)
        : [];
      const actionItems = actionItemsMatch
        ? actionItemsMatch[1]
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((item) => {
              const descriptionMatch = item.match(/description:\s*([^\n]+)/);
              const priorityMatch = item.match(/priority:\s*(\d+)/);
              const assignedToMatch = item.match(/assignedTo:\s*([^\n]+)/);
              return {
                description: descriptionMatch
                  ? descriptionMatch[1].trim()
                  : item.trim(),
                priority: priorityMatch ? parseInt(priorityMatch[1]) : 3,
                assignedTo: assignedToMatch
                  ? assignedToMatch[1].trim()
                  : undefined,
              };
            })
        : [];
      return {
        summary,
        insights,
        recommendations,
        actionItems,
      };
    } catch (error) {
      throw new AgentError("Failed to parse analysis response", {
        cause: error,
      });
    }
  }
});
FeedbackServiceImpl = FeedbackServiceImpl_1 = __decorate(
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
      typeof (_d = typeof MemoryService !== "undefined" && MemoryService) ===
      "function"
        ? _d
        : Object,
    ]),
  ],
  FeedbackServiceImpl,
);
export { FeedbackServiceImpl };
//# sourceMappingURL=feedback.service.js.map
