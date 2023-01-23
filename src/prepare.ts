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
  { logger, env, nextRelease }: Context
) {
  if (pack) {
    const dir = join(env['GITHUB_WORKSPACE'] ?? process.cwd(), outDir);
    logger.info(`Preparing nuget packages. Store them in: ${dir}`);
    const version = nextRelease?.version ?? '0.0.0';
    logger.debug(`New Version: ${version}`);
    const notes = (nextRelease?.notes ?? '').replaceAll(',', '%2c').replaceAll(';', '%3b').substring(0, 30000);
    logger.debug(`Release Notes: ${notes}`);
    logger.debug(
      `Exec Command: dotnet pack --configuration ${configuration} --output ${dir} ${additionalPackArgs.join(
        ' '
      )} /property:Version=${version} /property:PackageReleaseNotes='${notes}' ${env['GITHUB_WORKSPACE'] ?? process.cwd()}`
    );
    const { stdout, stderr, exitCode } = await execa('dotnet', [
      'pack',
      '--configuration',
      configuration,
      '--output',
      dir,
      ...additionalPackArgs,
      `/property:Version=${version}`,
      `/property:PackageReleaseNotes='${notes}'`,
      env['GITHUB_WORKSPACE'] ?? process.cwd(),
    ]);
    logger.info(stdout);

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
