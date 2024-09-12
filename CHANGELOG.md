# Change Log

All notable changes to the "django-test-runner" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

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
