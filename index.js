const fs = require('fs');
const { exec } = require('child_process');
const { exit } = require('process');

function exitWithMessage(message, code = 0) {
  console.log(message);
  exit(code);
}

async function detectYarnOrNpm() {
  const files = await fs.readdirSync(process.cwd());
  const isItNodeProject = files.some((f) => f === 'package.json');
  if (!isItNodeProject) {
    return;
  }

  const isItYarn = files.some((f) => f === 'yarn.lock');
  return isItYarn ? 'yarn' : 'npm';
}

async function detectSnykInDependencies() {
  const { dependencies, devDependencies } = JSON.parse(
    fs.readFileSync('package.json', 'utf8'),
  );
  if (
    (dependencies && Object.keys(dependencies).some((d) => d === 'snyk')) ||
    (devDependencies && Object.keys(devDependencies).some((d) => d === 'snyk'))
  ) {
    return true;
  }
  return false;
}

// TODO: is this different to child process exec?
function executeCommand(cmd) {
  console.info('Running command:', cmd);
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      const error = stderr.trim();
      if (err) {
        return reject(err);
      }
      // if (error) {
      //   if (!error.includes('Debugger attached.')) {
      //     // return reject(new Error(error + ' / ' + cmd));
      //   }
      // }
      resolve(stdout.split('\n').join(''));
    });
  });
}

async function uninstallSnyk(packageManager) {
  console.info('Removing snyk package from dependencies.');
  if (packageManager === 'npm') {
    return await executeCommand('npm uninstall snyk');
  }
  return await executeCommand('yarn remove snyk');
}

async function installSnykProtect(packageManager) {
  console.info('Adding @snyk/protect package to dependencies.');
  if (packageManager === 'npm') {
    return await executeCommand('npm install @snyk/protect@latest');
  }
  return await executeCommand('yarn add @snyk/protect@latest');
}

async function isSnykProtectNeeded(packageManager) {
  const snykProtectOutput = await executeCommand(
    `${packageManager === 'npm' ? 'npx' : 'yarn run'} snyk-protect`,
  );
  if (
    snykProtectOutput.includes('No .snyk file found') ||
    snykProtectOutput.includes('Nothing to patch')
  ) {
    return false;
  }
  return true;
}

async function run() {
  console.info('Checking package.json project in the current directory.');
  const packageManager = await detectYarnOrNpm();
  if (!packageManager) {
    return exitWithMessage(
      'No package.json. You need to run this command only in a folder with an npm or yarn project',
      1,
    );
  }
  const snykPackageFound = await detectSnykInDependencies();
  if (!snykPackageFound) {
    return exitWithMessage(
      'There is no `snyk` package listed as a dependency. Nothing to upgrade.',
      0,
    );
  }

  await uninstallSnyk(packageManager);
  await installSnykProtect(packageManager);

  console.info('Updating package.json file.');
  fs.writeFileSync(
    'package.json',
    fs
      .readFileSync('package.json', 'utf8')
      .replace('snyk protect', 'snyk-protect'),
  );

  if (await isSnykProtectNeeded(packageManager)) {
    return exitWithMessage(
      `All done. Review and commit the changes to package.json and ${
        packageManager === 'npm' ? 'package-lock.json' : 'yarn.lock'
      }.`,
      0,
    );
  }

  return exitWithMessage(
    `All done. But we've detected that Snyk Protect is not patching anything. Review and commit the changes to package.json and ${
      packageManager === 'npm' ? 'package-lock.json' : 'yarn.lock'
    }.`,
    0,
  );
}

run();
