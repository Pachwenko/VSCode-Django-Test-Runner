# [django-test-runner](https://marketplace.visualstudio.com/items?itemName=Pachwenko.django-test-runner)

Adds support for running Django tests in [Visual Studio Code](https://github.com/microsoft/vscode). Allows customization to fit your development environment. Provides shortcuts to run closest method, class, file, app and previous tests.
Draws inspiration from [vscode-django-tests](https://github.com/remik/vscode-django-tests) and [vim-python-test-runner](https://github.com/JarrodCTaylor/vim-python-test-runner).

## Features

Default shortcuts:

```
Run Closest Test Method: cmd+d+m        extension.djangoTestRunner.runMethodTests
Run Closest Test Class:  cmd+d+c        extension.djangoTestRunner.runClassTests
Run Current Test File:   cmd+d+f        extension.djangoTestRunner.runFileTests
Run Current App Tests:   cmd+d+a        extension.djangoTestRunner.runAppTests
Run Previous Tests:      cmd+d+p        extension.djangoTestRunner.runPreviousTests
```

VSCodevim keybindings (put these in your settings.json file):

```
"vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": ["leader", "d", "m"],
      "commands": ["python.djangoTestRunner.runMethodTests"]
    },
    {
      "before": ["leader", "d", "c"],
      "commands": ["python.djangoTestRunner.runClassTests"]
    },
    {
      "before": ["leader", "d", "f"],
      "commands": ["python.djangoTestRunner.runFileTests"]
    },
    {
      "before": ["leader", "d", "a"],
      "commands": ["python.djangoTestRunner.runAppTests"]
    },
    {
      "before": ["leader", "d", "p"],
      "commands": ["python.djangoTestRunner.runPreviousTests"]
    }
],
```

## Requirements

Requires manage.py to be in the root workspace directory, otherwise add a cd command to the `python.djangoTestRunner.prefixCommand` settings such as "cd ~/Projects/hello-world/src &&"

## Extension Settings

This extension contributes the following settings:

- `python.djangoTestRunner.manageProgram`: the manage.py script to invoke (default=`manage.py test`)
  - Some examples (with a disabled useVSCodePythonPath) would be `virtualenv/bin/python src/manage.py`, and `docker compose run test`, or maybe `poetry run manage.py test`
- `python.djangoTestRunner.prefixCommand`: any command(s) to be directly before the main test command e.g. "cd ~/Projects/hello-world/src &&" to cd into the directory containing your manage.py
- `python.djangoTestRunner.flags`: any flags you wish to run such as --nocapture, also useful for specifying different settings if you use a modified manage.py
- `python.djangoTestRunner.useVSCodePythonPath`: enabled by default. When disabled you can specify your own python path with `manageProgram` (super powerful)
- `python.djangoTestRunner.djangoNose`: useful for older django projects. if checked will use django-nose syntax for running class/method tests inside a file
- `python.djangoTestRunner.stripRootFolder`: Removes the root folder you are in from the python path. You probably don't want this enabled unless your manage.py file lives somewhere nonstandard
-- `python.djangoTestRunner.rootPackageName`: the name of the root package of your application. Can be used in conjunction with `prefixCommand` to remove the root package name from test file paths.
  - stripRootFolder must be disabled for this to work.
  - e.g. if `prefixCommand` is set to `"cd ~/Projects/hello-world/src &&"`, your django project structure may raise errors if test paths are specified with `src.apps.app_name.tests`.
  - setting this to `"rootPackageName": "src"` will cause file paths to return in the format `apps.app_name.tests`, which has the root packed (`src`) removed from the test path

## Release Notes

Adds support for running Django Tests a multitude of ways such as by method or class. Supports Django-Nose syntax, test flags, and prefix commands.

### 4.0.0

Includes a multitude of improvements. Thanks to the community!
- You can now specify the manageProgram to whatever command you want to use! Thanks [@vector-kerr](https://github.com/vector-kerr)
- The terminal does not keep opening over and over again! Thanks [@Mariownyou](https://github.com/Mariownyou)
- You can specify a rootPackageName if your django code lives in any different directory than your manage.py like under "src/project/"! Thanks [@alex-a-pereira](https://github.com/alex-a-pereira)
  - stripRootFolder must be disabled for this to work.
- stripRootFolder has been added - Thanks to [@alex-a-pereira](https://github.com/alex-a-pereira) for inspiring this change
- You can now disable the default python path! So you can do cool stuff like set your manageProgram to like `docker compose run test` or your own python path like `virtualenv/bin/python src/manage.py`
- It's now version 4 and I'm not sure why
- VSCode is adding support for running Django tests natively but you may still find this useful in your workflows.

### 1.0.0

Initial release of Django Test Runner
