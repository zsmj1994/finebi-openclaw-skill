# Release Guide

This workspace publishes three npm packages:

- `finebi-querydata-sdk`
- `finebi-cli`
- `finebi-skills`

## Version strategy

- `finebi-querydata-sdk` and `finebi-cli` use independent versions.
- `finebi-cli` depends on `finebi-querydata-sdk` through `workspace:*` during local development.
- When `finebi-cli` is packed or published, pnpm replaces `workspace:*` with the current SDK version range in the tarball metadata.

## Release order

If both SDK and CLI change, always publish in this order:

1. Update `packages/querydata-sdk/package.json` version and publish `finebi-querydata-sdk`.
2. If `finebi-cli` needs the new SDK version, update `packages/finebicli/package.json` version and dependency range, then publish `finebi-cli`.
3. Publish `finebi-skills` separately when it has changes.

## Verification commands

Run targeted checks before publishing:

```bash
pnpm run release:check:sdk
pnpm run release:check:cli
git diff --check
```

If you are releasing both packages together:

```bash
pnpm run release:check:core
git diff --check
```

## Publish commands

Publish packages individually:

```bash
pnpm run publish:sdk
pnpm run publish:cli
pnpm run publish:skills
```

Publish SDK and CLI in order:

```bash
pnpm run publish:core
```

Publish every public package in the workspace:

```bash
pnpm run publish:all
```
