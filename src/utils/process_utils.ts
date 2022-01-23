import * as process from 'child-process-promise';
import { ExecOptions } from 'child_process';

/// Throws exception if command doesn't exist
export async function ensureCommandExist(commandName: string): Promise<void> {
  let command = await process.exec(commandName);

  if (command.childProcess.exitCode !== 0) {
    throw new CommandDoesNotExist();
  }
}

/// Executes command.
///
/// Throws exception if command doesn't exist
export async function executeCommand(command: string, options?: ExecOptions): Promise<string> {
  await ensureCommandExist(command.split(" ")[0]);

  let processResult = await process.exec(command, options);

  return processResult.stdout;
}

/// Installs uninstalled dart/flutter packages.
export async function installPackagesIfNeeded(options: InstallPackagesOptions) {
  let pubCommand = options.flutterPackages ? 'flutter pub' : 'dart pub';

  let installedPackages = await getInstalledPackages(pubCommand, options.cwd);

  let packagesToInstall = options.packages;
  packagesToInstall.filter((pkg) => installedPackages.includes(pkg));

  for (let pkg of packagesToInstall) {
    try {
      await executeCommand(`${pubCommand} add ${pkg}`, { cwd: options.cwd });
    } catch {
      console.error(`Trying to install already installed package: ${pkg}`);
    }
  }
}

async function getInstalledPackages(pubCommand: string, cwd: string): Promise<Array<string>> {
  let installedPackagesJson: InstalledPackages = JSON.parse(await executeCommand(`${pubCommand} deps --json`, { cwd: cwd }));

  let packages: Array<string> = [];

  installedPackagesJson.packages.forEach((info) => {
    if (info.kind === 'direct') {
      packages.push(info.name);
    }
  });

  return packages;
}

interface InstalledPackages {
  packages: Array<PackageInfo>;
}

interface PackageInfo {
  name: string;
  version: string;
  kind: string;
}

export interface InstallPackagesOptions {
  flutterPackages: boolean,
  cwd: string,
  packages: Array<string>,
}

export class CommandDoesNotExist { }
