export async function exec(args: string[] = [], executable?: string) {
  const { execa } = await import('execa');
  const { stdout, stderr, exitCode } = await execa(executable ?? 'dotnet', args);
  return { stdout, stderr, exitCode };
}

export type PluginConfig = {
  configuration?: 'Release' | 'Development';
  pack?: boolean;
  additionalPackArgs?: string[];
  sources?: { url: string; apiKeyEnvVar: string }[];
  additionalPublishArgs?: string[];
};

export class SemanticReleaseError extends Error {
  public readonly semanticRelease = true;
  public readonly code: string;
  public readonly details?: string;

  constructor(message: string, code: string, details?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'SemanticReleaseError';
    this.code = code;
    this.details = details;
  }
}
