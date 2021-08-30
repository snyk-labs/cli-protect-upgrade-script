export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchLines(expectedLines): R;
      toContainDependencyIn(dependency, depType): R;
      toContainDependency(dependency): R;
    }
  }
}

expect.extend({
  toMatchLines(received: string, expectedLines: string[]) {
    const joined = expectedLines.join('\n');
    if (received.trim() === joined.trim()) {
      return {
        pass: true,
        message: () => 'matches',
      };
    } else {
      // line by line analysis
      const receivedLines = received.trim().split('\n');
      let firstNonMatchingLine: {
        received: string;
        expected: string;
      };

      for (let i = 0; i < receivedLines.length; i++) {
        if (receivedLines[i] !== expectedLines[i]) {
          firstNonMatchingLine = {
            received: receivedLines[i],
            expected: expectedLines[i],
          };
          break;
        }
      }

      return {
        pass: false,
        message: () => {
          return [
            'lines do not match',
            `received: ${received}`,
            `expected: ${joined}`,
            'first non-matching line:',
            `  received: ${firstNonMatchingLine.received}`,
            `  expected: ${firstNonMatchingLine.expected}`,
          ].join('\n');
        },
      };
    }
  },

  toContainDependencyIn(
    received: any,
    dependency: string,
    depType: 'dependencies' | 'devDependencies',
  ) {
    const deps = received[depType];

    if (deps) {
      if (Object.keys(deps).includes(dependency)) {
        return {
          pass: true,
          message: () => `\`${dependency}\` found in \`${depType}\``,
        };
      } else {
        return {
          pass: false,
          message: () => `\`${dependency}\` not found in \`${depType}\``,
        };
      }
    } else {
      return {
        pass: false,
        message: () => `\`${depType}\` list does not exist`,
      };
    }
  },

  toContainDependency(
    received: any,
    dependency: string,
    depType?: 'dependencies' | 'devDependencies',
  ) {
    const dependencies = received.dependencies;
    const devDependencies = received.devDependencies;

    const dependenciesContainsDep =
      dependencies && Object.keys(dependencies).includes(dependency);
    const devDependenciesContainsDep =
      devDependencies && Object.keys(devDependencies).includes(dependency);

    const foundIn = [];
    if (dependenciesContainsDep) {
      foundIn.push('dependencies');
    }
    if (devDependenciesContainsDep) {
      foundIn.push('devDependencies');
    }
    const msg = `${dependency} found in ${foundIn.join(',')}`;

    if (dependenciesContainsDep || devDependenciesContainsDep) {
      return {
        pass: true,
        message: () => msg,
      };
    } else {
      return {
        pass: false,
        message: () =>
          `${dependency} not found in either dependencies or devDependencies`,
      };
    }
  },
});
