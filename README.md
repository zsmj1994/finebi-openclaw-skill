# finebi-openclaw-skill workspace

This repository is a pnpm monorepo with three publishable packages:

- `packages/querydata-sdk`: publishes `finebi-querydata-sdk`
- `packages/finebicli`: publishes `finebi-cli`
- `packages/skills`: publishes `finebi-skills`

## Workspace commands

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm pack:all
```

## Packages

- SDK package: [packages/querydata-sdk/README.md](./packages/querydata-sdk/README.md)
- CLI package: [packages/finebicli/README.md](./packages/finebicli/README.md)
- Skills package: [packages/skills/README.md](./packages/skills/README.md)
- Release guide: [docs/release.md](./docs/release.md)

## Release shortcuts

```bash
pnpm release:check:sdk
pnpm release:check:cli
pnpm release:check:core
pnpm pack:sdk
pnpm pack:cli
pnpm pack:skills
pnpm publish:sdk
pnpm publish:cli
pnpm publish:core
pnpm publish:skills
pnpm publish:all
```
