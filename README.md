# finebi-openclaw-skill

An [OpenClaw](https://openclaw.ai) skill plugin that integrates with [FineBI](https://www.fanruan.com/finebi) to provide data analysis and visualization capabilities through natural language.

## Quick Start (ClawHub / npx)

You can run this skill directly via npx or install it as an OpenClaw plugin from [ClawHub](https://clawhub.ai).

### Plugin Installation
```bash
# In your OpenClaw powered agent
/install finebi-openclaw-skill
```

### Manual npx usage
```bash
# 1. First time setup (Configure FineBI credentials)
npx -y finebi-openclaw-skill install

# 2. Use any command via finebi-skill or finebi-cli
npx finebi-skill search-datasets --keyword "Sales"
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
| `search-datasets` | Search datasets by keyword |
| `preview-dataset-data` | Preview dataset data (up to 100,000 rows) |
| `get-dataset-info` | Get a FineBI dataset info by tableName |
| `export-dashboard-excel` | Export a dashboard to Excel |
| `export-dashboard-pdf` | Export a dashboard to PDF |
| `export-dashboard-image` | Export a dashboard to PNG |
| `get-dashboard-user-info` | Get current user info and their dashboards |

> **Tip:** Run `finebi-skill <command> --help` for specific options.

## License

ISC
