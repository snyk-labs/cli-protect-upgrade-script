import './custom-matchers';
import { TestFixture } from './test-fixture';

describe('cli-protect-upgrade-script', () => {
  jest.setTimeout(1000 * 20);

  describe('without `snyk` package.json dependencies', () => {
    it('works', async () => {
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
  });

  describe('with `snyk` in package.json dependencies', () => {
    describe('without a vulnerable and patchable dependency', () => {
      describe('using the `prepare` script', () => {
        it('works with npm', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'with-snyk-dep-prepare-npm',
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
          if (packageLockObj.lockfileVersion === 2) {
            expect(packageLockObj.packages).toHaveProperty(
              'node_modules/@snyk/protect',
            );
          }

          expect(stdout).toMatchLines([
            'Checking package.json project in the current directory.',
            'Removing snyk package from dependencies.',
            'Running command: npm uninstall snyk',
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: npm install @snyk/protect@latest',
            'Running command: npx snyk-protect',
            "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and package-lock.json.",
          ]);

          testFixture.remove();
        });

        it('works with yarn', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'with-snyk-dep-prepare-yarn',
          );
          const { code, stdout, stderr } =
            await testFixture.execUpgradeScript();
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
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: yarn add @snyk/protect@latest',
            'Running command: yarn run snyk-protect',
            "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and yarn.lock.",
          ]);

          testFixture.remove();
        });
      });

      describe('using the `prepublish` script', () => {
        it('works with npm', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'with-snyk-dep-prepublish-npm',
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
          if (packageLockObj.lockfileVersion === 2) {
            expect(packageLockObj.packages).toHaveProperty(
              'node_modules/@snyk/protect',
            );
          }

          expect(stdout).toMatchLines([
            'Checking package.json project in the current directory.',
            'Removing snyk package from dependencies.',
            'Running command: npm uninstall snyk',
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: npm install @snyk/protect@latest',
            'Running command: npx snyk-protect',
            "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and package-lock.json.",
          ]);

          testFixture.remove();
        });

        it('works with yarn', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'with-snyk-dep-prepublish-yarn',
          );
          const { code, stdout, stderr } =
            await testFixture.execUpgradeScript();
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
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: yarn add @snyk/protect@latest',
            'Running command: yarn run snyk-protect',
            "All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and yarn.lock.",
          ]);

          testFixture.remove();
        });
      });
    });

    describe('with a vulnerable and patchable dependency', () => {
      describe('using the `prepare` script', () => {
        it('works with npm', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'project-with-patchable-dep-fixture',
          );
          const { code, stdout, stderr } =
            await testFixture.execUpgradeScript();
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
          if (packageLockObj.lockfileVersion === 2) {
            expect(packageLockObj.packages).toHaveProperty(
              'node_modules/@snyk/protect',
            );
          }

          expect(stdout).toMatchLines([
            'Checking package.json project in the current directory.',
            'Removing snyk package from dependencies.',
            'Running command: npm uninstall snyk',
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: npm install @snyk/protect@latest',
            'Running command: npx snyk-protect',
            'All done. Review and commit the changes to package.json and package-lock.json.',
          ]);

          testFixture.remove();
        });

        it('works with yarn', async () => {
          const testFixture = await TestFixture.createTestFixture(
            'project-with-patchable-dep-fixture-yarn',
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

          const yarnLockStr = await testFixture.read('yarn.lock');
          expect(yarnLockStr).not.toContain('snyk@');
          expect(yarnLockStr).toContain('@snyk/protect@');

          expect(stdout).toMatchLines([
            'Checking package.json project in the current directory.',
            'Removing snyk package from dependencies.',
            'Running command: yarn remove snyk',
            'Updating package.json file.',
            'Adding @snyk/protect package to dependencies.',
            'Running command: yarn add @snyk/protect@latest',
            'Running command: yarn run snyk-protect',
            'All done. Review and commit the changes to package.json and yarn.lock.',
          ]);

          testFixture.remove();
        });
      });
    });
  });
});
