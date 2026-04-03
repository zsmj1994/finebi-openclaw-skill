# TEST.md – cli-anything-finebi-cli Test Plan & Results

## Test Plan

### Unit Tests (`test_core.py`)
- **TestConfig** – default values, set/get, save/load, clear_auth, api_url
- **TestNuclearSession** – singleton pattern, reset, auth token, URL building
- **TestNuclearError** – error creation, response/data preservation
- **TestOutputUtils** – list coercion, table formatting, JSON round-trip
- **TestAuthModule** – logout, status
- **TestRequiresAuth** – decorator behavior with/without token
- **TestWorkflowSimulation** – config cycles, table rendering, API URL construction

### E2E Tests (`test_full_e2e.py`)
- **TestCLISubprocess** – CLI smoke tests via subprocess:
  - `finebi-cli --help`, `--version`, group help for all 9 commands
  - `--json` flag acceptance
  - `auth status` unauthenticated response
  - `auth login` server connectivity
  - `config show` output
  - `report list` auth requirement
  - `export png` missing --report-id error
  - `package create` missing --group-id error
- **TestWorkflowSimulation** – config save/load, table rendering, JSON mode, API URL construction

## Test Results

```
============================= test session starts ==============================
platform darwin -- Python 3.13.2, pytest-9.0.2, pluggy-1.6.0
plugins: cov-7.1.0
collected 44 items

cli_anything/nuclear/tests/test_core.py::TestConfig::test_default_values PASSED
cli_anything/nuclear/tests/test_core.py::TestConfig::test_set_and_get PASSED
cli_anything/nuclear/tests/test_core.py::TestConfig::test_save_and_load PASSED
cli_anything/nuclear/tests/test_core.py::TestConfig::test_clear_auth PASSED
cli_anything/nuclear/tests/test_core.py::TestConfig::test_api_url PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearSession::test_singleton PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearSession::test_reset_clears_instance PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearSession::test_set_auth_token PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearSession::test_url_building PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearError::test_creation PASSED
cli_anything/nuclear/tests/test_core.py::TestNuclearError::test_with_response PASSED
cli_anything/nuclear/tests/test_core.py::TestOutputUtils::test_ensure_list_list PASSED
cli_anything/nuclear/tests/test_core.py::TestOutputUtils::test_ensure_list_dict_with_data_key PASSED
cli_anything/nuclear/tests/test_core.py::TestOutputUtils::test_ensure_list_dict_without_list_key PASSED
cli_anything/nuclear/tests/test_core.py::TestOutputUtils::test_ensure_list_primitive PASSED
cli_anything/nuclear/tests/test_core.py::TestOutputUtils::test_json_roundtrip PASSED
cli_anything/nuclear/tests/test_core.py::TestAuthModule::test_logout_clears_config PASSED
cli_anything/nuclear/tests/test_core.py::TestAuthModule::test_status_returns_auth_info PASSED
cli_anything/nuclear/tests/test_core.py::TestRequiresAuth::test_aborts_without_token PASSED
cli_anything/nuclear/tests/test_core.py::TestRequiresAuth::test_passes_with_token PASSED
cli_anything/nuclear/tests/test_core.py::TestWorkflowSimulation::test_config_save_load_cycle PASSED
cli_anything/nuclear/tests/test_core.py::TestWorkflowSimulation::test_output_table_headers_and_rows PASSED
cli_anything/nuclear/tests/test_core.py::TestWorkflowSimulation::test_api_url_various_paths PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_help_shows_top_level PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_version_flag PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_auth_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_report_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_export_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_package_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_data_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_spider_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_schedule_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_config_group_help PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_json_flag_accepted PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_auth_status_unauthenticated PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_auth_login_fails_without_server PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_config_show PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_report_list_requires_auth PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_export_requires_report_id PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestCLISubprocess::test_package_requires_group_id PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestWorkflowSimulation::test_config_set_and_show_cycle PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestWorkflowSimulation::test_output_table_rendering PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestWorkflowSimulation::test_output_json_mode PASSED
cli_anything/nuclear/tests/test_full_e2e.py::TestWorkflowSimulation::test_api_url_construction PASSED

============================== 44 passed in 1.67s ===============================
```

