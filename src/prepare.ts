import { execa } from 'execa';
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
    logger.info('Preparing nuget packages');
    const version = nextRelease?.version ?? '0.0.0';
    const notes = (nextRelease?.notes ?? '').replaceAll(',', '%2c').replaceAll(';', '%3b').substring(0, 30000);
    const { stderr, exitCode } = await execa('dotnet', [
      'pack',
      '--configuration',
      configuration,
      '--output',
      outDir,
      ...additionalPackArgs,
      `/property:Version=${version}`,
      `/property:PackageReleaseNotes='${notes}'`,
    ]);

    if (exitCode !== 0) {
      throw new SemanticReleaseError('dotnet pack command failed', 'EDOTNETPACK', stderr);
    }
  }
}
