import * as vscode from 'vscode';

export interface DjangoTestConfig {
    prefixCommand: string;
    manageProgram: string;
    flags: string;
    useVSCodePythonPath: boolean;
    stripRootFolder: boolean;
    rootPackageName: string;
    djangoNose: boolean;
}

/**
 * Read all extension configuration settings for a given document.
 */
export function getConfig(documentUri: vscode.Uri): DjangoTestConfig {
    const config = vscode.workspace.getConfiguration('python.djangoTestRunner', documentUri);
    return {
        prefixCommand: config.get<string>('prefixCommand', ''),
        manageProgram: config.get<string>('manageProgram', 'manage.py test'),
        flags: config.get<string>('flags', ''),
        useVSCodePythonPath: config.get<boolean>('useVSCodePythonPath', true),
        stripRootFolder: config.get<boolean>('stripRootFolder', false),
        rootPackageName: config.get<string>('rootPackageName', ''),
        djangoNose: config.get<boolean>('djangoNose', false),
    };
}

/**
 * Get the Python interpreter path from the Python extension or fall back
 * to the legacy defaultInterpreterPath setting.
 *
 * Fixes the existing bug where the code read "python.useVSCodePythonPath"
 * (missing the djangoTestRunner segment) and used the deprecated
 * "python.pythonPath" setting.
 */
export async function getPythonPath(documentUri: vscode.Uri): Promise<string> {
    const config = getConfig(documentUri);
    if (!config.useVSCodePythonPath) {
        return '';
    }

    // Modern approach: use the ms-python.python extension API
    try {
        const pythonExtension = vscode.extensions.getExtension('ms-python.python');
        if (pythonExtension) {
            if (!pythonExtension.isActive) {
                await pythonExtension.activate();
            }
            const pythonApi = pythonExtension.exports;
            if (pythonApi?.environments) {
                const activePath = pythonApi.environments.getActiveEnvironmentPath(documentUri);
                const env = await pythonApi.environments.resolveEnvironment(activePath);
                if (env?.executable?.uri) {
                    return env.executable.uri.fsPath;
                }
            }
        }
    } catch {
        // Fall through to legacy approach
    }

    // Fallback: use the legacy defaultInterpreterPath setting
    const legacyConfig = vscode.workspace.getConfiguration('python', documentUri);
    return legacyConfig.get<string>('defaultInterpreterPath', '');
}
