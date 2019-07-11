import * as vscode from "vscode";

const METHOD_REGEX = /(\s*)def\s+(test_\w+)\s?\(/i;
const CLASS_REGEX = /(\s*)class\s+(\w+)/i;


let terminal: vscode.Terminal;

class TestRunner {
  methodName: string = "";
  className: string = "";
  filePath: string = "";
  lastRanTestPath: string = "";

  constructor() {
  }

  toString(): string {
    if (this.isDjangoNose()) {
      return this.filePath + ":" + this.className + "." + this.methodName;
    }
    return this.filePath + "." + this.className + "." + this.methodName;
  }

  getFullPath(): string {
    return this.toString();
  }

  getClassPath(): string {
    if (this.isDjangoNose()) {
      return this.filePath + ":" + this.className;
    }
    return this.filePath + "." + this.className;
  }

  getFilePath(): string {
    return this.filePath;
  }

  getAppPath(): string {
    return "";
  }

  updateFilePath(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const currentDocument = editor.document;
    const currentWorkspacePath = vscode.workspace.getWorkspaceFolder(
      currentDocument.uri
    );
    if (!currentWorkspacePath) {
      return;
    }
    this.filePath = currentDocument.fileName
      .replace(currentWorkspacePath.uri.fsPath, "")
      .replace(".py", "")
      .replace(/\//g, ".")
      .replace(/\\/g, ".")
      .replace(/\\\\/g, ".")
      .substring(1);
  }

  updateClassAndMethodPath(): void {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.document.languageId === "python") {
      const currentDocument = editor.document;
      const currentWorkspacePath = vscode.workspace.getWorkspaceFolder(
        currentDocument.uri
      );

      if (currentWorkspacePath) {
        const position = editor.selection.active;

        const lines = currentDocument
          .getText(new vscode.Range(0, 0, position.line + 1, 0))
          .split(/[\r\n]+/)
          .reverse();

        this.parseLines(lines);
      }
    }
  }

  parseLines(lines: string[]): void {
    let matched;
    let methodName: string = "";
    for (let line of lines) {
      if (line.trim()) {
        if (!methodName) {
          matched = line.match(METHOD_REGEX);
          if (matched) {
            methodName = matched[2];
            this.methodName = matched[2];
            continue;
          }
        }

        matched = line.match(CLASS_REGEX);
        if (matched) {
          this.className = matched[2];
          break;
        }
      }
    }
  }

  updatePaths(): void {
    this.updateClassAndMethodPath();
    this.updateFilePath();
  }

  isDjangoNose(): boolean {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return false; }
    const config = vscode.workspace.getConfiguration("python.djangoTestRunner.djangoNose");
    if (config) {
      return true;
    }
    return false;
  }

  runTests(testPath: string): void {
    this.lastRanTestPath = testPath;
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const configuration = vscode.workspace.getConfiguration(
        "",
        editor.document.uri
      );
      if (!terminal) {
        terminal = vscode.window.createTerminal("djangoTestRunner");
      }
      terminal.show();
      const cmds = [
        configuration.get("python.djangoTestRunner.prefixCommand"),
        configuration.get("python.pythonPath"),
        "./manage.py",
        "test",
        configuration.get("python.djangoTestRunner.flags"),
        testPath
      ];
      terminal.sendText(cmds.join(" "));
    }
  }

  runPreviousTests(): void {
    if (!this.lastRanTestPath) {
      vscode.window.showErrorMessage("No previous tests!");
      return;
    }
    this.runTests(this.lastRanTestPath);
  }

  runMethodTests(): void {
    this.updatePaths();
    this.runTests(this.getFullPath());
  }

  runClassTests(): void {
    this.updatePaths();
    this.runTests(this.getClassPath());
  }

  runFileTests(): void {
    this.updatePaths();
    this.runTests(this.getFilePath());
  }

  runAppTests(): void {
    this.updatePaths();
    this.runTests(this.getAppPath());
  }
}

let tester: TestRunner = new TestRunner();

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.djangoTestRunner.runPreviousTests",
      () => {
        tester.runPreviousTests();
      }
    ),
    vscode.commands.registerCommand(
      "extension.djangoTestRunner.runMethodTests",
      () => {
        tester.runMethodTests();
      }
    ),
    vscode.commands.registerCommand(
      "extension.djangoTestRunner.runClassTests",
      () => {
        tester.runClassTests();
      }
    ),
    vscode.commands.registerCommand(
      "extension.djangoTestRunner.runFileTests",
      () => {
        tester.runFileTests();
      }
    ),
    vscode.commands.registerCommand("extension.djangoTestRunner.runAppTests", () => {
      tester.runAppTests();
    })
  );
}

export function deactivate() { }
