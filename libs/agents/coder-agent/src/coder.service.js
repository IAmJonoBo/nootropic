var CoderServiceImpl_1;
var _a, _b, _c;
import { __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nootropic/runtime";
import { AgentError } from "@nootropic/runtime";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
let CoderServiceImpl = (CoderServiceImpl_1 = class CoderServiceImpl {
  constructor(modelAdapter, storageAdapter, projectContext) {
    this.modelAdapter = modelAdapter;
    this.storageAdapter = storageAdapter;
    this.projectContext = projectContext;
    this.logger = new Logger(CoderServiceImpl_1.name);
  }
  async generateCode(task, context) {
    // TODO: Implement code generation logic
    throw new Error("Method not implemented.");
  }
  async refactorCode(file, instructions) {
    // TODO: Implement code refactoring logic
    throw new Error("Method not implemented.");
  }
  async generateTests(file, coverage) {
    // TODO: Implement test generation logic
    throw new Error("Method not implemented.");
  }
  async generateCodeFromDescription(params) {
    try {
      this.logger.info("Generating code", { params });
      // Get project context
      const context = await this.projectContext.getContext();
      // Generate code using model
      const prompt = this.buildCodeGenerationPrompt({
        ...params,
        projectContext: context,
      });
      const response = await this.modelAdapter.generateText(prompt, {
        provider: "ollama",
        model: "codellama",
        temperature: 0.2,
      });
      // Parse and validate generated code
      const result = this.parseCodeGenerationResponse(response.text);
      // Store generated code
      await this.storageAdapter.storeDocument({
        id: `code_${Date.now()}`,
        content: result.code,
        metadata: {
          type: "generated_code",
          ...result.metadata,
        },
      });
      return result;
    } catch (error) {
      throw new AgentError("Failed to generate code", { cause: error });
    }
  }
  buildCodeGenerationPrompt(params) {
    return `
      Generate code for the following task:
      
      Description: ${params.description}
      Language: ${params.language}
      ${params.framework ? `Framework: ${params.framework}` : ""}
      
      ${params.context ? `Context:\n${params.context}` : ""}
      
      Project Context:
      ${JSON.stringify(params.projectContext, null, 2)}
      
      Please provide:
      1. The complete code implementation
      2. A brief explanation of the implementation
      3. Unit tests if applicable
      4. Any required dependencies
      
      Format the response as:
      CODE:
      \`\`\`${params.language}
      // Implementation here
      \`\`\`
      
      EXPLANATION:
      // Explanation here
      
      TESTS:
      \`\`\`${params.language}
      // Tests here
      \`\`\`
      
      DEPENDENCIES:
      // List of dependencies
    `;
  }
  parseCodeGenerationResponse(response) {
    try {
      const codeMatch = response.match(/CODE:\s*```[\s\S]*?```/);
      const explanationMatch = response.match(
        /EXPLANATION:\s*([\s\S]*?)(?=TESTS:|DEPENDENCIES:|$)/,
      );
      const testsMatch = response.match(/TESTS:\s*```[\s\S]*?```/);
      const dependenciesMatch = response.match(/DEPENDENCIES:\s*([\s\S]*?)$/);
      if (!codeMatch) {
        throw new Error("No code found in response");
      }
      const code = codeMatch[0]
        .replace(/CODE:\s*```\w*\n/, "")
        .replace(/```$/, "");
      const explanation = explanationMatch ? explanationMatch[1].trim() : "";
      const tests = testsMatch
        ? testsMatch[0].replace(/TESTS:\s*```\w*\n/, "").replace(/```$/, "")
        : undefined;
      const dependencies = dependenciesMatch
        ? dependenciesMatch[1].trim().split("\n")
        : [];
      return {
        code,
        explanation,
        tests,
        metadata: {
          language: "typescript", // Default to TypeScript
          dependencies,
        },
      };
    } catch (error) {
      throw new AgentError("Failed to parse code generation response", {
        cause: error,
      });
    }
  }
});
CoderServiceImpl = CoderServiceImpl_1 = __decorate(
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
  CoderServiceImpl,
);
export { CoderServiceImpl };
//# sourceMappingURL=coder.service.js.map
