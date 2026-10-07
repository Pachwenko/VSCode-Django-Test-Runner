import * as vscode from 'vscode';
import { getOrCreateTerminal } from './terminal.js';
import { getConfig, getPythonPath } from './config.js';
import { parseLines, filePathToDottedPath, stripRootPackage, getAppPathFromTestPath, buildFullTestPath, buildClassTestPath, buildCommand } from './parsing.js';

export class TestRunner {
    methodName: string = '';
    className: string = '';
    filePath: string = '';
    lastRanTestPath: string = '';

    getFullPath(): string {
        const djangoNose = this.getActiveConfig()?.djangoNose ?? false;
        return buildFullTestPath(this.filePath, this.className, this.methodName, djangoNose);
    }

    getClassPath(): string {
        const djangoNose = this.getActiveConfig()?.djangoNose ?? false;
        return buildClassTestPath(this.filePath, this.className, djangoNose);
    }

    getFilePath(): string {
        return this.filePath;
    }

    getAppPath(): string {
        return getAppPathFromTestPath(this.filePath);
    }

    updateFilePath(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const currentDocument = editor.document;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentDocument.uri);
        if (!workspaceFolder) {
            return;
        }

        const relativePath = currentDocument.fileName.replace(workspaceFolder.uri.fsPath, '');
        this.filePath = filePathToDottedPath(relativePath);

        const config = getConfig(currentDocument.uri);
        this.filePath = stripRootPackage(
            this.filePath,
            config.stripRootFolder,
            config.rootPackageName
        );
    }

    updateClassAndMethodPath(): void {
        this.methodName = '';
        this.className = '';

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return;
        }

        const currentDocument = editor.document;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentDocument.uri);
        if (!workspaceFolder) {
            return;
        }

        const position = editor.selection.active;
        const lines = currentDocument
            .getText(new vscode.Range(0, 0, position.line + 1, 0))
            .split(/[\r\n]+/)
            .reverse();

        const result = parseLines(lines);
        this.methodName = result.methodName;
        this.className = result.className;
    }

    updatePaths(): void {
        this.updateClassAndMethodPath();
        this.updateFilePath();
    }

    async runTests(testPath: string): Promise<void> {
        this.lastRanTestPath = testPath;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const config = getConfig(editor.document.uri);
        const pythonPath = await getPythonPath(editor.document.uri);
        const terminal = getOrCreateTerminal();
        terminal.show();

        const command = buildCommand(
            config.prefixCommand,
            pythonPath,
            config.manageProgram,
            testPath,
            config.flags,
        );
        terminal.sendText(command);
    }

    runPreviousTests(): void {
        if (!this.lastRanTestPath) {
            vscode.window.showErrorMessage('No previous tests!');
            return;
        }
        this.runTests(this.lastRanTestPath);
    }

    runMethodTests(): void {
        this.updatePaths();
        if (!this.filePath || !this.className || !this.methodName) {
            vscode.window.showErrorMessage('Place the cursor inside a Django test method before running it.');
            return;
        }
        this.runTests(this.getFullPath());
    }

    runClassTests(): void {
        this.updatePaths();
        if (!this.filePath || !this.className) {
            vscode.window.showErrorMessage('Place the cursor inside a Django test class before running it.');
            return;
        }
        this.runTests(this.getClassPath());
    }

    runFileTests(): void {
        this.updatePaths();
        if (!this.filePath) {
            vscode.window.showErrorMessage('Open a Python test file inside the workspace before running it.');
            return;
        }
        this.runTests(this.getFilePath());
    }

    runAppTests(): void {
        this.updatePaths();
        const appPath = this.getAppPath();
        if (!appPath) {
            vscode.window.showErrorMessage('Could not determine the Django app from this test file.');
            return;
        }
        this.runTests(appPath);
    }

    private getActiveConfig(): { djangoNose: boolean } | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        const config = getConfig(editor.document.uri);
        return { djangoNose: config.djangoNose };
    }
}
