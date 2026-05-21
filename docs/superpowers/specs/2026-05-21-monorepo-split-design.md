# Monorepo Split Design

## Goal

Refactor the repository into a pnpm monorepo with two publishable packages:

- `packages/finebicli`: the CLI implementation and tests
- `packages/skills`: the skill markdown assets

The repository root becomes a non-publishable workspace container.

## Target Structure

```text
.
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ docs/
├─ packages/
│  ├─ finebicli/
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ tsconfig.json
│  │  ├─ vitest.config.ts
│  │  ├─ .env.example
│  │  ├─ src/
│  │  └─ tests/
│  └─ skills/
│     ├─ package.json
│     ├─ README.md
│     ├─ SKILL.md
│     └─ skills/
```

## Package Boundaries

### `packages/finebicli`

- Owns all TypeScript source, tests, build scripts, and CLI publish metadata.
- Continues to publish the `finebi-cli` binary.
- Keeps runtime dependencies such as `axios`, `commander`, `dotenv`, and `finebi-querydata-sdk`.
- Keeps local test and TypeScript config unless a shared root config is clearly beneficial.

### `packages/skills`

- Owns the root `SKILL.md` plus the existing `skills/*/SKILL.md` tree.
- Publishes as a content-only package.
- Does not include CLI code or build output.

### Root workspace

- Must be `private: true`.
- Must not contain publish metadata for the old single-package release flow.
- Owns only workspace orchestration such as:
  - `pnpm-workspace.yaml`
  - optional convenience scripts that delegate into workspace packages
  - shared documentation

## Migration Plan

1. Convert the root `package.json` into a private workspace manifest.
2. Add `pnpm-workspace.yaml` for `packages/*`.
3. Create `packages/finebicli` and move the current CLI package contents into it.
4. Create `packages/skills` and move `SKILL.md` and `skills/` into it unchanged.
5. Update any moved package scripts and config paths so builds and tests run from the new package location.
6. Refresh root and package READMEs where paths or install instructions depend on the new layout.

## Validation

Validation for this refactor should stay targeted:

- `pnpm --filter finebicli typecheck`
- `pnpm --filter finebicli test`
- `git diff --check`

If any command cannot run because of existing repo state or missing local prerequisites, that should be reported explicitly.

## Non-Goals

- No behavioral refactor of existing CLI commands.
- No expansion to a third package such as `sdk` or `mcp-server`.
- No unrelated cleanup of legacy content beyond path fixes needed for the split.
