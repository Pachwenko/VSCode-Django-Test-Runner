import * as path from 'path';
import * as fs from 'fs';
import Mocha from 'mocha';

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
    });

    const testsRoot = path.resolve(__dirname, '..');

    // Find all .test.js files recursively
    function findTestFiles(dir: string): string[] {
        const results: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...findTestFiles(fullPath));
            } else if (entry.name.endsWith('.test.js')) {
                results.push(fullPath);
            }
        }
        return results;
    }

    const testFiles = findTestFiles(testsRoot);
    testFiles.forEach((f: string) => mocha.addFile(f));

    return new Promise<void>((resolve, reject) => {
        mocha.run((failures: number) => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed.`));
            } else {
                resolve();
            }
        });
    });
}
