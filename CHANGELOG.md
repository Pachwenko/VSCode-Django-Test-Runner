# Change Log

## [5.0.0] - 2025-02-11

### Breaking Changes

- **Removed default keybindings** — The `Cmd+D` chord shortcuts conflicted with VS Code's built-in multi-cursor feature (`Cmd+D`). Configure your own keybindings — see the README for recommended setups. (Fixes [#15](https://github.com/Pachwenko/VSCode-Django-Test-Runner/issues/15), [#3](https://github.com/Pachwenko/VSCode-Django-Test-Runner/issues/3))
- **Minimum VS Code version raised to 1.95.0** — Required for modern extension APIs.

### Bug Fixes

- **Fixed class parsing when strings contain "class"** — The regex now uses line-anchored, indentation-aware matching so that strings like `'class MyFake'` and inner/nested classes no longer break test detection. (Fixes [#11](https://github.com/Pachwenko/VSCode-Django-Test-Runner/issues/11))
- **Fixed terminal duplication** — The extension no longer creates duplicate terminals when VS Code restores terminals on startup. (Fixes [#21](https://github.com/Pachwenko/VSCode-Django-Test-Runner/issues/21))
- **Fixed `useVSCodePythonPath` config key mismatch** — The code was reading the wrong configuration key. Now correctly reads `python.djangoTestRunner.useVSCodePythonPath`.
- **Updated Python path detection** — Uses the modern Python extension API instead of the deprecated `python.pythonPath` setting, with fallback to `python.defaultInterpreterPath`.

### Improvements

- **Modernized build toolchain** — TypeScript 5.7, esbuild bundler, ESLint 9 (replacing deprecated tslint), `@vscode/vsce` 3.x
- **Refactored source code** — Split into focused modules: `extension.ts`, `testRunner.ts`, `terminal.ts`, `config.ts`, `parsing.ts`
- **Added unit test suite** — 22 tests covering parsing logic, path building, and root package stripping
- **Added CI/CD** — GitHub Actions for linting, testing, and building on every push/PR
- **Added automated publishing** — Publishes to both VS Marketplace and Open VSX (for Cursor/Windsurf/VSCodium) on release
- **Added repository templates** — Bug report, feature request, PR template, and security policy
- **Improved documentation** — Comprehensive README with configuration examples for Django, pytest, Docker, Poetry, tox, and more
- **Smaller extension package** — esbuild bundling produces a ~5KB minified bundle

### Configuration

All existing `python.djangoTestRunner.*` settings are unchanged. No migration needed for your settings — they will continue to work as before.

## [4.0.2] - 2024-09-11

Actually decided stripRootFolder shouldn't be default.

## [4.0.1] - 2024-09-11

Rembeered to update changelog

## [4.0.0] - 2024-09-11

Includes a multitude of improvements. Thanks to the community!
- You can now specify the manageProgram to whatever command you want to use! Thanks [@vector-kerr](https://github.com/vector-kerr)
- The terminal does not keep opening over and over again! Thanks [@Mariownyou](https://github.com/Mariownyou)
- You can specify a rootPackageName if your django code lives in any different directory than your manage.py like under "src/project/"! Thanks [@alex-a-pereira](https://github.com/alex-a-pereira)
  - stripRootFolder must be disabled for this to work.
- stripRootFolder has been added - Thanks to [@alex-a-pereira](https://github.com/alex-a-pereira) for inspiring this change. Most people will need this so it is enabled by default.
- You can now disable the default python path! So you can do cool stuff like set your manageProgram to like `docker compose run test` or your own python path like `virtualenv/bin/python src/manage.py`
- VSCode is adding support for running Django tests natively but you may still find this useful in your workflows.

## [3.0.4] - 2019-07-16

### Added

- Updated README with vscode vim settings to emulate vim-python-runner keybindings

## [3.0.3] - 2019-07-15

### Changed

- Redid the changes from 2.0.0
- If you have any old settings they will need renamed to the new commands
- Tried to revert to version 2.0 or ealier but that is unsupported. All new updated will be 3.0.3 or greater

## [3.0.1] - 2019-07-15

### Fixed

- Reverted to older version, refactoring command names seems to have broken the extension
- Also version 3 now because it seems versions cant be reverted to a older one?

## [2.0.0] - 2019-07-14

### Changed

- Renamed all commands so they are prefixed with python.djangoTestRunner

## [1.0.4] - 2019-07-11

### Fixed

- Removed useless pyenv command

## [1.0.3] - 2019-07-11

### Fixed

- Now correctly recognises Django Nose settings and runs properly

## [1.0.2] - 2019-07-11

### Changed

- Added updates to CHANGELOG

## [1.0.1] - 2019-07-11

### Fixed

- Fixed issue with paths not replacing all forward/backward slashes with periods.

## [1.0.0] - 2019-07-11

- Initial release!
