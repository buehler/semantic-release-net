import { Context } from 'semantic-release';
import { PluginConfig, SemanticReleaseError } from './utils.js';
import { execa } from 'execa';

/**
 * Verify that the dotnet executable is available and that the required environment variables are set.
 * If multiple sources are set via config, all of them must have an API key environment variable set.
 */
export default async ({ sources }: PluginConfig, { logger, env }: Context) => {
  try {
    const { stdout } = await execa('dotnet', ['--version']);
    logger.info(`dotnet version: ${stdout}`);
  } catch (e: any) {
    logger.error(e);
    throw new SemanticReleaseError('dotnet version command failed', 'EDOTNETEXECUTABLE', e.message);
  }

  if (!sources) {
    logger.debug('No sources specified, check default.');
    if (!env['NUGET_TOKEN']) {
      logger.error('No sources specified and no NUGET_TOKEN environment variable found.');
      throw new SemanticReleaseError(
        'No NUGET_TOKEN environment variable found.',
        'ENOREGISTRYTOKEN',
        'To access the default nuget source, a NUGET_TOKEN must be defined.'
      );
    }
  } else {
    logger.debug('Sources specified, check if all variables are present.');
    for (const { url, apiKeyEnvVar } of sources) {
      logger.debug(`Check source ${url}`);
      if (!env[apiKeyEnvVar]) {
        logger.error(`No API key environment variable found for source ${url}.`);
        throw new SemanticReleaseError(
          `No API key for source ${url} set`,
          'ENOREGISTRYTOKEN',
          `To access the nuget source ${url}, a ${apiKeyEnvVar} environment variable must be defined.`
        );
      }
    }
  }
};
