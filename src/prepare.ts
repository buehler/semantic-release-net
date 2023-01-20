import { execa } from 'execa';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Context } from 'semantic-release';
import { PluginConfig, SemanticReleaseError } from './utils.js';

/**
 * Execute `dotnet pack` with the version to create the nuget packages.
 */
export default async function (
  { pack = true, additionalPackArgs = [], outDir = './artifacts', configuration = 'Release' }: PluginConfig,
  { logger, nextRelease }: Context
) {
  if (pack) {
    const dir = join(process.cwd(), outDir);
    logger.info(`Preparing nuget packages. Store them in: ${dir}`);
    const version = nextRelease?.version ?? '0.0.0';
    const notes = (nextRelease?.notes ?? '').replaceAll(',', '%2c').replaceAll(';', '%3b').substring(0, 30000);
    const { stdout, stderr, exitCode } = await execa('dotnet', [
      'pack',
      '--configuration',
      configuration,
      '--output',
      dir,
      ...additionalPackArgs,
      `/property:Version=${version}`,
      `/property:PackageReleaseNotes='${notes}'`,
    ]);
    logger.debug(stdout);

    for (const file of await readdir(dir)) {
      if (file.endsWith('.nupkg')) {
        logger.info(`Created package: ${file}`);
      }
    }

    if (exitCode !== 0) {
      throw new SemanticReleaseError('dotnet pack command failed', 'EDOTNETPACK', stderr);
    }
  }
}
