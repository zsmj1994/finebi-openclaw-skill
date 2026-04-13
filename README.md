# finebi-openclaw-skill

An [OpenClaw](https://openclaw.ai) skill plugin that integrates with [FineBI](https://www.fanruan.com/finebi) to provide data analysis and visualization capabilities through natural language.

## Quick Start (ClawHub / npx)

You can run this skill directly via npx or install it as an OpenClaw skill from [ClawHub](https://clawhub.ai).

### Plugin Installation
```bash
# In your terminal
npm install -g finebi-openclaw-skill
```

### Manual npx usage
```bash
# 1. First time setup (Configure FineBI credentials)
finebi-cli init

# 2. Use any command via finebi-cli
finebi-cli query-dataset -k "Sales"
```

## Features

- 📊 **Dataset Discovery** – Search and preview FineBI datasets
- 📈 **Dashboard Export** – Export dashboards to Excel, PDF, or PNG
- 📂 **Data Management** – Explore data folders, structures, and models
- 🕷️ **Spider Update Status** – Monitor data update tasks

## Configuration

The skill requires the following connection details:

- `FINEBI_BASE_URL`: Base URL of your FineBI instance
- `FINEBI_USERNAME`: Your FineBI username
- `FINEBI_PASSWORD`: Your FineBI password

Configure these using `finebi-skill install` which creates a `.env` file.

## Available Tools (CLI)

This plugin exposes multiple binaries: `finebi-skill`, `finebi-cli`, and `finebi-openclaw-skill`.

| Command | Description |
| :--- | :--- |
| `install` | **Interactive setup** for FineBI credentials |
| `subject-groups-search` | Search across all subjects and folders |
| `search-my-dashboards` | Search dashboards in My Analysis |
| `get-publick-datasets-list` | Get a list of public datasets |
| `query-dataset` | Query public datasets by keyword |
| `preview-dataset-data` | Preview dataset data and fields |
| `export-dashboard-excel` | Export a dashboard to Excel |
| `export-dashboard-pdf` | Export a dashboard to PDF |
| `export-dashboard-image` | Export a dashboard to PNG |
| `get-dashboard-user-info` | Get current user info and their dashboards |

> **Tip:** Run `finebi-skill <command> --help` for specific options.


## FineBI API Reference

This plugin interacts with the following FineBI endpoints:

| Module | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `GET` | `/login/cross/domain` | Cross-domain authentication and token retrieval |
| **Dashboard** | `GET` | `/v5/api/dashboard/user/info` | View current user dashboards info |
| | `GET` | `/v5/api/dashboard/search` | Search for dashboards |
| | `GET` | `/v5/api/platform/dashboard/list` | List all platform dashboards |
| | `GET` | `/v5/api/dashboard/get` | Get dashboard details |
| | `POST` | `/v5/api/dashboard/create` | Create a new dashboard |
| | `POST` | `/v5/api/dashboard/rename` | Rename an existing dashboard |
| | `POST` | `/v5/api/dashboard/delete` | Delete a dashboard |
| | `GET` | `/v5/api/dashboard/report/widget/data` | Get specific report widget data |
| | `GET` | `/v5/api/dashboard/report/export/excel` | Export dashboard to Excel file |
| | `GET` | `/v5/api/dashboard/report/export/pdf` | Export dashboard to PDF file |
| | `GET` | `/v5/api/dashboard/report/export/png` | Export dashboard to PNG image |
| **Report** | `POST` | `/v5/api/platform/dashboard/reports/info` | Fetch platform reports info |
| | `GET` | `/v5/api/dashboard/report/consanguinity` | Report data lineage/consanguinity |
| | `GET` | `/v5/api/dashboard/report/check` | Check report validity |
| **Dataset** | `GET` | `/api/dataset` | Retrieve dataset information |
| | `POST` | `/api/dataset/query` | Query exact data from dataset |
| | `POST` | `/api/report` | Query report from dataset |
| **Data Center** | `GET` | `/v5/api/folders` | Extract data center root folders |
| | `GET` | `/v5/api/folders/tree/{folderId}` | Extract data folder tree structure |
| | `POST` | `/v5/api/tables/{tableName}/data` | Fetch table actual data |
| | `GET` | `/v5/api/tables/{tableName}/structure` | Fetch table logical structure |
| | `GET` | `/v5/api/model/{modelId}/structure` | Fetch data model structure |
| | `POST` | `/v5/api/data/model` | Data model execution & evaluation |
| | `POST` | `/v5/api/preview/page` | Preview table/model data pages |
| | `POST` | `/v5/api/folders/table/search` | Search for tables in folder layer |
| | `POST` | `/v5/api/folders/field/search` | Search for fields in folder layer |
| | `POST` | `/v5/api/field/data` | Extract field unique values/data |
| | `POST` | `/v5/api/field/range` | Extract field ranges |
| **Subject** | `GET` | `/v5/conf/subjects/first/folders` | Retrieve first level subject folders |
| | `GET` | `/v5/conf/subjects/tree` | Fetch complete subjects tree |
| | `GET` | `/v5/conf/subjects/folders/{folderId}` | Fetch subject folder information |
| | `GET` | `/v5/conf/subjects/folders/tree/{folderId}` | Fetch subject folder children tree |
| | `GET` | `/v5/conf/subjects/{subjectId}` | Fetch detailed subject definition |
| | `GET` | `/v5/conf/subjects/{subjectId}/reports` | Fetch subject bundled reports |
| | `POST` | `/v5/conf/subjects/search` | Search among published subjects |
| | `POST` | `/v5/conf/subjects/groups/search` | Search subject groups |
| | `GET` | `/v5/conf/subjects/consanguinity/{subjectId}` | Subject data lineage relation |
| | `POST` | `/v5/conf/publish/subjects/publish/resource` | Publish resource logic |
| **Package** | `GET` | `/v5/conf/packs/folders` | Directory folders for subject packs |
| | `GET` | `/v5/conf/packs/structure/{packId}` | Structure of subject pack |
| **Status/Misc**| `GET` | `/v5/api/conf/update/instance/{id}` | Update task/spider instance info |
| | `GET` | `/v10/view/entry/tree` | Master entry tree data structure |

## License

ISC
