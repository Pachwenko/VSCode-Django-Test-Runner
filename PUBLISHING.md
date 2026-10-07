# Publishing

Publishing runs when a GitHub Release is published. The workflow verifies the extension, then publishes the same version to the Visual Studio Marketplace and Open VSX.

## Required GitHub environment

Create a GitHub Actions environment named `production`. Add these environment secrets:

| Secret | Used for |
| --- | --- |
| `VSCE_PAT` | Visual Studio Marketplace publishing |
| `OPEN_VSX_TOKEN` | Open VSX publishing for Cursor, Windsurf, and VSCodium |

Do not place either token in this repository, a local `.env` file, an issue, or a command-line argument.

## Visual Studio Marketplace token

The current workflow uses an Azure DevOps Personal Access Token:

1. Sign in to the Azure DevOps organization associated with the `Pachwenko` Marketplace publisher.
2. Create a token with the Marketplace **Manage** scope and an expiration date.
3. Save it as the `VSCE_PAT` secret in the `production` GitHub environment.
4. Record the expiration date somewhere private so the token can be rotated before it expires.

Microsoft is retiring global Azure DevOps PATs on December 1, 2026. This workflow must be migrated to Microsoft Entra ID workload identity before that deadline. See the official publishing documentation: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Open VSX token

1. Sign in to https://open-vsx.org/ and open **Settings > Access Tokens**.
2. Generate a token specifically for GitHub Actions.
3. Confirm the account can publish to the `Pachwenko` namespace.
4. Save it as the `OPEN_VSX_TOKEN` secret in the `production` GitHub environment.

Open VSX also supports secretless trusted publishing through GitHub OIDC. That is a good follow-up once the token-based release is verified: https://github.com/eclipse-openvsx/openvsx/blob/main/cli/README.md#trusted-publishing

## Release checklist

1. Update `package.json` and `CHANGELOG.md` to the same version.
2. Run `npm ci`.
3. Run `npm run lint`, `npx tsc --noEmit`, and `npm run test:unit`.
4. Run `npm run compile` followed by `npm run test:integration`.
5. Run `npm run package` and `npx @vscode/vsce package --no-dependencies`.
6. Push the release commit and publish a GitHub Release tagged `v<version>`.
7. Verify the GitHub Actions publish job and both marketplace listings.

Never test publishing by reusing an existing version number. Both registries treat released versions as immutable.
