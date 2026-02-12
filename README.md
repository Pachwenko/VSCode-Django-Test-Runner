# Django Test Runner

[![CI](https://github.com/Pachwenko/VSCode-Django-Test-Runner/actions/workflows/ci.yml/badge.svg)](https://github.com/Pachwenko/VSCode-Django-Test-Runner/actions/workflows/ci.yml)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/Pachwenko.django-test-runner)](https://marketplace.visualstudio.com/items?itemName=Pachwenko.django-test-runner)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Pachwenko.django-test-runner)](https://marketplace.visualstudio.com/items?itemName=Pachwenko.django-test-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A VS Code extension that resolves the Python test path from your cursor position and runs it with a configurable command. Built for Django but works with **any Python test runner** — pytest, unittest, nose2, tox, and more.

Works in VS Code, Cursor, Windsurf, and VSCodium.

## Features

- **Run Closest Method Test** — runs the test method nearest to your cursor
- **Run Closest Class Tests** — runs all tests in the class nearest to your cursor
- **Run Current File Tests** — runs all tests in the current file
- **Run Current App Tests** — runs all tests in the current app
- **Run Previous Tests** — re-runs the last test command
- **Smart Parsing** — indentation-aware class/method detection that correctly handles nested classes and strings containing "class"
- **Terminal Reuse** — reuses a single "Django Test Runner" terminal instead of creating new ones
- **Fully Configurable** — works with any project structure and test runner

## Commands

| Command | Command ID |
|---------|-----------|
| Run Closest Method Test | `python.djangoTestRunner.runMethodTests` |
| Run Closest Class Tests | `python.djangoTestRunner.runClassTests` |
| Run Current File Tests | `python.djangoTestRunner.runFileTests` |
| Run Current App Tests | `python.djangoTestRunner.runAppTests` |
| Run Previous Tests | `python.djangoTestRunner.runPreviousTests` |

All commands are available from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `python.djangoTestRunner.manageProgram` | string | `"manage.py test"` | The test command to run. Can be any command that accepts a test path. |
| `python.djangoTestRunner.prefixCommand` | string | `""` | Prefix before the test command (env vars, cd, docker, etc.) |
| `python.djangoTestRunner.flags` | string | `""` | Flags appended after the test path |
| `python.djangoTestRunner.useVSCodePythonPath` | boolean | `true` | Use the Python interpreter from the Python extension |
| `python.djangoTestRunner.stripRootFolder` | boolean | `false` | Strip the first folder from the test path |
| `python.djangoTestRunner.rootPackageName` | string | `""` | Root package name to strip from test paths |
| `python.djangoTestRunner.djangoNose` | boolean | `false` | Use colon separator for django-nose syntax |

The test command is assembled as:

```
[prefixCommand] [pythonPath] [manageProgram] [testPath] [flags]
```

## Setting Up Keybindings

This extension does not ship with default keybindings to avoid conflicting with VS Code's built-in shortcuts (e.g., `Cmd+D` for multi-cursor selection).

To add your own, open your `keybindings.json` (`Cmd+Shift+P` > "Open Keyboard Shortcuts (JSON)") and add:

```json
[
    {
        "key": "ctrl+t ctrl+m",
        "command": "python.djangoTestRunner.runMethodTests"
    },
    {
        "key": "ctrl+t ctrl+c",
        "command": "python.djangoTestRunner.runClassTests"
    },
    {
        "key": "ctrl+t ctrl+f",
        "command": "python.djangoTestRunner.runFileTests"
    },
    {
        "key": "ctrl+t ctrl+a",
        "command": "python.djangoTestRunner.runAppTests"
    },
    {
        "key": "ctrl+t ctrl+p",
        "command": "python.djangoTestRunner.runPreviousTests"
    }
]
```

### VSCode-Vim Keybindings

Add these to your `settings.json`:

```json
"vim.normalModeKeyBindingsNonRecursive": [
    {
        "before": ["leader", "t", "m"],
        "commands": ["python.djangoTestRunner.runMethodTests"]
    },
    {
        "before": ["leader", "t", "c"],
        "commands": ["python.djangoTestRunner.runClassTests"]
    },
    {
        "before": ["leader", "t", "f"],
        "commands": ["python.djangoTestRunner.runFileTests"]
    },
    {
        "before": ["leader", "t", "a"],
        "commands": ["python.djangoTestRunner.runAppTests"]
    },
    {
        "before": ["leader", "t", "p"],
        "commands": ["python.djangoTestRunner.runPreviousTests"]
    }
]
```

## Common Setups

### Django (default)

No configuration needed for a standard Django project with `manage.py` in the workspace root:

```
myproject/          <-- open this as your workspace
├── manage.py
├── myapp/
│   └── tests/
│       └── test_models.py
```

### pytest

```json
{
    "python.djangoTestRunner.manageProgram": "pytest",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

### python -m unittest

```json
{
    "python.djangoTestRunner.manageProgram": "python -m unittest",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

### Docker Compose

```json
{
    "python.djangoTestRunner.prefixCommand": "docker compose exec web",
    "python.djangoTestRunner.manageProgram": "python manage.py test",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

### Poetry

```json
{
    "python.djangoTestRunner.prefixCommand": "poetry run",
    "python.djangoTestRunner.manageProgram": "python manage.py test",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

### Django-Nose

```json
{
    "python.djangoTestRunner.djangoNose": true
}
```

This changes the test path separator from dots to colons for class/method paths (e.g., `app.tests.test_models:MyTestCase.test_something`).

### manage.py in a subdirectory

If your `manage.py` is in a subdirectory (e.g., `src/`):

```
myproject/          <-- open this as your workspace
├── src/
│   ├── manage.py
│   └── myapp/
│       └── tests/
│           └── test_models.py
```

**Option 1: Use `stripRootFolder`** (strips the first path segment):

```json
{
    "python.djangoTestRunner.prefixCommand": "cd src &&",
    "python.djangoTestRunner.stripRootFolder": true
}
```

**Option 2: Use `rootPackageName`** (strips a specific package name):

```json
{
    "python.djangoTestRunner.prefixCommand": "cd src &&",
    "python.djangoTestRunner.rootPackageName": "src"
}
```

### Custom virtualenv path

```json
{
    "python.djangoTestRunner.manageProgram": "venv/bin/python manage.py test",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

### tox

```json
{
    "python.djangoTestRunner.manageProgram": "tox -- ",
    "python.djangoTestRunner.useVSCodePythonPath": false
}
```

## Troubleshooting

**Tests run with the wrong path prefix:**
Use `stripRootFolder` or `rootPackageName` to remove the unwanted prefix from the test path. See the "manage.py in a subdirectory" section above.

**Terminal keeps getting recreated:**
The extension reuses an existing terminal named "Django Test Runner". If you rename or close it, a new one will be created on the next test run.

**Python path not detected:**
Ensure the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) is installed and an interpreter is selected. Alternatively, set `useVSCodePythonPath` to `false` and specify your Python path in `manageProgram`.

**Wrong class detected:**
The parser uses indentation to determine class hierarchy. Ensure your test file follows standard Python indentation. Strings and comments containing the word "class" are correctly ignored.

## Migrating from v4.x

v5.0.0 is a major release with the following breaking changes:

- **Default keybindings removed** — The previous `Cmd+D` chord shortcuts conflicted with VS Code's multi-cursor feature. You'll need to add your own keybindings (see the section above).
- **Minimum VS Code version raised to 1.95.0** — Required for the modern extension API. All VS Code versions from October 2024 onward are supported.
- **All configuration keys are unchanged** — Your existing settings will continue to work without any changes.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)
