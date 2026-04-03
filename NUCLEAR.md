# NUCLEAR.md - FineDC (Nuclear) CLI Harness Standard Operating Procedure

## Software Overview

**Name:** FineDC / Nuclear-All
**Type:** Enterprise Business Intelligence Platform
**Vendor:** FanRuan (帆软)
**Architecture:** Java/Gradle multi-module, dual-engine BI system

## Architecture Summary

### Dual-Engine Architecture
1. **Spider Engine**: Extracts data into a warehouse (ETL-based)
2. **Direct Engine**: Real-time querying from data sources

### Core Modules
| Module | Purpose |
|--------|---------|
| nuclear-web | Web UI and REST API layer |
| nuclear-base | Base utilities and shared code |
| nuclear-spider | Data collection / ETL engine |
| nuclear-spider-foundation | Spider foundation utilities |
| nuclear-spider-project | Spider project implementation |
| nuclear-spider-adapter | Spider adapter interfaces |
| nuclear-query | Query processing engine |
| nuclear-query-adapter | Query adapter interfaces |
| nuclear-decision | Core BI decision components |
| nuclear-foundation-project | Foundation project framework |
| nuclear-foundation-connector | Data source connectors |
| nuclear-ai | AI/ML capabilities |
| nuclear-cluster | Clustering & HA |
| nuclear-excel | Excel integration |
| nuclear-i18n | Internationalization |
| nuclear-package | Deployment packaging |
| nuclear-test | Testing utilities |
| nuclear-integration-test | Integration testing |
| decision-bi | BI decision module |
| schedule-bi | Task scheduling |
| polars | Polars data processing |

### API Authentication
- **Cookie-based**: Session cookies via `@LoginStatusChecker`
- **JWT Token**: `fineAuthToken` parameter, parsed via `JwtUtils.parseJWT(token).getSubject()`
- **Template Auth**: `@TemplateAuth` for report/template access

### Key API Endpoints

#### Reports & Dashboards
- `GET /platform/dashboard/reports` - Create report
- `GET /platform/dashboard/list` - List dashboards
- `GET /platform/dashboard/reports/info` - Report info
- `GET /platform/dashboard/rename` - Rename report
- `GET /platform/dashboard/report` - Delete report
- `POST /platform/dashboard/saveas` - Save-as report
- `GET /dashboard/share` - Shared reports
- `GET /dashboard/report/consanguinity` - Report lineage
- `GET /dashboard/report/check` - Check report state

#### Export
- `GET /dashboard/report/export/png` - Export PNG
- `GET /dashboard/report/export/excel` - Export Excel
- `GET /dashboard/report/export/pdf` - Export PDF

#### Packages/Folders
- `GET /pack/{groupId}/add` - Create folder
- `POST /pack/delete` - Delete packages
- `GET /pack/{packId}/rename` - Rename package
- `GET /conf/packs/{packId}/structure` - Package structure
- `GET /conf/packs/{packId}` - Package details
- `GET /conf/groups` - Root folders

#### Data Center
- `GET /{version}/folders` - List folders
- `POST /{version}/folders/{folderId}/structure` - Folder structure
- `GET /{version}/tables/{tableName}/data` - Table preview
- `GET /{version}/tables/{tableName}/structure` - Table schema
- `POST /{version}/data/model` - Query data model
- `POST /{version}/preview/page` - Preview data

#### Spider/Update
- `GET /v5/api/conf/update/generate` - Global update
- `GET /v5/api/conf/update/pack/table` - Package/table update
- `POST /v5/api/conf/update/batch` - Batch update

#### Scheduling
- `GET /{version}/schedule/bi/platform/dashboard/reports/tree` - Reports tree

## CLI Command Groups

```
finebi-cli
├── auth          # Authentication (login, logout, status)
├── report        # Report CRUD (create, list, info, rename, delete, save-as)
├── dashboard     # Dashboard ops (list, share, show, check, consanguinity)
├── export        # Export (png, excel, pdf)
├── package       # Folder management (create, delete, rename, structure, list)
├── data          # Data center (folders, tables, models, fields, search, preview)
├── spider        # Spider/update (generate, pack-table, batch, status)
├── schedule      # Scheduling (tree)
└── config        # Configuration (set-base-url, show, set-token)
```

## State Model

- **Config**: Base URL, auth token, API version → stored in `~/.finebi-cli/config.json`
- **Session**: Active login session with JWT token
- **Output**: Human-readable tables (default) or JSON (`--json` flag)

## Workflow Examples

### Create and Export a Report
```bash
finebi-cli auth login --url http://localhost:8080/bi --user admin --password admin
finebi-cli report list --subject-id <id>
finebi-cli export pdf --report-id <id> --output report.pdf
finebi-cli auth logout
```

### Manage Data Packages
```bash
finebi-cli package list
finebi-cli package create --group-id <id> --name "Sales Data"
finebi-cli package structure --pack-id <id>
finebi-cli spider generate
```

### Query Data Center
```bash
finebi-cli data folders
finebi-cli data tables --name <table> --preview
finebi-cli data search --keyword "sales"
```
