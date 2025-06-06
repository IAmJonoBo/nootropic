# Tutorial: Working with VS Code Extension

## Overview

This tutorial covers how to effectively use the nootropic VS Code extension for development, including features like AI-assisted coding, code generation, and debugging.

## Installation

1. **Install from VSIX**

   ```bash
   cd apps/nootropic-vscode-ext
   npm run build
   code --install-extension nootropic-vscode-ext-0.1.0.vsix
   ```

2. **Development Mode**

   ```bash
   cd apps/nootropic-vscode-ext
   npm install
   npm run watch
   code --extensionDevelopmentPath="${PWD}"
   ```

## Features

### 1. AI Chat Panel

1. **Accessing the Chat**

   - Press `Cmd/Ctrl + Shift + P`
   - Type "nootropic: Open Chat"
   - Or click the nootropic icon in the activity bar

2. **Using Slash Commands**

   ```
   /explain - Explain selected code
   /refactor - Suggest refactoring
   /test - Generate tests
   /doc - Generate documentation
   /fix - Fix linting issues
   ```

3. **Context-Aware Assistance**
   - The extension automatically includes relevant code context
   - Use `@file` to reference specific files
   - Use `@symbol` to reference specific functions/classes

### 2. Code Generation

1. **Generate New Files**

   ```
   /new component MyComponent
   /new test MyComponent.test
   /new api endpoint /users
   ```

2. **Code Completion**

   - Type `//` to trigger AI completion
   - Use `Tab` to accept suggestions
   - Press `Esc` to dismiss

3. **Refactoring**

   ```
   /refactor extract-function
   /refactor inline
   /refactor move-to-file
   ```

### 3. Debugging Integration

1. **AI-Assisted Debugging**

   - Set breakpoints as usual
   - Use `/debug` to analyze the current state
   - Get suggestions for fixing issues

2. **Performance Analysis**

   ```
   /profile function-name
   /optimize selected-code
   ```

3. **Error Analysis**
   - Click on error messages to get AI explanations
   - Use `/fix-error` to get suggested fixes

### 4. Project Management

1. **Task Management**

   ```
   /task create "Implement user authentication"
   /task list
   /task update status
   ```

2. **Documentation**

   ```
   /doc generate
   /doc update
   /doc review
   ```

## Best Practices

1. **Effective Prompts**

   - Be specific about your requirements
   - Include relevant context
   - Use appropriate slash commands

2. **Code Review**

   - Use `/review` for AI-assisted code review
   - Get suggestions for improvements
   - Check for potential issues

3. **Learning from AI**
   - Review generated code
   - Understand the reasoning
   - Apply patterns to future work

## Troubleshooting

1. **Extension Issues**

   - Check the output panel for errors
   - Verify connection to local services
   - Restart VS Code if needed

2. **Performance**

   - Monitor memory usage
   - Clear extension cache if needed
   - Check local LLM server status

3. **Common Problems**
   - Connection issues: Check Tabby ML server
   - Slow responses: Check model size and hardware
   - Context issues: Ensure file is saved

## What's Next

- [Tutorial: Using CLI Tools](tutorial_cli.md)
- [Tutorial: Configuring LLM Backends](tutorial_llm_backends.md)
- [Tutorial: Implementing Custom Agents](tutorial_custom_agents.md)

## Additional Resources

- [VS Code Extension API](../API_REFERENCE.md#vs-code-extension)
- [Architecture Documentation](../ARCHITECTURE.md)
- [CLI Reference](../CLI_REFERENCE.md)
