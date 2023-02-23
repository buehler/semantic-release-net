import { glob } from 'glob';
// @ts-expect-error
import { Context } from 'semantic-release';
import { exec, PluginConfig, SemanticReleaseError } from './utils.js';

/**
 * Execute `dotnet pack` with the version to create the nuget packages.
 */
export default async function (
  { pack = true, additionalPackArgs = [], configuration = 'Release' }: PluginConfig,
  { logger, env, nextRelease }: Context
) {
  if (pack) {
    logger.info(`Preparing nuget packages.`);
    const version = nextRelease?.version ?? '0.0.0';
    logger.debug(`New Version: ${version}`);
    const notes = (nextRelease?.notes ?? '').replaceAll(',', '%2c').replaceAll(';', '%3b').substring(0, 30000);
    logger.debug(`Release Notes: ${notes}`);
    logger.debug(
      `Exec Command: dotnet pack --configuration ${configuration} ${additionalPackArgs.join(
        ' '
      )} /property:Version=${version} /property:PackageReleaseNotes='${notes}' ${env['GITHUB_WORKSPACE'] ?? process.cwd()}`
    );
    const { stdout, stderr, exitCode } = await exec([
      'pack',
      '--configuration',
      configuration,
      ...additionalPackArgs,
      `/property:Version=${version}`,
      `/property:PackageReleaseNotes='${notes}'`,
      env['GITHUB_WORKSPACE'] ?? process.cwd(),
    ]);
    logger.info(stdout);

    const files = glob.sync(`**/bin/${configuration}/*.nupkg`, {
      cwd: env['GITHUB_WORKSPACE'] ?? process.cwd(),
    });
    for (const file of files) {
      logger.info(`Created package: ${file}`);
    }

    if (exitCode !== 0) {
      throw new SemanticReleaseError('dotnet pack command failed', 'EDOTNETPACK', stderr);
    }
  }
}
