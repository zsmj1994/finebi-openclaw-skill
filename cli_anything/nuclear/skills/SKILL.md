---
name: finebi-cli
description: CLI harness for FineDC / Nuclear BI Platform – manage reports, dashboards, exports, data center queries, spider updates, and scheduling.
version: 1.0.0
tools:
  - python3
  - requests
  - click
commands:
  - finebi-cli auth login --url <url> --user <user> --password <password>
  - finebi-cli auth logout
  - finebi-cli auth status
  - finebi-cli config set-base-url <url>
  - finebi-cli config set-token <token>
  - finebi-cli config show
  - finebi-cli report list --subject-id <id>
  - finebi-cli report info --report-ids <ids>
  - finebi-cli report create --data <encrypted_data>
  - finebi-cli report rename --info <encrypted_info>
  - finebi-cli report delete --report-id <id>
  - finebi-cli report save-as --report-id <id> --new-name <name>
  - finebi-cli report consanguinity --report-id <id>
  - finebi-cli report check
  - finebi-cli dashboard list --subject-id <id>
  - finebi-cli dashboard shared
  - finebi-cli dashboard share --report-id <id> --user-id <userid>
  - finebi-cli dashboard widget-data --report-id <id> --widget-id <widgetid>
  - finebi-cli export png --report-id <id> --widget-id <widgetid> --output <path>
  - finebi-cli export excel --report-id <id> --widget-id <widgetid> --output <path>
  - finebi-cli export pdf --report-id <id> --widget-id <widgetid> --output <path>
  - finebi-cli package list
  - finebi-cli package create --group-id <id> --name <name>
  - finebi-cli package delete --item-ids <ids>
  - finebi-cli package rename --pack-id <id> --new-name <name>
  - finebi-cli package structure --pack-id <id> --with-tables
  - finebi-cli data folders
  - finebi-cli data folder-tree --folder-id <id>
  - finebi-cli data table-preview --table-name <name>
  - finebi-cli data table-structure --table-name <name>
  - finebi-cli data model --model-id <id>
  - finebi-cli data query --body '<json>'
  - finebi-cli data preview --body '<json>'
  - finebi-cli data search-tables --body '<json>'
  - finebi-cli data search-fields --body '<json>'
  - finebi-cli data field-data --body '<json>'
  - finebi-cli data field-range --body '<json>'
  - finebi-cli spider generate
  - finebi-cli spider update --info <encrypted_info>
  - finebi-cli spider batch --tasks '<json_array>'
  - finebi-cli spider status --task-instance-id <id>
  - finebi-cli schedule tree
environment:
  FINEBI_BASE_URL: FineDC server base URL
  FINEBI_TIMEOUT: Request timeout in seconds
notes:
  - All commands support --json for machine-readable output
  - Auth token is stored at ~/.finebi-cli/config.json (cookie or JWT)
  - Default base URL: http://localhost:8080/bi
  - Spider engine handles ETL-based data extraction; Direct engine handles real-time queries
---

# SKILL.md – cli-anything-nuclear

`cli-anything-nuclear` is the official CLI harness for the **FineDC / Nuclear BI Platform**.
It provides a stateful, scriptable interface to manage BI reports, dashboards, exports, data center
queries, spider ETL updates, and scheduling – replacing manual web UI operations with
automated CLI workflows.

## Installation

```bash
pip install finebi-cli
# or from source:
cd finebi-cli
pip install -e .
```

## Quick Start

```bash
# 1. Authenticate
nuclear auth login --url http://localhost:8080/bi --user admin --password admin

# 2. List reports
nuclear report list --subject-id 1

# 3. Export a report as PDF
nuclear export pdf --report-id 123 --output report.pdf

# 4. Check auth status
nuclear auth status
```

## Command Groups

### `nuclear auth`
Authentication management. Stores JWT/cookie tokens in `~/.nuclear-cli/config.json`.

| Command | Description |
|---------|-------------|
| `nuclear auth login` | Login with username/password |
| `nuclear auth logout` | Clear credentials |
| `nuclear auth status` | Show current auth state |

### `nuclear config`
CLI configuration. Useful for pre-setting the server URL and auth token.

| Command | Description |
|---------|-------------|
| `nuclear config set-base-url <url>` | Set default base URL |
| `nuclear config set-token <token>` | Set JWT auth token |
| `nuclear config show` | Display current config |

### `nuclear report`
Report CRUD and lifecycle management.

| Command | Description |
|---------|-------------|
| `nuclear report list --subject-id <id>` | List reports for a subject |
| `nuclear report info --report-ids <ids>` | Get report details |
| `nuclear report create --data <data>` | Create a new report |
| `nuclear report rename --info <info>` | Rename a report |
| `nuclear report delete --report-id <id>` | Delete a report |
| `nuclear report save-as --report-id <id> --new-name <name>` | Save as copy |
| `nuclear report consanguinity --report-id <id>` | Report lineage analysis |
| `nuclear report check` | Check report state |

