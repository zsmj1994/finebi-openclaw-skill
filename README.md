# finebi-cli

**CLI harness for FineDC / Nuclear BI Platform**. It automates report management,
dashboard operations, exports, subject and table exploration, data center queries,
spider ETL updates, and scheduling from the command line.

## Overview

FineDC / Nuclear-All is an enterprise BI platform from FanRuan (帆软). This CLI wraps
the platform's HTTP APIs into a stateful, scriptable command-line interface suitable
for local debugging, automation, and agent workflows.

The platform uses a dual-engine model:

- **Spider engine**: ETL-style extraction into a warehouse
- **Direct engine**: real-time querying against data sources

## Features

- **Stateful auth**: JWT/cookie tokens stored in `~/.finebi-cli/config.json`
- **Report lifecycle**: create, list, rename, delete, save-as, lineage analysis
- **Dashboard operations**: list dashboards, share dashboards, inspect widget data
- **Export support**: PNG, Excel, PDF
- **Subject and table exploration**: browse BI content and metadata
- **Data Center API access**: folders, tables, models, previews, search
- **Spider ETL automation**: trigger and monitor updates
- **Scheduling support**: inspect schedulable BI report trees
- **Decision platform entry tree**: browse the directory of published templates (Decision platform)
- **Machine-readable output**: `--json` for scripting and agent use

## Platform Architecture

### Core platform modules

| Module | Purpose |
|--------|---------|
| `nuclear-web` | Web UI and REST API layer |
| `nuclear-base` | Base utilities and shared code |
| `nuclear-spider` | Data collection / ETL engine |
| `nuclear-spider-foundation` | Spider foundation utilities |
| `nuclear-spider-project` | Spider project implementation |
| `nuclear-spider-adapter` | Spider adapter interfaces |
| `nuclear-query` | Query processing engine |
| `nuclear-query-adapter` | Query adapter interfaces |
| `nuclear-decision` | Core BI decision components |
| `nuclear-foundation-project` | Foundation project framework |
| `nuclear-foundation-connector` | Data source connectors |
| `nuclear-ai` | AI/ML capabilities |
| `nuclear-cluster` | Clustering and HA |
| `nuclear-excel` | Excel integration |
| `nuclear-i18n` | Internationalization |
| `nuclear-package` | Deployment packaging |
| `nuclear-test` | Testing utilities |
| `nuclear-integration-test` | Integration testing |
| `decision-bi` | BI decision module |
| `schedule-bi` | Task scheduling |
| `polars` | Polars data processing |

### Authentication model

The FineDC platform supports multiple auth modes:

- **Cookie-based auth**: session cookies checked by login-status middleware
- **JWT token auth**: `fineAuthToken` request parameter or stored token
- **Template/report auth**: template-level authorization for report access

For this CLI, the practical model is:

- `auth login` stores the current token and base URL in `~/.finebi-cli/config.json`
- subsequent commands reuse that stored state
- `auth status` only reflects local stored config, not guaranteed API health

## Installation

### From PyPI

```bash
pip install finebi-cli
```

### From source

```bash
cd finebi-cli

python3 -m venv .venv
source .venv/bin/activate
pip install -e .

finebi-cli --version
finebi-cli --help
```

If you do not want to activate the virtual environment:

```bash
./.venv/bin/pip install -e .
./.venv/bin/finebi-cli --help
```

## Quick Start

```bash
# Authenticate (works for both BI and Decision platform APIs)
finebi-cli auth login --url http://localhost:8080/WebReport/decision --user admin --password admin
```

### Scenario A — Get widget data starting from the Decision platform directory (目录)

Use this when you know a template is published in the Decision platform directory
but don't have its BI subject or report ID.

```bash
# 1. Browse the published directory — note the [id=…] of the entry you want
finebi-cli entry tree

# 2. Get the dashboard and component list for that published resource
finebi-cli entry resource --publish-task-id <templateId>

# 3. Find widget IDs inside the dashboard (use the dashboard id from step 2)
finebi-cli --json report consanguinity --report-id <dashboard-id>

# 4. Fetch the rendered widget data
finebi-cli --json dashboard widget-data --report-id <dashboard-id> --widget-id <widget-id>
```

### Scenario B — Get widget data starting from My Analysis (我的分析)

Use this when you already know the subject or want to browse the BI subject hierarchy directly.

```bash
# 1. Browse the subject tree to find a subject
finebi-cli --json subject tree-root

# 2. List dashboards in the subject
finebi-cli --json subject reports --subject-id <subject-id>

# 3. Find widget IDs inside the dashboard
finebi-cli --json report consanguinity --report-id <report-id>

# 4. Fetch the rendered widget data
finebi-cli --json dashboard widget-data --report-id <report-id> --widget-id <widget-id>
```

