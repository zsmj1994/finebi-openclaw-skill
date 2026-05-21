# finebicli

A FineBI CLI package for data analysis and visualization workflows.

## Quick Start

```bash
npm install -g finebicli
finebi-cli init
finebi-cli query-dataset -k "Sales"
```

## Configuration

The CLI reads these environment variables:

- `FINEBI_BASE_URL`
- `FINEBI_USERNAME`
- `FINEBI_PASSWORD`
- `FINEBI_LIGHT_AUTH_TOKEN` (optional)
- `FINE_AUTH_TOKEN` (optional)

You can create them with `finebi-cli init` or by writing a `.env` file manually.

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
