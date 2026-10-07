# Django Test Runner

[![CI](https://github.com/Pachwenko/VSCode-Django-Test-Runner/actions/workflows/ci.yml/badge.svg)](https://github.com/Pachwenko/VSCode-Django-Test-Runner/actions/workflows/ci.yml)
[![VS Marketplace](https://vsmarketplacebadges.dev/version/Pachwenko.django-test-runner.svg)](https://marketplace.visualstudio.com/items?itemName=Pachwenko.django-test-runner)
[![Installs](https://vsmarketplacebadges.dev/installs/Pachwenko.django-test-runner.svg)](https://marketplace.visualstudio.com/items?itemName=Pachwenko.django-test-runner)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

A VS Code extension that resolves the Django test path at your cursor and runs it through a configurable terminal command.

It is especially useful when VS Code cannot discover the Python environment or tests itself—for example, when Django runs inside Docker, Docker Compose, a remote development environment, Poetry, or tox.

Works in VS Code, Cursor, Windsurf, and VSCodium.

## Features

- **Run Closest Method Test** — runs the test method nearest to your cursor
- **Run Closest Class Tests** — runs all tests in the class nearest to your cursor
- **Run Current File Tests** — runs all tests in the current file
- **Run Current App Tests** — runs all tests in the current app
- **Run Previous Tests** — re-runs the last test command
- **Smart Parsing** — indentation-aware class/method detection that correctly handles nested classes and strings containing "class"
- **Terminal Reuse** — reuses a single "Django Test Runner" terminal instead of creating new ones

All commands are available from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).

## How It Works

The extension builds a test command from your settings and sends it to the terminal:

```
[prefixCommand] [pythonPath] [manageProgram] [testPath] [flags]
```

For a standard Django project with `manage.py` in the workspace root, no configuration is needed. The default `manageProgram` is `manage.py test`, so running "Run Closest Method Test" produces something like:

```
python manage.py test myapp.tests.test_models.MyTestCase.test_create
```

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `python.djangoTestRunner.manageProgram` | string | `"manage.py test"` | The test command. Can be any command that accepts a test path. |
| `python.djangoTestRunner.prefixCommand` | string | `""` | Prefix before the command (env vars, cd, docker, etc.) |
| `python.djangoTestRunner.flags` | string | `""` | Flags appended after the test path |
| `python.djangoTestRunner.useVSCodePythonPath` | boolean | `true` | Use the Python interpreter from the Python extension |
| `python.djangoTestRunner.stripRootFolder` | boolean | `false` | Strip the first folder from the test path |
| `python.djangoTestRunner.rootPackageName` | string | `""` | Root package name to strip from test paths |
| `python.djangoTestRunner.djangoNose` | boolean | `false` | Use colon separator for django-nose syntax |

## Examples

Since the command is fully configurable, you can adapt it to your environment:

```json
// Docker Compose
{
  "python.djangoTestRunner.prefixCommand": "docker compose exec web",
  "python.djangoTestRunner.manageProgram": "python manage.py test",
  "python.djangoTestRunner.useVSCodePythonPath": false
}

// Docker Compose with manage.py under src/
{
  "python.djangoTestRunner.prefixCommand": "docker compose exec web",
  "python.djangoTestRunner.manageProgram": "python /app/src/manage.py test",
  "python.djangoTestRunner.rootPackageName": "src",
  "python.djangoTestRunner.useVSCodePythonPath": false
}

// Poetry
{ "python.djangoTestRunner.prefixCommand": "poetry run" }

// tox with a Django-compatible dotted test label
{ "python.djangoTestRunner.manageProgram": "tox -- python manage.py test", "python.djangoTestRunner.useVSCodePythonPath": false }

// manage.py in a subdirectory (e.g., src/)
{ "python.djangoTestRunner.prefixCommand": "cd src &&", "python.djangoTestRunner.stripRootFolder": true }
```

Set `useVSCodePythonPath` to `false` whenever the command already selects its own Python interpreter, as Docker, Poetry, and tox normally do.

## Keybindings

No default keybindings are included to avoid conflicts with VS Code built-ins. Add your own in `keybindings.json` (`Cmd+Shift+P` > "Open Keyboard Shortcuts (JSON)"):

```json
[
    { "key": "ctrl+t ctrl+m", "command": "python.djangoTestRunner.runMethodTests" },
    { "key": "ctrl+t ctrl+c", "command": "python.djangoTestRunner.runClassTests" },
    { "key": "ctrl+t ctrl+f", "command": "python.djangoTestRunner.runFileTests" },
    { "key": "ctrl+t ctrl+a", "command": "python.djangoTestRunner.runAppTests" },
    { "key": "ctrl+t ctrl+p", "command": "python.djangoTestRunner.runPreviousTests" }
]
```

## Troubleshooting

**Wrong test path?** Use `stripRootFolder` or `rootPackageName` to adjust the path prefix. This is common when `manage.py` lives in a subdirectory.

**Python path not detected?** Ensure the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) is installed and an interpreter is selected. For Docker and remote environments, set `useVSCodePythonPath` to `false` and put the interpreter in `manageProgram` instead.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[GPL-3.0](LICENSE)
