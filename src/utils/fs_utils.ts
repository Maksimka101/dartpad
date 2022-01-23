import * as fs from 'fs/promises';
import * as vscode from 'vscode';

export async function isExist(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function initializeCacheDirIfNeeded(cachePath: string) {
  if (!await isExist(cachePath)) {
    await fs.mkdir(cachePath);
  }
}

export function getExtensionConfiguration(): ExtensionConfiguration {
  let configuration = vscode.workspace.getConfiguration('dartPad');

  return {
    dartPackages: configuration.get<Array<string>>('dartPackages') ?? [],
  };
}

export interface ExtensionConfiguration {
  dartPackages: Array<string>;
}