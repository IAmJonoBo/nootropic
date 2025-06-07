import { describe, it, expect } from 'vitest';
import * as vscode from 'vscode';

describe('Extension', () => {
	it('should be activated', async () => {
		// The extension should be activated when the test runs
		const extension = await vscode.extensions.getExtension('nootropic.extension');
		expect(extension).toBeDefined();
		expect(extension?.isActive).toBe(true);
	});

	it('should register commands', async () => {
		// Get all registered commands
		const commands = await vscode.commands.getCommands();
		
		// Check for our extension's commands
		expect(commands).toContain('nootropic.plan');
		expect(commands).toContain('nootropic.code');
		expect(commands).toContain('nootropic.search');
		expect(commands).toContain('nootropic.explain');
	});
});