### `nuclear dashboard`
Dashboard operations and sharing.

| Command | Description |
|---------|-------------|
| `nuclear dashboard list --subject-id <id>` | List dashboards |
| `nuclear dashboard shared` | List shared dashboards |
| `nuclear dashboard share --report-id <id>` | Create public link |
| `nuclear dashboard widget-data --report-id <id> --widget-id <id>` | Get widget data |

### `nuclear export`
Export reports in various formats.

| Command | Description |
|---------|-------------|
| `nuclear export png --report-id <id> --output <path>` | Export as PNG |
| `nuclear export excel --report-id <id> --output <path>` | Export as Excel |
| `nuclear export pdf --report-id <id> --output <path>` | Export as PDF |

### `nuclear package`
Folder/package management for organizing BI content.

| Command | Description |
|---------|-------------|
| `nuclear package list` | List root folders |
| `nuclear package create --group-id <id> --name <name>` | Create folder |
| `nuclear package delete --item-ids <ids>` | Delete folders |
| `nuclear package rename --pack-id <id> --new-name <name>` | Rename folder |
| `nuclear package structure --pack-id <id> --with-tables` | Get folder structure |

### `nuclear data`
Data Center API – query folders, tables, models, and field data.

| Command | Description |
|---------|-------------|
| `nuclear data folders` | List first-level folders |
| `nuclear data folder-tree --folder-id <id>` | Full tree under folder |
| `nuclear data table-preview --table-name <name>` | Preview table rows |
| `nuclear data table-structure --table-name <name>` | Table schema |
| `nuclear data model --model-id <id>` | Data model definition |
| `nuclear data query --body '<json>'` | Execute data model query |
| `nuclear data preview --body '<json>'` | Paginated data preview |
| `nuclear data search-tables --body '<json>'` | Search tables by keyword |
| `nuclear data search-fields --body '<json>'` | Search fields by keyword |
| `nuclear data field-data --body '<json>'` | Get field values |
| `nuclear data field-range --body '<json>'` | Get field min/max range |

### `nuclear spider`
Spider ETL engine – trigger and monitor data updates.

| Command | Description |
|---------|-------------|
| `nuclear spider generate` | Trigger global spider update |
| `nuclear spider update --info <info>` | Update specific package/table |
| `nuclear spider batch --tasks '<json>'` | Batch update tasks |
| `nuclear spider status --task-instance-id <id>` | Check task status |

### `nuclear schedule`
BI task scheduling – manage scheduled report jobs.

| Command | Description |
|---------|-------------|
| `nuclear schedule tree` | Get reports tree for scheduling |

## Global Options

| Option | Description |
|--------|-------------|
| `--json` | Output raw JSON (great for piping to `jq` or other tools) |
| `--url <url>` | Override the configured base URL for this command |
| `--timeout <sec>` | Override the request timeout |
| `--version` / `-v` | Print CLI version |

## JSON Output Example

```bash
nuclear --json report list --subject-id 1 | jq '.[] | select(.status == "active")'
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUCLEAR_BASE_URL` | Default base URL (used if not configured) |
| `NUCLEAR_TIMEOUT` | Default request timeout in seconds |

## Workflow Examples

### Full Report Lifecycle
```bash
nuclear auth login --url http://bi.company.com --user analyst --password secret
nuclear report list --subject-id analytics
nuclear export pdf --report-id r-456 --output monthly-report.pdf
nuclear export excel --report-id r-456 --output monthly-report.xlsx
nuclear auth logout
```

### Data Exploration
```bash
nuclear auth login --url http://bi.company.com --user dataeng --password secret
nuclear data folders
nuclear data folder-tree --folder-id f-001
nuclear data table-preview --table-name sales_2024
nuclear data search-tables --body '{"keyword": "revenue"}'
nuclear data query --body '{"modelId": "m-123", "fields": ["region", "amount"]}'
```

### Spider ETL Automation
```bash
nuclear auth login --url http://bi.company.com --user admin --password secret
nuclear spider generate
# Poll status
nuclear spider status --task-instance-id ti-789
# Batch update multiple tables
nuclear spider batch --tasks '[{"tableId": "t1"}, {"tableId": "t2"}]'
```

### Configuration for CI/CD
```bash
# Set base URL and token once
nuclear config set-base-url http://bi.company.com
nuclear config set-token "$BI_API_TOKEN"
# Subsequent commands use stored config
nuclear export pdf --report-id "$REPORT_ID" --output /artifacts/report.pdf
```
