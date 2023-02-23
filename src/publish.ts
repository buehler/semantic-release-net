import { glob } from 'glob';
import { join } from 'path';
// @ts-expect-error
import { Context } from 'semantic-release';
import { exec, PluginConfig, SemanticReleaseError } from './utils.js';

async function publish(args: string[]) {
  const { stdout, stderr, exitCode } = await exec(args);
  if (exitCode !== 0) {
    throw new SemanticReleaseError('dotnet nuget push failed', 'EDOTNETNUGETPUBLISH', stderr);
  }

  return stdout;
}

/**
 * Execute `dotnet nuget publish` with the found artifacts.
 */
export default async function (
  { additionalPublishArgs = [], configuration = 'Release', sources }: PluginConfig,
  { logger, env }: Context
) {
  logger.info('Publish nuget packages.');

  const dir = env['GITHUB_WORKSPACE'] ?? process.cwd();
  const files = glob.sync(`**/bin/${configuration}/*.nupkg`, {
    cwd: dir,
  });
  const packages = [] as string[];
  for (const file of files) {
    logger.debug(`Found package: ${file}`);
    packages.push(join(dir, file));
  }

  if (packages.length === 0) {
    logger.error(`No packages found in ${dir}`);
    throw new SemanticReleaseError('No packages found', 'ENOARTIFACTS', `No packages found in ${dir}`);
  }

  const baseArgs = ['nuget', 'push', ...packages, ...additionalPublishArgs];
  function source(url: string, apiKey: string) {
    return ['--source', url, '--api-key', apiKey];
  }

  if (!sources) {
    logger.info('No sources configured, using default to nuget.org with NUGET_TOKEN.');
    const output = await publish([...baseArgs, ...source('https://api.nuget.org/v3/index.json', env['NUGET_TOKEN'])]);
    logger.info(output);
  } else {
    for (const { url, apiKeyEnvVar } of sources) {
      logger.info(`Publishing to ${url} with key from ${apiKeyEnvVar}.`);
      const output = await publish([...baseArgs, ...source(url, env[apiKeyEnvVar])]);
      logger.info(output);
    }
  }
}
