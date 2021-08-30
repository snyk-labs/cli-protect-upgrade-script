const fse = require('fs-extra');
import { SpawnOptionsWithoutStdio } from 'child_process';
import { spawn } from 'cross-spawn';
const path = require('path');
const os = require('os');

export class TestFixture {
  private constructor(
    private tempFolder: string,
    public fixtureTempPath: string,
  ) {}

  public static async createTestFixture(fixture: string): Promise<TestFixture> {
    const tempFolder = await fse.promises.realpath(
      await fse.promises.mkdtemp(
        path.resolve(
          os.tmpdir(),
          `cli-protect-upgrade-script-test-${fixture.replace(/[/\\]/g, '-')}-`,
        ),
      ),
    );

    const fixturePath = path.resolve(__dirname, 'fixtures', fixture);
    const tempFixturePath = path.resolve(tempFolder, fixture);
    await fse.copy(fixturePath, tempFixturePath);
    return new TestFixture(tempFolder, tempFixturePath);
  }

  public async read(filePath: string): Promise<string> {
    const fullFilePath = path.resolve(this.fixtureTempPath, filePath);
    return await fse.readFile(fullFilePath, 'utf-8');
  }

  public async readObj(filePath: string): Promise<any> {
    const fullFilePath = path.resolve(this.fixtureTempPath, filePath);
    return JSON.parse(await fse.readFile(fullFilePath, 'utf-8'));
  }

  public async packageJsonObj(): Promise<any> {
    const fullFilePath = path.resolve(this.fixtureTempPath, 'package.json');
    return JSON.parse(await fse.readFile(fullFilePath, 'utf-8'));
  }

  public async remove() {
    return await fse.remove(this.tempFolder);
  }

  public async exec(
    command: string,
    args: string[],
  ): Promise<RunCommandResult> {
    const res = await runCommand(command, args, {
      cwd: this.tempFolder,
    });
    return res;
  }

  public async execUpgradeScript(args?: string[]): Promise<RunCommandResult> {
    const command = 'node';
    const binPath = path.resolve(process.cwd(), 'bin/cli-protect-upgrade');
    const allArgs = args ? [binPath, ...args] : [binPath];
    const res = await runCommand(command, allArgs, {
      cwd: this.fixtureTempPath,
    });
    return res;
  }
}

type RunCommandResult = {
  code: number;
  stdout: string;
  stderr: string;
};

type RunCommandOptions = SpawnOptionsWithoutStdio;

async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<RunCommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.on('error', (error) => {
      reject(error);
    });

    child.stdout.on('data', (chunk) => {
      stdout.push(Buffer.from(chunk));
    });

    child.stderr.on('data', (chunk) => {
      stderr.push(Buffer.from(chunk));
    });

    child.on('close', (code) => {
      resolve({
        code: code || 0,
        stdout: Buffer.concat(stdout).toString('utf-8'),
        stderr: Buffer.concat(stderr).toString('utf-8'),
      });
    });
  });
}
