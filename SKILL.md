---
name: finebi-cli
description: CLI harness for FineDC / Nuclear BI Platform – manage reports, dashboards, exports, data center queries, subject/table exploration, spider ETL updates, and scheduling.
version: 1.2.0
tools:
  - python3
  - finebi-cli
commands:
  - finebi-cli auth login --url <url> --user <user> --password <password>
  - finebi-cli auth status
  - finebi-cli auth logout
  - finebi-cli --json subject tree-root
  - finebi-cli --json subject reports --subject-id <id>
  - finebi-cli --json report consanguinity --report-id <id>
  - finebi-cli --json dashboard widget-data --report-id <id> --widget-id <id>
  - finebi-cli export pdf --report-id <id> --output <path>
environment:
  FINEBI_BASE_URL: FineDC server base URL (overrides stored config)
notes:
  - Primary human-facing documentation lives in README.md
  - Auth token is stored in ~/.finebi-cli/config.json
  - Default login URL pattern is http://<host>:<port>/WebReport/decision
  - auth status only confirms local stored state; verify the backend with a real API call
  - report consanguinity returns lineage, not displayed rows
  - dashboard widget-data returns the actual rendered component dataset
---

# SKILL.md – finebi-cli

This skill is the agent-oriented entrypoint for `finebi-cli`.
Use [`README.md`](README.md) as the complete product and CLI reference.

## When To Use

Use this skill when the task involves:

- logging into a FineDC / FineBI instance
- locating subjects, dashboards, widgets, or tables
- tracing dashboard lineage
- reading widget result data
- exporting reports
- triggering spider or scheduling workflows

## Minimal Agent Workflow

Use the smallest reliable sequence first:

```bash
finebi-cli auth login --url http://localhost:8080/WebReport/decision --user <user> --password <password>
finebi-cli --json subject tree-root
finebi-cli --json subject reports --subject-id <subject-id>
finebi-cli --json report consanguinity --report-id <report-id>
finebi-cli --json dashboard widget-data --report-id <report-id> --widget-id <widget-id>
```

Interpretation:

- `subject reports` finds dashboards under a subject
- `report consanguinity` finds widget IDs plus dependent tables and fields
- `dashboard widget-data` fetches the actual rendered data for one widget

## Verified Behavior

The following path has been verified against a live local service:

- login against `http://localhost:8080/WebReport/decision`
- subject discovery via `subject tree-root`
- dashboard lookup via `subject reports`
- lineage inspection via `report consanguinity`
- widget data retrieval via `dashboard widget-data`

## Agent-Specific Pitfalls

- When running from this source repository, install first with `pip install -e .` or use `./.venv/bin/finebi-cli`.
- If an API call returns HTML or `Non-JSON response from API`, the login state may be stale or the base URL may be wrong.
- If `auth status` says authenticated but real requests fail, re-check with `finebi-cli --json subject tree-root`.
- Do not use `report consanguinity` as if it were a data query; it is only for dependency discovery.
- A widget may be valid but still have an empty result set.

## Where To Read More

See [`README.md`](README.md) for:

- installation and development setup
- full command group coverage
- platform architecture and API mappings
- broader workflow examples
- configuration and troubleshooting details
