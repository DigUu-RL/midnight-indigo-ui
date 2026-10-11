// Fails when a compiled artifact was written inside the `src/` directory of any workspace.
import { existsSync, readdirSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot: string = fileURLToPath(new URL('..', import.meta.url));
const workspaceGroups: readonly string[] = ['packages', 'apps', 'templates', 'fixtures'];
const compiledArtifactPattern: RegExp = /\.(js|mjs|cjs|map|tsbuildinfo)$|\.d\.[mc]?ts$/;

const listFilesRecursively = (directory: string): string[] => {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent): string[] => {
    const entryPath: string = join(directory, entry.name);
    return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
  });
};

const listWorkspaceSourceDirectories = (groupDirectory: string): string[] => {
  return readdirSync(groupDirectory, { withFileTypes: true })
    .filter((workspace: Dirent): boolean => workspace.isDirectory())
    .map((workspace: Dirent): string => join(groupDirectory, workspace.name, 'src'))
    .filter((sourceDirectory: string): boolean => existsSync(sourceDirectory));
};

const offendingFiles: string[] = workspaceGroups
  .map((group: string): string => join(repositoryRoot, group))
  .filter((groupDirectory: string): boolean => existsSync(groupDirectory))
  .flatMap(listWorkspaceSourceDirectories)
  .flatMap(listFilesRecursively)
  .filter((file: string): boolean => compiledArtifactPattern.test(file))
  .map((file: string): string => relative(repositoryRoot, file));

const hasOffendingFiles: boolean = offendingFiles.length > 0;
const offendingFileLines: string[] = offendingFiles.map((file: string): string => `  - ${file}`);

const report: string = hasOffendingFiles
  ? ['Compiled artifacts found inside src/:', ...offendingFileLines].join('\n')
  : 'OK: no compiled artifacts inside src/.';

console[hasOffendingFiles ? 'error' : 'log'](report);
process.exitCode = hasOffendingFiles ? 1 : 0;
