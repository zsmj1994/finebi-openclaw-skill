# finebi-openclaw-skill workspace

This repository is a pnpm monorepo with two publishable packages:

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

- CLI package: [packages/finebicli/README.md](./packages/finebicli/README.md)
- Skills package: [packages/skills/README.md](./packages/skills/README.md)

## Release shortcuts

```bash
pnpm pack:cli
pnpm pack:skills
pnpm publish:cli
pnpm publish:skills
```
