# CLI Command Map

This file records the FineBI CLI commands that skills should reference first.

## Command contracts

For field semantics, workflow-only fields, and common follow-up chains, see:

- `command-contracts/get-entry-tree.md`
- `command-contracts/get-published-subject-resources.md`
- `command-contracts/get-widget-data.md`
- `command-contracts/query-dataset.md`
- `command-contracts/preview-dataset-data.md`

## Workflow guides

For multi-step command chains, see:

- `published-subject-resource-flow.md`
- `dashboard-widget-data-flow.md`

## Dashboard

- `search-my-dashboards`
- `get-dashboard-user-info`
- `get-dashboards-by-subject`
- `get-widget-data`
- `get-dashboard-style`
- `get-dashboard-design-configure`
- `set-dashboard-style`
- `export-dashboard-excel`
- `export-dashboard-pdf`
- `export-dashboard-image`

## Dataset

- `search-my-datasets`
- `get-publick-datasets-list`
- `query-dataset`
- `preview-dataset-data`

## Subject and Entry

- `get-entry-tree`
- `get-published-subject-resources`

## Usage rule

- Skills should prefer the CLI command names listed here.
- If a workflow needs extra behavior that does not exist in the CLI yet, write it as “missing CLI capability” instead of inventing a fake command.
- The main skill should not promise CLI commands that do not exist.
