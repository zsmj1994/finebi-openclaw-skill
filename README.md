# finebi-cli

**CLI harness for FineDC / Nuclear BI Platform** – automate report management,
dashboard operations, data exports, data center queries, spider ETL updates,
and scheduling from the command line.

## Features

- **Stateful auth** – JWT/cookie tokens stored in `~/.finebi-cli/config.json`
- **Full report lifecycle** – create, list, rename, delete, save-as, lineage analysis
- **Multi-format export** – PNG, Excel, PDF with single command
- **Data Center API** – explore folders, tables, models; run queries and previews
- **Spider ETL automation** – trigger and monitor data updates
- **Scheduling** – manage scheduled BI report jobs
- **JSON output** – `--json` flag for scripting and piping to `jq`
- **REPL-friendly** – idempotent commands, clear error messages

## Installation

### From PyPI (recommended)

```bash
pip install finebi-cli
```

### From source

```bash
cd finebi-cli

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install in editable mode
pip install -e .

# Verify installation
finebi-cli --version
finebi-cli --help
```

**Note**: The `.venv` directory is for local development only and should not be committed to git. Other developers cloning this repo should create their own virtual environment following the steps above.

**Alternative**: If you prefer not to activate the virtual environment, you can run commands directly:

```bash
.venv/bin/pip install -e .
.venv/bin/finebi-cli --help
```

## Quick Start

```bash
# 1. Authenticate
finebi-cli auth login --url http://localhost:8080/WebReport/decision --user 1 --password 1

# 2. Discover subjects
finebi-cli --json subject tree-root

# 3. List dashboards in a subject (replace <subject-id> from tree-root output)
finebi-cli --json subject reports --subject-id <subject-id>

# 4. Fetch widget data (replace <report-id> and <widget-id> with real values)
finebi-cli --json dashboard widget-data --report-id <report-id> --widget-id <widget-id>

# 5. Optionally create a share link for a dashboard
finebi-cli --json dashboard share --report-id <report-id> --user-id 1

# 6. Check auth status
finebi-cli auth status

# 7. Logout
finebi-cli auth logout
```

A verified live path in the local test environment is:

```bash
finebi-cli auth login --url http://localhost:8080/WebReport/decision --user 1 --password 1
finebi-cli --json subject tree-root
finebi-cli --json subject reports --subject-id 0ae3335604e34633b910e717e4976a52
finebi-cli --json dashboard widget-data --report-id 9066f0ebe3d74c11b404bccbe1c68981 --widget-id afb5233641a34898ad9ec8ac726d4047
```

## Command Groups

| Group | Description |
|-------|-------------|
| `finebi-cli auth` | Login, logout, auth status |
| `finebi-cli config` | Manage CLI configuration |
| `finebi-cli report` | Report CRUD and lifecycle |
| `finebi-cli dashboard` | Dashboard listing, sharing, widget data |
| `finebi-cli export` | Export to PNG / Excel / PDF |
| `finebi-cli package` | Public data folder/package management (v5/conf/packs) |
| `finebi-cli subject` | Subject (主题) management — folders, tree, search, copy (v5/conf/subjects) |
| `finebi-cli table` | Table info, fields, lineage, SQL preview (v5/conf/tables) |
| `finebi-cli data` | Data Center API (folders, tables, models, queries) |
| `finebi-cli spider` | Spider ETL update triggers |
| `finebi-cli schedule` | BI scheduling tree |

## Global Options

```
--json          # Raw JSON output (great for scripting)
--url <url>     # Override base URL
--timeout <sec> # Request timeout
--version / -v  # Show version
```

## Workflow Examples

### Report Export Pipeline
```bash
finebi-cli auth login --url http://bi.company.com --user analyst --password secret
finebi-cli report list --subject-id 1
finebi-cli export pdf --report-id r-456 --output /artifacts/monthly.pdf
finebi-cli export excel --report-id r-456 --output /artifacts/monthly.xlsx
finebi-cli auth logout
```

### Data Exploration
```bash
finebi-cli data folders
finebi-cli data folder-tree --folder-id f-001
finebi-cli data table-preview --table-name sales_2024
finebi-cli data search-tables --body '{"keyword": "revenue"}'
finebi-cli data query --body '{"modelId": "m-123", "fields": ["region", "amount"]}'
```

### Spider ETL Automation
```bash
finebi-cli spider generate
finebi-cli spider status --task-instance-id ti-789
finebi-cli spider batch --tasks '[{"tableId": "t1"}, {"tableId": "t2"}]'
```

### Subject (主题) Exploration
```bash
finebi-cli subject folders                          # List first-level folders in My Analysis
finebi-cli subject folder --folder-id abc123        # Get contents of a folder
finebi-cli subject tree --folder-id abc123           # Get full tree with tables
finebi-cli subject content --subject-id xyz789       # Get all items in a subject
finebi-cli subject reports --subject-id xyz789       # List dashboards in a subject
finebi-cli subject consanguinity --subject-id xyz789 # Get lineage within a subject
finebi-cli subject search --body '{"keyword":"sales"}'
```

### Table Operations
```bash
finebi-cli table info --name sales                   # Get table info
finebi-cli table detail --name sales                 # Get detailed table info
finebi-cli table publish-status --name sales         # Check publish status
finebi-cli table consanguinity --body '{"tableName":"sales"}'
finebi-cli table fields --body '{"ids":["sales"]}'   # Batch-get field info
finebi-cli table sql-preview --body '<json>'         # Preview SQL data
```

## Configuration

Configuration is stored at `~/.finebi-cli/config.json`:

```json
{
  "base_url": "http://localhost:8080/bi",
  "version": "v1",
  "timeout": 30,
  "auth_token": "...",
  "current_user": "admin"
}
```

Set configuration programmatically:

```bash
finebi-cli config set-base-url http://bi.company.com
finebi-cli config set-token "$BI_API_TOKEN"
```

## JSON Output for Agents

All commands support `--json` for machine-readable output:

```bash
finebi-cli --json report list --subject-id 1 | jq '.[] | .name'
```

## Development

```bash
# Run tests
pip install -e ".[dev]"
pytest cli_anything/nuclear/tests/ -v

# Run E2E tests (requires CLI installed)
CLI_ANYTHING_FORCE_INSTALLED=1 pytest cli_anything/nuclear/tests/test_full_e2e.py -v
```

## Architecture

- **nuclear_cli.py** – Click-based CLI entry point with 11 command groups
- **core/config.py** – JSON-based configuration manager
- **core/session.py** – Stateful HTTP session with auth, error handling
- **core/{auth,report,dashboard,export,package,subject,table,data,spider,schedule}.py** – API modules
- **utils/output.py** – JSON/table output formatting

## License

MIT
