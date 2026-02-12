import * as assert from 'assert';
import { parseLines, filePathToDottedPath, stripRootPackage } from '../../parsing.js';

describe('parseLines', () => {
    it('should find a basic test method and class', () => {
        // Lines in file order (top to bottom), then reversed to simulate
        // walking backwards from cursor
        const lines = [
            'class MyTestCase(TestCase):',
            '    def test_something(self):',
            '        pass',
        ];
        const reversed = [...lines].reverse();

        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTestCase');
    });

    it('should find class when cursor is on the method line', () => {
        const lines = [
            'class MyTestCase(TestCase):',
            '    def test_first(self):',
            '        pass',
            '    def test_second(self):',
        ];
        // Lines in reverse (cursor at test_second, walking up)
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_second');
        assert.strictEqual(result.className, 'MyTestCase');
    });

    it('should NOT match "class" inside a string (Issue #11)', () => {
        const lines = [
            "class MyTest(TestCase):",
            "    def test_has_broken_str(self):",
            "        expected_result = 'class ThisStringBrokeIt'",
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_has_broken_str');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should NOT match "class" inside a comment', () => {
        const lines = [
            'class RealClass(TestCase):',
            '    def test_something(self):',
            '        # class FakeClass should not match',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'RealClass');
    });

    it('should NOT select inner/nested class as enclosing class (Issue #11)', () => {
        const lines = [
            'class MyTest(TestCase):',
            '    class MyHelperClass:',
            '        pass',
            '    def test_something(self):',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should find class when no method is present (for runClassTests)', () => {
        const lines = [
            'class MyTestCase(TestCase):',
            '    pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, '');
        assert.strictEqual(result.className, 'MyTestCase');
    });

    it('should return empty strings when no class or method found', () => {
        const lines = [
            '# just a comment',
            '',
            'import os',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, '');
        assert.strictEqual(result.className, '');
    });

    it('should skip non-test def methods', () => {
        // parseLines specifically looks for test_ prefix
        const lines = [
            'class MyTest(TestCase):',
            '    def helper_method(self):',
            '        pass',
            '    def test_real(self):',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_real');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should handle method with no space before parenthesis', () => {
        const lines = [
            'class MyTest(TestCase):',
            '    def test_no_space(self):',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_no_space');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should handle subtest with class-like string (Issue #11 variant)', () => {
        const lines = [
            'class MyTest(TestCase):',
            '    def test_has_broken_subtest(self):',
            "        with self.subTest('should return the value of class var cls.SOMETHING'):",
            '            subject = MyClass()',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_has_broken_subtest');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should handle multiple test classes and pick the nearest enclosing one', () => {
        const lines = [
            'class FirstTest(TestCase):',
            '    def test_first(self):',
            '        pass',
            '',
            'class SecondTest(TestCase):',
            '    def test_second(self):',
            '        pass',
        ];
        // Cursor on test_second, walking up
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_second');
        assert.strictEqual(result.className, 'SecondTest');
    });

    it('should skip blank lines and comments when searching', () => {
        const lines = [
            'class MyTest(TestCase):',
            '',
            '    # This is a test',
            '    def test_something(self):',
            '        # More comments',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTest');
    });
});

describe('filePathToDottedPath', () => {
    it('should convert a Unix-style path to dotted notation', () => {
        assert.strictEqual(
            filePathToDottedPath('/app/tests/test_models.py'),
            'app.tests.test_models'
        );
    });

    it('should convert a Windows-style path to dotted notation', () => {
        assert.strictEqual(
            filePathToDottedPath('\\app\\tests\\test_models.py'),
            'app.tests.test_models'
        );
    });

    it('should handle path with no leading slash', () => {
        assert.strictEqual(
            filePathToDottedPath('app/tests/test_models.py'),
            'app.tests.test_models'
        );
    });

    it('should handle deeply nested path', () => {
        assert.strictEqual(
            filePathToDottedPath('/src/apps/users/tests/test_views.py'),
            'src.apps.users.tests.test_views'
        );
    });
});

describe('stripRootPackage', () => {
    it('should strip first folder when stripRootFolder is true', () => {
        assert.strictEqual(
            stripRootPackage('app.tests.test_models', true, ''),
            'tests.test_models'
        );
    });

    it('should not strip anything when both options are off', () => {
        assert.strictEqual(
            stripRootPackage('app.tests.test_models', false, ''),
            'app.tests.test_models'
        );
    });

    it('should strip named root package', () => {
        assert.strictEqual(
            stripRootPackage('src.app.tests.test_models', false, 'src'),
            'app.tests.test_models'
        );
    });

    it('should strip named root package with trailing dot', () => {
        assert.strictEqual(
            stripRootPackage('src.app.tests.test_models', false, 'src.'),
            'app.tests.test_models'
        );
    });

    it('should return unchanged if root package not found', () => {
        assert.strictEqual(
            stripRootPackage('app.tests.test_models', false, 'nonexistent'),
            'app.tests.test_models'
        );
    });

    it('stripRootFolder takes precedence over rootPackageName', () => {
        assert.strictEqual(
            stripRootPackage('app.tests.test_models', true, 'something'),
            'tests.test_models'
        );
    });
});