```bash
# Other useful commands
finebi-cli auth status
finebi-cli auth logout
```

## Command Groups

| Group | Description |
|-------|-------------|
| `finebi-cli auth` | Login, logout, auth status |
| `finebi-cli config` | Manage CLI configuration |
| `finebi-cli report` | Report CRUD and lifecycle |
| `finebi-cli dashboard` | Dashboard listing, sharing, widget data |
| `finebi-cli export` | Export to PNG / Excel / PDF |
| `finebi-cli package` | Public data folder/package management |
| `finebi-cli subject` | Subject (主题) management: folders, tree, content, reports, search |
| `finebi-cli table` | Table info, fields, lineage, SQL preview |
| `finebi-cli data` | Data Center API: folders, tables, models, queries |
| `finebi-cli spider` | Spider ETL update triggers |
| `finebi-cli schedule` | BI scheduling tree |
| `finebi-cli entry` | Decision platform entry directory and template tree |

### Command tree

```text
finebi-cli
├── auth
├── config
├── report
├── dashboard
├── export
├── package
├── subject
├── table
├── data
├── spider
├── schedule
└── entry
    ├── tree      # list published templates in the Decision directory
    └── resource  # get dashboard/component info for a published resource
```

## Global Options

```text
--json          Raw JSON output
--url <url>     Override base URL
--version / -v  Show version
```

## Key API Mappings

These are the most important platform endpoints exposed through the CLI.

### Reports and dashboards

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `report list` | `GET /platform/dashboard/reports` |
| `dashboard list` | `GET /platform/dashboard/list` |
| `report info` | `GET /platform/dashboard/reports/info` |
| `report rename` | `GET /platform/dashboard/rename` |
| `report delete` | `GET /platform/dashboard/report` |
| `report save-as` | `POST /platform/dashboard/saveas` |
| `dashboard shared` | `GET /dashboard/share` |
| `report consanguinity` | `GET /dashboard/report/consanguinity` |
| `report check` | `GET /dashboard/report/check` |
| `dashboard widget-data` | `GET /v5/api/dashboard/report/widget/data` |

### Export

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `export png` | `GET /dashboard/report/export/png` |
| `export excel` | `GET /dashboard/report/export/excel` |
| `export pdf` | `GET /dashboard/report/export/pdf` |

### Packages and folders

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `package create` | `GET /pack/{groupId}/add` |
| `package delete` | `POST /pack/delete` |
| `package rename` | `GET /pack/{packId}/rename` |
| `package structure` | `GET /conf/packs/{packId}/structure` |
| `package list` | `GET /conf/groups` |

### Data Center

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `data folders` | `GET /{version}/folders` |
| `data folder-tree` | `POST /{version}/folders/{folderId}/structure` |
| `data table-preview` | `GET /{version}/tables/{tableName}/data` |
| `data table-structure` | `GET /{version}/tables/{tableName}/structure` |
| `data model` | `POST /{version}/data/model` |
| `data preview` | `POST /{version}/preview/page` |

### Spider and scheduling

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `spider generate` | `GET /v5/api/conf/update/generate` |
| `spider update` | `GET /v5/api/conf/update/pack/table` |
| `spider batch` | `POST /v5/api/conf/update/batch` |
| `schedule tree` | `GET /{version}/schedule/bi/platform/dashboard/reports/tree` |

### Decision platform entry (WebReport context)

These commands hit the Decision platform (`/WebReport/decision/…`), not the BI API (`/bi/…`).
The base URL for both is derived automatically from the stored `base_url` config.

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `entry tree` | `GET /WebReport/decision/v10/view/entry/tree` |
| `entry resource` | `POST /WebReport/decision/v5/conf/publish/subjects/publish/resource` |

## Workflow Examples

### Report export pipeline

```bash
finebi-cli auth login --url http://bi.company.com/WebReport/decision --user analyst --password secret
finebi-cli report list --subject-id 1
finebi-cli export pdf --report-id r-456 --output /artifacts/monthly.pdf
finebi-cli export excel --report-id r-456 --output /artifacts/monthly.xlsx
finebi-cli auth logout
```

### Data exploration

```bash
finebi-cli data folders
finebi-cli data folder-tree --folder-id f-001
finebi-cli data table-preview --table-name sales_2024
finebi-cli data search-tables --body '{"keyword": "revenue"}'
finebi-cli data query --body '{"modelId": "m-123", "fields": ["region", "amount"]}'
```

### Subject exploration

```bash
finebi-cli subject folders
finebi-cli subject folder --folder-id abc123
finebi-cli subject tree --folder-id abc123
finebi-cli subject content --subject-id xyz789
finebi-cli subject reports --subject-id xyz789
finebi-cli subject consanguinity --subject-id xyz789
finebi-cli subject search --body '{"keyword":"sales"}'
```

