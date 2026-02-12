# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 5.x     | :white_check_mark: |
| < 5.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainer directly or use [GitHub's private vulnerability reporting](https://github.com/Pachwenko/VSCode-Django-Test-Runner/security/advisories/new).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix release**: As soon as practically possible

## Scope

This extension runs commands in VS Code's integrated terminal based on user configuration. The security surface includes:

- Configuration values that are interpolated into shell commands (`prefixCommand`, `manageProgram`, `flags`)
- File path resolution from the workspace

Since all configuration is set explicitly by the user and commands run in the user's own terminal with their permissions, the attack surface is minimal. However, we take all reports seriously.
