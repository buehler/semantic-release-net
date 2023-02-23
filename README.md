# semantic release net

Semantic release plugin to publish .NET packages to NuGet sources.
Performs the following actions:

- verifyConditions: Checks if the default nuget token (`NUGET_TOKEN`) is set,
  or if sources are set, if the corresponding tokens are set.
- prepare: Creates the NuGet packages using `dotnet pack` with the corresponding new
  version and release notes.
- publish: Publishes the NuGet packages to the configured NuGet sources.

Packages are created in their corresponding `bin/$(Configuration)/` folder.
To enable / disable package creation, you can set the `<IsPackable>true</IsPackable>`
option in the `.csproj` file.

## Configuration

If _no_ sources are configured, the `NUGET_TOKEN` env var must be set.
The default nuget source (`https://api.nuget.org/v3/index.json`) is used in this case.

### Options

- `configuration`: The configuration to use for `dotnet pack` (default: `Release`)
- `pack`: Whether the plugin should run `dotnet pack` (default: `true`)
- `additionalPackArgs`: Array of strings to pass as additional arguments to `dotnet pack`
- `additionalPublishArgs`: Array of strings to pass as additional arguments to `dotnet nuget push`
- `sources`: Array of sources to publish to. Each source must have the following properties:
  - `url`: The url of the source
  - `apiKeyEnvVar`: The name of the environment variable that contains the API key for the source

```typescript
// Type definition of the plugin options
export type PluginConfig = {
  configuration?: 'Release' | 'Development';
  pack?: boolean;
  additionalPackArgs?: string[];
  sources?: { url: string; apiKeyEnvVar: string }[];
  additionalPublishArgs?: string[];
};
```

#### Configuration example when using default nuget

```jsonc
// .releaserc.json example
{
  "plugins": [
    [
      "semantic-release-dotnet",
      {
        "configuration": "Release",
        "pack": true,
        "additionalPackArgs": ["/property:PackageIcon=icon.png"],
        "additionalPublishArgs": ["--skip-duplicates"]
      }
    ]
  ]
}
```

#### Configuration example when specifying sources

```jsonc
// .releaserc.json example
{
  "plugins": [
    [
      "semantic-release-dotnet",
      {
        // key/value config of the other example...
        "sources": [
          {
            "url": "https://api.nuget.org/v3/index.json",
            "apiKeyEnvVar": "NUGET_TOKEN"
          },
          {
            "url": "https://nuget.pkg.github.com/buehler/index.json",
            "apiKeyEnvVar": "GH_NUGET_TOKEN"
          }
        ]
      }
    ]
  ]
}
```
