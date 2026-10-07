import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension('Pachwenko.django-test-runner');
        assert.ok(extension, 'Extension should be present');
        await extension.activate();
    });

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('Pachwenko.django-test-runner'));
    });

    test('All commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        const expectedCommands = [
            'python.djangoTestRunner.runPreviousTests',
            'python.djangoTestRunner.runMethodTests',
            'python.djangoTestRunner.runClassTests',
            'python.djangoTestRunner.runFileTests',
            'python.djangoTestRunner.runAppTests',
        ];

        for (const cmd of expectedCommands) {
            assert.ok(
                commands.includes(cmd),
                `Command ${cmd} should be registered`
            );
        }
    });
});
