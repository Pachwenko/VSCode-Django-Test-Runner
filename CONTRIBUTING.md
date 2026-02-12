# Contributing to Django Test Runner

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- [Node.js 20+](https://nodejs.org/) (use `nvm use` to switch via the `.nvmrc`)
- [VS Code](https://code.visualstudio.com/)

### Getting started

```bash
git clone https://github.com/Pachwenko/VSCode-Django-Test-Runner.git
cd VSCode-Django-Test-Runner
npm install
```

### Running the extension locally

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Open a Django/Python project in the new VS Code window
4. Test the commands from the Command Palette (`Cmd+Shift+P`)

### Project structure

```
src/
  extension.ts      Entry point — activate/deactivate, command registration
  testRunner.ts     TestRunner class — orchestrates path building and test execution
  terminal.ts       Terminal management — get or create the test terminal
  config.ts         Configuration — reads VS Code settings, resolves Python path
  parsing.ts        Pure functions — regex parsing, path conversion, root stripping
  test/
    unit/           Unit tests (run without VS Code)
    suite/          Integration tests (require VS Code)
    runTest.ts      Integration test bootstrap
```

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile TypeScript to `out/` |
| `npm run package` | Bundle with esbuild for production (`dist/`) |
| `npm run watch` | Watch mode with TypeScript |
| `npm run watch:esbuild` | Watch mode with esbuild |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run VS Code integration tests |
| `npm run test` | Run unit tests (alias) |

### Running tests

Unit tests run directly with mocha and ts-node — no VS Code needed:

```bash
npm run test:unit
```

Integration tests require VS Code to be downloaded and launched:

```bash
npm run compile
npm run test:integration
```

### Building a VSIX

```bash
npm run package
npx @vscode/vsce package --no-dependencies
```

This produces a `.vsix` file you can install locally via `Extensions > Install from VSIX...`.

## Pull Request Process

1. Fork and create a feature branch
2. Make your changes
3. Ensure all checks pass: `npm run lint && npx tsc --noEmit && npm run test:unit && npm run package`
4. Update CHANGELOG.md if the change is user-facing
5. Submit a pull request

The CI pipeline will automatically run lint, type checking, tests, and build verification on your PR.
