import * as vscode from "vscode";
import { Logger } from "@nootropic/shared";

/**
 * @todo Implement VS Code extension
 * - Register commands
 * - Set up status bar
 * - Configure settings
 * - Add telemetry
 */

const logger = new Logger();

export function activate(context: vscode.ExtensionContext) {
  logger.info("Nootropic extension is now active");

  // TODO: Register commands
  const disposable = vscode.commands.registerCommand(
    "nootropic.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello from Nootropic!");
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  logger.info("Nootropic extension is now deactivated");
}
