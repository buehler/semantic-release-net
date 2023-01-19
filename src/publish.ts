import { execa } from 'execa';
import { readdir } from 'fs/promises';
import { Context } from 'semantic-release';
import { PluginConfig, SemanticReleaseError } from './utils.js';

async function publish(args: string[]) {
  const { stderr, exitCode } = await execa('dotnet', args);
  if (exitCode !== 0) {
    throw new SemanticReleaseError('dotnet nuget push failed', 'EDOTNETNUGETPUBLISH', stderr);
  }
}

/**
 * Execute `dotnet nuget publish` with the found artifacts.
 */
export default async function (
  { additionalPublishArgs = [], outDir = './artifacts', sources }: PluginConfig,
  { logger, env }: Context
) {
  logger.info('Publish nuget packages.');

  const packages = [] as string[];
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.nupkg')) {
      packages.push(file);
    }
  }

  if (packages.length === 0) {
    logger.error(`No packages found in ${outDir}`);
    throw new SemanticReleaseError('No packages found', 'ENOARTIFACTS', `No packages found in ${outDir}`);
  }

  const baseArgs = ['nuget', 'push', ...packages, ...additionalPublishArgs];
  function source(url: string, apiKey: string) {
    return ['--source', url, '--api-key', apiKey];
  }

  if (!sources) {
    logger.info('No sources configured, using default to nuget.org with NUGET_TOKEN.');
    await publish([...baseArgs, ...source('https://api.nuget.org/v3/index.json', env['NUGET_TOKEN'])]);
  } else {
    for (const { url, apiKeyEnvVar } of sources) {
      logger.info(`Publishing to ${url} with key from ${apiKeyEnvVar}.`);
      await publish([...baseArgs, ...source(url, env[apiKeyEnvVar])]);
    }
  }
}
