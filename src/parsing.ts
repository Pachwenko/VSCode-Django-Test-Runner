const METHOD_REGEX = /^(\s*)def\s+(test_\w+)\s*\(/;
const CLASS_REGEX = /^(\s*)class\s+(\w+)/;

export interface ParseResult {
    methodName: string;
    className: string;
}

/**
 * Parse lines of Python code (in reverse order from cursor position)
 * to find the nearest test method and its enclosing class.
 *
 * Lines are expected to be in reverse order (cursor line first, top of file last).
 *
 * Fixes for Issue #11: Uses anchored regexes (^) so that "class" inside strings
 * or comments won't match. Also uses indentation-aware logic so inner/nested
 * classes are not incorrectly selected as the enclosing class.
 */
export function parseLines(lines: string[]): ParseResult {
    let methodName = '';
    let className = '';
    let methodIndent: number | null = null;

    for (const line of lines) {
        const trimmed = line.trimStart();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const indent = line.length - trimmed.length;

        // Find the nearest test method (walking backwards from cursor)
        if (!methodName) {
            const methodMatch = line.match(METHOD_REGEX);
            if (methodMatch) {
                methodName = methodMatch[2];
                methodIndent = indent;
                continue;
            }
        }

        // Find the class that contains our method
        const classMatch = line.match(CLASS_REGEX);
        if (classMatch) {
            const classIndent = indent;

            if (methodIndent !== null && classIndent < methodIndent) {
                // This class has less indentation than the method — it's the parent
                className = classMatch[2];
                break;
            } else if (methodIndent === null) {
                // No method found yet, just take the nearest class (for runClassTests)
                className = classMatch[2];
                break;
            }
            // If classIndent >= methodIndent, it's a sibling or nested class — skip it
        }
    }

    return { methodName, className };
}

/**
 * Convert a file system path to a Python dotted module path.
 *
 * Takes the relative file path from the workspace root and converts it:
 *   /app/tests/test_models.py -> app.tests.test_models
 */
export function filePathToDottedPath(relativePath: string): string {
    return relativePath
        .replace(/\.py$/, '')
        .replace(/^[/\\]+/, '')
        .replace(/[/\\]+/g, '.');
}

/**
 * Strip the root package from a dotted module path.
 *
 * If stripRootFolder is true, removes the first segment:
 *   app.tests.test_models -> tests.test_models
 *
 * If rootPackageName is provided, removes that prefix:
 *   src.app.tests.test_models (rootPackageName="src") -> app.tests.test_models
 */
export function stripRootPackage(
    filePath: string,
    stripRootFolder: boolean,
    rootPackageName: string
): string {
    if (stripRootFolder) {
        return filePath.replace(/^[^.]*\./, '');
    }

    if (!rootPackageName) {
        return filePath;
    }

    // Ensure rootPackageName ends with a period
    let root = rootPackageName;
    if (!root.endsWith('.')) {
        root += '.';
    }

    const idx = filePath.indexOf(root);
    if (idx < 0) {
        return filePath;
    }

    return filePath.substring(idx + root.length);
}

/**
 * Build the full test path for a specific test method.
 *
 * Django standard:  app.tests.test_models.MyTestCase.test_something
 * Django Nose:      app.tests.test_models:MyTestCase.test_something
 */
export function buildFullTestPath(
    filePath: string,
    className: string,
    methodName: string,
    djangoNose: boolean
): string {
    const separator = djangoNose ? ':' : '.';
    return filePath + separator + className + '.' + methodName;
}

/**
 * Build the test path for an entire test class.
 *
 * Django standard:  app.tests.test_models.MyTestCase
 * Django Nose:      app.tests.test_models:MyTestCase
 */
export function buildClassTestPath(
    filePath: string,
    className: string,
    djangoNose: boolean
): string {
    const separator = djangoNose ? ':' : '.';
    return filePath + separator + className;
}

/**
 * Build the command string that gets sent to the terminal.
 *
 * Filters out empty/falsy parts and joins with spaces.
 * Example: "docker compose exec web python manage.py test app.tests.TestCase --verbosity=2"
 */
export function buildCommand(
    prefixCommand: string,
    pythonPath: string,
    manageProgram: string,
    testPath: string,
    flags: string
): string {
    return [prefixCommand, pythonPath, manageProgram, testPath, flags]
        .filter(Boolean)
        .join(' ');
}
