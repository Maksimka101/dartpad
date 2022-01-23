import * as fs from 'fs/promises';

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