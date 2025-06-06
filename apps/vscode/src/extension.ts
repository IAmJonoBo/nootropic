import * as vscode from 'vscode';
import { Logger } from '@nootropic/runtime';

/**
 * @todo Implement VS Code extension
 * - Register commands and features
 * - Set up status bar items
 * - Initialize core services
 * - Configure telemetry
 * - Handle extension activation/deactivation
 */

const logger = new Logger('vscode-extension');

export function activate(context: vscode.ExtensionContext) {
  logger.info('Activating Nootropic VS Code extension');

  // TODO: Register commands
  // TODO: Initialize services
  // TODO: Set up status bar
  // TODO: Configure telemetry
}

export function deactivate() {
  logger.info('Deactivating Nootropic VS Code extension');
  // TODO: Clean up resources
}