## Summary

| Metric | Result |
|--------|--------|
| Total Tests | 44 |
| Passed | 44 |
| Failed | 0 |
| Pass Rate | **100%** |

## Coverage

- **Core modules tested**: Config, Session, NuclearError, Auth, requires_auth decorator
- **Utilities tested**: Output formatting, JSON/table rendering, list coercion
- **CLI smoke tested**: All 9 command groups, global flags, error handling
- **Subprocess tests**: Use `_cli_path()` → editable install → `finebi-cli` on PATH

---

## Live Dashboard Integration Testing

### Environment

- **Base URL**: `http://localhost:8080/WebReport/decision`
- **Username**: `1`
- **Password**: `1`
- **Python**: use project virtualenv at `finebi-cli/.venv/bin/python`
- **Pytest**: use project virtualenv at `finebi-cli/.venv/bin/pytest`

### How to run

From repo root:

```bash
cd agent-harness
.venv/bin/pytest cli_anything/nuclear/tests/test_dashboard_integration.py -v -s
```

Run smoke regression:

```bash
cd agent-harness
.venv/bin/pytest cli_anything/nuclear/tests/test_full_e2e.py -v
```

Run core regression:

```bash
cd agent-harness
.venv/bin/pytest cli_anything/nuclear/tests/test_core.py -v
```

### Test isolation

Live integration tests now support `FINEBI_CONFIG_DIR` and should run with an isolated config directory instead of writing to the user's real CLI config.

### What was verified

The following live checks were run successfully against `http://localhost:8080/WebReport/decision`:

1. `finebi-cli auth login --url http://localhost:8080/WebReport/decision --user 1 --password 1`
2. `finebi-cli --json dashboard list`
3. `cli_anything/nuclear/tests/test_dashboard_integration.py`
4. `cli_anything/nuclear/tests/test_full_e2e.py`
5. `cli_anything/nuclear/tests/test_core.py`

### Latest results

#### Dashboard integration

```text
13 passed
```

Verified live action path:
- dynamic subject discovery via `subject tree-root`
- dynamic report discovery via `subject reports --subject-id <resolved-subject-id>`
- widget id derived dynamically from the subject report payload (`customOrder` excluding the resolved report id)

The following live commands are now confirmed working:

```bash
.venv/bin/python cli_anything/nuclear/nuclear_cli.py --json subject tree-root
.venv/bin/python cli_anything/nuclear/nuclear_cli.py subject reports --subject-id <resolved-subject-id>
.venv/bin/python cli_anything/nuclear/nuclear_cli.py dashboard share --report-id <resolved-report-id> --user-id 1
.venv/bin/python cli_anything/nuclear/nuclear_cli.py dashboard widget-data --report-id <resolved-report-id> --widget-id <resolved-widget-id>
```

Notes:
- `subject tree-root` itself is working normally; if it returns HTML or non-JSON, that usually means the CLI was called before login or without a valid isolated config.
- The dashboard integration test now resolves parameters dynamically with the chain `tree-root -> subject reports -> dashboard widget-data`, instead of hard-coding subject/report/widget IDs.
- `dashboard share` requires `--user-id` in the current live environment, otherwise the backend returns `MissingServletRequestParameterException`.
- `dashboard share` in `--json` mode must not print the success banner after the JSON payload; this was fixed in `nuclear_cli.py`.

#### Smoke regression

```text
27 passed
```

#### Core regression

```text
30 passed
```

### Important live API observation

`dashboard list` currently returns a success/status object in this environment instead of a dashboard list. The observed JSON was:

```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {
    "editable": false,
    "coopAnalysis": false,
    "creatorAuth": false
  },
  "errorCode": null,
  "detailErrorMsg": null,
  "errorMsg": null
}
```

So the integration tests were written to:
- treat `dashboard list` as a live-read probe first
- avoid hard-coding `subject-id=1`
- dynamically discover `reportId/widgetId` if present
- skip action tests when live resources are unavailable
