# finebi-cli

`finebi-cli` is the publishable CLI package in this monorepo. It provides command-line access to FineBI data analysis, exports, and dashboard workflows.

## Quick Start

```bash
npm install -g finebi-cli
finebi-cli init
finebi-cli query-dataset -k "Sales"
```

## Package contents

- CLI executable: `finebi-cli`
- Published files: `dist`, `README.md`, `.env.example`

## Configuration

The CLI reads these environment variables:

- `FINEBI_BASE_URL`
- `FINEBI_USERNAME`
- `FINEBI_PASSWORD`
- `FINEBI_LIGHT_AUTH_TOKEN` (optional)
- `FINE_AUTH_TOKEN` (optional)

You can create them with `finebi-cli init` or by writing a `.env` file manually.

## Release checks

Before publishing this package, run:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm pack
```

## Release note

- `finebi-cli` consumes `finebi-querydata-sdk` as a normal npm dependency at publish time.
- In this workspace the dependency is declared as `workspace:*`, but `pnpm pack` and `pnpm publish` rewrite it to the current published SDK version range.
- If the CLI depends on a new SDK release, publish `finebi-querydata-sdk` first and then publish `finebi-cli`.

## Available CLI commands

- `init`
- `get-entry-tree`
- `get-published-subject-resources`
- `search-my-datasets`
- `search-my-dashboards`
- `get-publick-datasets-list`
- `query-dataset`
- `preview-dataset-data`
- `get-widget-data`
- `export-dashboard-excel`
- `export-dashboard-pdf`
- `export-dashboard-image`
- `get-dashboard-user-info`
- `get-dashboards-by-subject`
- `get-dashboard-style`
- `get-dashboard-design-configure`
- `set-dashboard-style`

Run `finebi-cli <command> --help` for command-specific options.
