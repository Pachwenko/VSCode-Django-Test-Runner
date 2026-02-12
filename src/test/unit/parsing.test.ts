import * as assert from 'assert';
import { parseLines, filePathToDottedPath, stripRootPackage, buildFullTestPath, buildClassTestPath, buildCommand } from '../../parsing.js';

// ---------------------------------------------------------------------------
// parseLines
// ---------------------------------------------------------------------------
describe('parseLines', () => {
    it('should find a basic test method and class', () => {
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

    it('should handle empty input', () => {
        const result = parseLines([]);
        assert.strictEqual(result.methodName, '');
        assert.strictEqual(result.className, '');
    });

    it('should handle cursor inside a method body (not on def line)', () => {
        const lines = [
            'class MyTest(TestCase):',
            '    def test_something(self):',
            '        x = 1',
            '        y = 2',
            '        self.assertEqual(x, y)',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should handle class with decorator', () => {
        const lines = [
            '@override_settings(DEBUG=True)',
            'class MyTest(TestCase):',
            '    def test_something(self):',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTest');
    });

    it('should handle class inheriting from multiple bases', () => {
        const lines = [
            'class MyTest(TransactionTestCase, MyMixin):',
            '    def test_something(self):',
            '        pass',
        ];
        const reversed = [...lines].reverse();
        const result = parseLines(reversed);
        assert.strictEqual(result.methodName, 'test_something');
        assert.strictEqual(result.className, 'MyTest');
    });
});

// ---------------------------------------------------------------------------
// filePathToDottedPath
// ---------------------------------------------------------------------------
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

    it('should handle single file at root', () => {
        assert.strictEqual(
            filePathToDottedPath('/test_models.py'),
            'test_models'
        );
    });

    it('should handle __init__.py', () => {
        assert.strictEqual(
            filePathToDottedPath('/app/tests/__init__.py'),
            'app.tests.__init__'
        );
    });

    it('should handle mixed separators (Windows with forward slashes)', () => {
        assert.strictEqual(
            filePathToDottedPath('\\app/tests\\test_models.py'),
            'app.tests.test_models'
        );
    });

    it('should only strip .py from end, not middle of name', () => {
        assert.strictEqual(
            filePathToDottedPath('/app/tests/test_pyutils.py'),
            'app.tests.test_pyutils'
        );
    });
});

// ---------------------------------------------------------------------------
// stripRootPackage
// ---------------------------------------------------------------------------
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

    it('should strip multi-level root package name', () => {
        assert.strictEqual(
            stripRootPackage('src.backend.app.tests.test_models', false, 'src.backend'),
            'app.tests.test_models'
        );
    });
});

// ---------------------------------------------------------------------------
// buildFullTestPath
// ---------------------------------------------------------------------------
describe('buildFullTestPath', () => {
    it('should build a standard Django test path', () => {
        assert.strictEqual(
            buildFullTestPath('app.tests.test_models', 'MyTestCase', 'test_create', false),
            'app.tests.test_models.MyTestCase.test_create'
        );
    });

    it('should build a Django Nose test path with colon separator', () => {
        assert.strictEqual(
            buildFullTestPath('app.tests.test_models', 'MyTestCase', 'test_create', true),
            'app.tests.test_models:MyTestCase.test_create'
        );
    });

    it('should handle deeply nested module paths', () => {
        assert.strictEqual(
            buildFullTestPath('apps.users.tests.test_views', 'UserViewTest', 'test_login', false),
            'apps.users.tests.test_views.UserViewTest.test_login'
        );
    });
});

// ---------------------------------------------------------------------------
// buildClassTestPath
// ---------------------------------------------------------------------------
describe('buildClassTestPath', () => {
    it('should build a standard Django class test path', () => {
        assert.strictEqual(
            buildClassTestPath('app.tests.test_models', 'MyTestCase', false),
            'app.tests.test_models.MyTestCase'
        );
    });

    it('should build a Django Nose class test path with colon separator', () => {
        assert.strictEqual(
            buildClassTestPath('app.tests.test_models', 'MyTestCase', true),
            'app.tests.test_models:MyTestCase'
        );
    });
});

// ---------------------------------------------------------------------------
// buildCommand
// ---------------------------------------------------------------------------
describe('buildCommand', () => {
    it('should build a basic Django test command', () => {
        assert.strictEqual(
            buildCommand('', '', 'manage.py test', 'app.tests.MyTest.test_it', ''),
            'manage.py test app.tests.MyTest.test_it'
        );
    });

    it('should include prefix command (Docker)', () => {
        assert.strictEqual(
            buildCommand('docker compose exec web', '', 'manage.py test', 'app.tests.MyTest', ''),
            'docker compose exec web manage.py test app.tests.MyTest'
        );
    });

    it('should include python path', () => {
        assert.strictEqual(
            buildCommand('', '/usr/bin/python3', 'manage.py test', 'app.tests.MyTest', ''),
            '/usr/bin/python3 manage.py test app.tests.MyTest'
        );
    });

    it('should include flags', () => {
        assert.strictEqual(
            buildCommand('', '', 'manage.py test', 'app.tests.MyTest', '--verbosity=2 --keepdb'),
            'manage.py test app.tests.MyTest --verbosity=2 --keepdb'
        );
    });

    it('should build a full command with all parts', () => {
        assert.strictEqual(
            buildCommand(
                'docker compose exec web',
                '/usr/bin/python3',
                'manage.py test',
                'app.tests.MyTest.test_it',
                '--verbosity=2'
            ),
            'docker compose exec web /usr/bin/python3 manage.py test app.tests.MyTest.test_it --verbosity=2'
        );
    });

    it('should filter out empty strings cleanly', () => {
        assert.strictEqual(
            buildCommand('', '', 'pytest', 'tests/test_models.py::TestCase::test_it', ''),
            'pytest tests/test_models.py::TestCase::test_it'
        );
    });

    it('should work with pytest as the runner', () => {
        assert.strictEqual(
            buildCommand('', '', 'pytest', 'app.tests.test_models', '-v --tb=short'),
            'pytest app.tests.test_models -v --tb=short'
        );
    });

    it('should work with poetry prefix', () => {
        assert.strictEqual(
            buildCommand('poetry run', '', 'python manage.py test', 'app.tests.MyTest', ''),
            'poetry run python manage.py test app.tests.MyTest'
        );
    });

    it('should handle empty test path (run all tests)', () => {
        assert.strictEqual(
            buildCommand('', '', 'manage.py test', '', '--keepdb'),
            'manage.py test --keepdb'
        );
    });
});