### Table operations

```bash
finebi-cli table info --name sales
finebi-cli table detail --name sales
finebi-cli table publish-status --name sales
finebi-cli table consanguinity --body '{"tableName":"sales"}'
finebi-cli table fields --body '{"ids":["sales"]}'
finebi-cli table sql-preview --body '<json>'
```

### Access widget data via the Decision platform entry tree

This is the recommended workflow when starting from the Decision platform directory
(i.e. you know a template is published in the directory but don't have its BI subject/report ID).

```
entry tree  →  entry resource  →  report consanguinity  →  dashboard widget-data
```

**Step 1 — browse the published directory and get the resource ID**

```bash
finebi-cli entry tree
```

Output example:
```
└── [dir] Dec-Entry_Management
    └── [entry] 分析主题  [id=cd04fdc2084d44ddae42bc7a504dcae3]
```

The `[id=…]` value is the `templateId` / `publishTaskId` for the next step.

**Step 2 — get the dashboard and component list for the published resource**

```bash
finebi-cli entry resource --publish-task-id cd04fdc2084d44ddae42bc7a504dcae3
```

Output example:
```
主题: 分析主题

id                                name   itemType
--------------------------------  -----  --------
ca1e01016b8547099831b74b406c5331  组件     组件
a1889c58b66942c78b25410ed1a97ffa  仪表板    仪表板
```

`itemType` 仪表板 = dashboard (report), 组件 = standalone component.

**Step 3 — find widget IDs inside the dashboard**

```bash
finebi-cli --json report consanguinity --report-id a1889c58b66942c78b25410ed1a97ffa
```

The response lists every `widgetId` in the dashboard along with its bound tables and fields.

**Step 4 — fetch the rendered widget data**

```bash
finebi-cli --json dashboard widget-data \
  --report-id a1889c58b66942c78b25410ed1a97ffa \
  --widget-id ca1e01016b8547099831b74b406c5331
```

The response contains `header` (column definitions) and `items` (row data).

### Package management

```bash
finebi-cli package list
finebi-cli package structure --pack-id <id>
finebi-cli package rename --pack-id <id> --new-name "Sales Data"
finebi-cli spider generate
```

### Spider ETL automation

```bash
finebi-cli spider generate
finebi-cli spider status --task-instance-id ti-789
finebi-cli spider batch --tasks '[{"tableId": "t1"}, {"tableId": "t2"}]'
```

## Configuration

Configuration is stored at `~/.finebi-cli/config.json`.

Typical fields include:

```json
{
  "base_url": "http://localhost:8080/WebReport/decision",
  "auth_token": "...",
  "current_user": "admin"
}
```

Set configuration programmatically:

```bash
finebi-cli config set-base-url http://bi.company.com/WebReport/decision
finebi-cli config set-token "$BI_API_TOKEN"
finebi-cli config show
```

## State Model

- **Config**: base URL and auth token in `~/.finebi-cli/config.json`
- **Session**: active login session represented by stored auth state
- **Output**: human-readable tables by default, JSON with `--json`

## Troubleshooting

### `finebi-cli: command not found`

Install the repo into the active environment first:

```bash
./.venv/bin/pip install -e .
./.venv/bin/finebi-cli --help
```

### `auth status` says authenticated, but API calls fail

`auth status` only confirms local stored state. Verify real API health with:

```bash
finebi-cli --json subject tree-root
```

### `Non-JSON response from API` or HTML returned

This usually means one of the following:

- stale login state
- wrong base URL
- request redirected to a web page instead of the JSON API

Recovery flow:

```bash
finebi-cli auth logout
finebi-cli auth login --url http://localhost:8080/WebReport/decision --user <user> --password <password>
finebi-cli --json subject tree-root
```

## Development

```bash
pip install -e ".[dev]"
pytest cli_anything/nuclear/tests/ -v

CLI_ANYTHING_FORCE_INSTALLED=1 pytest cli_anything/nuclear/tests/test_full_e2e.py -v
```

## CLI Implementation

| File | Purpose |
|------|---------|
| `cli_anything/nuclear/nuclear_cli.py` | Click-based CLI entry point |
| `cli_anything/nuclear/core/config.py` | JSON config manager |
| `cli_anything/nuclear/core/session.py` | Stateful HTTP session and auth handling |
| `cli_anything/nuclear/core/{auth,report,dashboard,export,package,subject,table,data,spider,schedule,entry}.py` | Domain API modules |
| `cli_anything/nuclear/utils/output.py` | JSON and table output formatting |

## License

MIT
