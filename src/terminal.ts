import * as vscode from 'vscode';

const TERM_NAME = 'Django Test Runner';

/**
 * Get an existing "Django Test Runner" terminal or create a new one.
 *
 * Always searches existing terminals by name first, which handles
 * VS Code restoring terminals on startup (fixes Issue #21).
 * No terminal reference is cached — this prevents stale references.
 */
export function getOrCreateTerminal(): vscode.Terminal {
    const existing = vscode.window.terminals.find(t => t.name === TERM_NAME);
    if (existing) {
        return existing;
    }
    return vscode.window.createTerminal(TERM_NAME);
}
