import * as vscode from 'vscode';
import { TestRunner } from './testRunner.js';

export function activate(context: vscode.ExtensionContext): void {
    const tester = new TestRunner();

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'python.djangoTestRunner.runPreviousTests',
            () => tester.runPreviousTests()
        ),
        vscode.commands.registerCommand(
            'python.djangoTestRunner.runMethodTests',
            () => tester.runMethodTests()
        ),
        vscode.commands.registerCommand(
            'python.djangoTestRunner.runClassTests',
            () => tester.runClassTests()
        ),
        vscode.commands.registerCommand(
            'python.djangoTestRunner.runFileTests',
            () => tester.runFileTests()
        ),
        vscode.commands.registerCommand(
            'python.djangoTestRunner.runAppTests',
            () => tester.runAppTests()
        ),
    );
}

export function deactivate(): void { }
