import './custom-matchers';
import { TestFixture } from './test-fixture';

describe('cli-protect-upgrade-script', () => {
  jest.setTimeout(1000 * 20);

  it('no `snyk` package in package.json dependencies', async () => {
    const testFixture = await TestFixture.createTestFixture(
      'no-snyk-dependency',
    );
    const { code, stdout } = await testFixture.execUpgradeScript();
    expect(code).toBe(0);
    expect(stdout).toMatchLines([
      'Checking package.json project in the current directory.',
      'There is no `snyk` package listed as a dependency. Nothing to upgrade.',
    ]);
    testFixture.remove();
  });

  describe('npm', () => {
    it('`snyk` package in package.json dependencies', async () => {
      const testFixture = await TestFixture.createTestFixture(
        'npm-with-snyk-dep',
      );
      const initialPackageLockObj = await testFixture.readObj(
        'package-lock.json',
      );
      expect(initialPackageLockObj).toContainDependencyIn(
        'snyk',
        'dependencies',
      );
      expect(initialPackageLockObj.packages).toHaveProperty(
        'node_modules/snyk',
      );

      const { code, stdout } = await testFixture.execUpgradeScript();
      expect(code).toBe(0);

      const packageJsonObj = await testFixture.packageJsonObj();
      expect(packageJsonObj).not.toContainDependency('snyk');
      expect(packageJsonObj).toContainDependencyIn(
        '@snyk/protect',
        'dependencies',
      );
      expect(packageJsonObj).toMatchObject({
        scripts: {
          'snyk-protect': 'snyk-protect',
        },
      });

      const packageLockObj = await testFixture.readObj('package-lock.json');
      expect(packageLockObj).not.toContainDependency('snyk');
      expect(packageLockObj).toContainDependencyIn(
        '@snyk/protect',
        'dependencies',
      );
      expect(packageLockObj.packages).toHaveProperty(
        'node_modules/@snyk/protect',
      );

      expect(stdout).toMatchLines([
        'Checking package.json project in the current directory.',
        'Removing snyk package from dependencies.',
        'Running command: npm uninstall snyk',
        'Adding @snyk/protect package to dependencies.',
        'Running command: npm install @snyk/protect@latest',
        'Updating package.json file.',
        'Running command: npx snyk-protect',
        "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and package-lock.json.",
      ]);

      testFixture.remove();
    });
  });

  describe('yarn', () => {
    it('`snyk` package in package.json dependencies', async () => {
      const testFixture = await TestFixture.createTestFixture(
        'yarn-with-snyk-dep',
      );
      const initialPackageJson = await testFixture.packageJsonObj();
      expect(initialPackageJson).toContainDependencyIn('snyk', 'dependencies');

      const { code, stdout } = await testFixture.execUpgradeScript();
      expect(code).toBe(0);

      const packageJsonObj = await testFixture.packageJsonObj();
      expect(packageJsonObj).not.toContainDependency('snyk');
      expect(packageJsonObj).toContainDependencyIn(
        '@snyk/protect',
        'dependencies',
      );
      expect(packageJsonObj).toMatchObject({
        scripts: {
          'snyk-protect': 'snyk-protect',
        },
      });

      const yarnLockStr = await testFixture.read('yarn.lock');
      expect(yarnLockStr).not.toContain('snyk@');
      expect(yarnLockStr).toContain('@snyk/protect@');

      expect(stdout).toMatchLines([
        'Checking package.json project in the current directory.',
        'Removing snyk package from dependencies.',
        'Running command: yarn remove snyk',
        'Adding @snyk/protect package to dependencies.',
        'Running command: yarn add @snyk/protect@latest',
        'Updating package.json file.',
        'Running command: yarn run snyk-protect',
        "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and yarn.lock.",
      ]);

      testFixture.remove();
    });
  });
});
