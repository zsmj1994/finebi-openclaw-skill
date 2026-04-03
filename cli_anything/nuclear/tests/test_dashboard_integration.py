"""
Integration tests for dashboard commands against a live FineDC server.

These tests require a running FineDC server. Defaults:
- URL: http://localhost:8080/WebReport/decision
- user: 1
- password: 1

Run with:
    pytest cli_anything/nuclear/tests/test_dashboard_integration.py -v -s
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest

TEST_BASE_URL = os.environ.get("FINEBI_TEST_URL", "http://localhost:8080/WebReport/decision")
TEST_USERNAME = os.environ.get("FINEBI_TEST_USER", "1")
TEST_PASSWORD = os.environ.get("FINEBI_TEST_PASSWORD", "1")

pytestmark = pytest.mark.integration


def _cli_command() -> list[str]:
    """Return the command prefix used to execute the CLI from source."""
    this_dir = Path(__file__).parent
    harness_root = this_dir.parent.parent.parent
    cli_script = harness_root / "cli_anything" / "nuclear" / "nuclear_cli.py"
    if cli_script.exists():
        return [sys.executable, str(cli_script)]
    return ["nuclear"]


def _run(args: list[str], *, env: dict[str, str], check: bool = True) -> subprocess.CompletedProcess:
    """Run the CLI with a test-isolated environment."""
    return subprocess.run(
        _cli_command() + args,
        capture_output=True,
        text=True,
        check=check,
        env=env,
    )


def _parse_json_output(result: subprocess.CompletedProcess) -> Any:
    text = result.stdout.strip()
    assert text, "expected JSON output, got empty stdout"
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        pytest.fail(f"invalid JSON output: {text}\n{exc}")


def _extract_records(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("data", "items", "records", "list", "result"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
            if isinstance(value, dict):
                nested = _extract_records(value)
                if nested:
                    return nested
        return [payload]
    return []


def _find_report_id(records: list[dict[str, Any]]) -> str | None:
    for record in records:
        for key in ("id", "reportId"):
            value = record.get(key)
            if value not in (None, ""):
                return str(value)
    return None


def _find_widget_id(payload: Any) -> str | None:
    if isinstance(payload, dict):
        for key in ("widgetId", "id"):
            value = payload.get(key)
            if isinstance(value, (str, int)) and value != "":
                return str(value)
        for value in payload.values():
            found = _find_widget_id(value)
            if found:
                return found
    elif isinstance(payload, list):
        for item in payload:
            found = _find_widget_id(item)
            if found:
                return found
    return None


def _extract_available_reports(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    data = payload.get("data")
    if not isinstance(data, dict):
        return []
    reports = data.get("reports")
    if not isinstance(reports, dict):
        return []
    available = reports.get("availableReports")
    if not isinstance(available, list):
        return []
    return [item for item in available if isinstance(item, dict)]


def _extract_subject_ids_from_tree(payload: Any) -> list[str]:
    found: list[str] = []

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            node_type = node.get("type")
            node_id = node.get("id")
            children = node.get("children")
            if node_type == 33 and isinstance(node_id, str) and node_id:
                found.append(node_id)
            if isinstance(children, list):
                for child in children:
                    walk(child)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    if isinstance(payload, dict):
        walk(payload.get("data", payload))
    else:
        walk(payload)
    return found


def _extract_widget_id_from_subject_reports(payload: Any, report_id: str | None) -> str | None:
    if not isinstance(payload, dict):
        return None
    data = payload.get("data")
    if not isinstance(data, dict):
        return None

    custom_order = data.get("customOrder")
    if not isinstance(custom_order, list):
        return None

    filtered = [str(item) for item in custom_order if isinstance(item, (str, int)) and item]
    if not filtered:
        return None
    if report_id:
        for item in filtered:
            if item != report_id:
                return item
    return filtered[0]


def _resolve_subject_report_widget(authenticated_env: dict[str, str]) -> dict[str, str | None]:
    tree_result = _run(["--json", "subject", "tree-root"], env=authenticated_env, check=False)
    if tree_result.returncode != 0:
        return {"subject_id": None, "report_id": None, "widget_id": None}

    tree_payload = _parse_json_output(tree_result)
    subject_ids = _extract_subject_ids_from_tree(tree_payload)
    for subject_id in subject_ids:
        subject_result = _run(
            ["--json", "subject", "reports", "--subject-id", subject_id],
            env=authenticated_env,
            check=False,
        )
        if subject_result.returncode != 0:
            continue

        subject_payload = _parse_json_output(subject_result)
        reports = _extract_available_reports(subject_payload)
        if not reports:
            continue

        report_id = None
        for report in reports:
            report_value = report.get("id")
            if report_value:
                report_id = str(report_value)
                break
        if not report_id:
            continue

        widget_id = _extract_widget_id_from_subject_reports(subject_payload, report_id)
        return {"subject_id": subject_id, "report_id": report_id, "widget_id": widget_id}

    return {"subject_id": None, "report_id": None, "widget_id": None}


@pytest.fixture(scope="module")
def cli_env(tmp_path_factory: pytest.TempPathFactory) -> dict[str, str]:
    config_dir = tmp_path_factory.mktemp("finebi-cli-config")
    env = os.environ.copy()
    env["FINEBI_CONFIG_DIR"] = str(config_dir)
    return env


@pytest.fixture(scope="module")
def authenticated_env(cli_env: dict[str, str]) -> dict[str, str]:
    result = _run(
        [
            "auth",
            "login",
            "--url",
            TEST_BASE_URL,
            "--user",
            TEST_USERNAME,
            "--password",
            TEST_PASSWORD,
        ],
        env=cli_env,
        check=False,
    )
    if result.returncode != 0:
        pytest.skip(f"cannot authenticate to {TEST_BASE_URL}: {result.stderr or result.stdout}")
    yield cli_env
    _run(["auth", "logout"], env=cli_env, check=False)


@pytest.fixture(scope="module")
def dashboard_probe(authenticated_env: dict[str, str]) -> dict[str, Any]:
    list_result = _run(["--json", "dashboard", "list"], env=authenticated_env, check=False)
    if list_result.returncode != 0:
        pytest.skip(f"dashboard list failed in live environment: {list_result.stderr or list_result.stdout}")

    list_payload = _parse_json_output(list_result)
    records = _extract_records(list_payload)
    report_id = _find_report_id(records)

    shared_result = _run(["--json", "dashboard", "shared"], env=authenticated_env, check=False)
    shared_payload = None
    if shared_result.returncode == 0 and shared_result.stdout.strip():
        shared_payload = _parse_json_output(shared_result)
        if report_id is None:
            report_id = _find_report_id(_extract_records(shared_payload))

    resolved = _resolve_subject_report_widget(authenticated_env)
    if resolved["report_id"]:
        report_id = resolved["report_id"]

    return {
        "list_payload": list_payload,
        "list_records": records,
        "shared_payload": shared_payload,
        "report_id": report_id,
        "subject_id": resolved["subject_id"],
        "widget_id": resolved["widget_id"],
    }


class TestDashboardHelp:
    def test_dashboard_group_help(self, cli_env: dict[str, str]) -> None:
        result = _run(["dashboard", "--help"], env=cli_env, check=False)
        assert result.returncode == 0
        assert "list" in result.stdout
        assert "shared" in result.stdout
        assert "share" in result.stdout
        assert "widget-data" in result.stdout

    def test_dashboard_list_help(self, cli_env: dict[str, str]) -> None:
        result = _run(["dashboard", "list", "--help"], env=cli_env, check=False)
        assert result.returncode == 0
        assert "subject-id" in result.stdout.lower()

    def test_dashboard_share_help(self, cli_env: dict[str, str]) -> None:
        result = _run(["dashboard", "share", "--help"], env=cli_env, check=False)
        assert result.returncode == 0
        assert "report-id" in result.stdout.lower()

    def test_dashboard_widget_data_help(self, cli_env: dict[str, str]) -> None:
        result = _run(["dashboard", "widget-data", "--help"], env=cli_env, check=False)
        assert result.returncode == 0
        assert "report-id" in result.stdout.lower()
        assert "widget-id" in result.stdout.lower()


class TestDashboardAuthAndValidation:
    def test_dashboard_list_requires_auth(self, cli_env: dict[str, str]) -> None:
        result = _run(["dashboard", "list"], env=cli_env, check=False)
        assert result.returncode != 0
        assert "not authenticated" in result.stderr.lower() or "login" in result.stderr.lower()

    def test_auth_status_after_login(self, authenticated_env: dict[str, str]) -> None:
        result = _run(["--json", "auth", "status"], env=authenticated_env, check=False)
        assert result.returncode == 0
        payload = _parse_json_output(result)
        assert payload["authenticated"] is True
        assert payload["base_url"] == TEST_BASE_URL
        assert payload["user"] == TEST_USERNAME

    def test_dashboard_share_requires_report_id(self, authenticated_env: dict[str, str]) -> None:
        result = _run(["dashboard", "share"], env=authenticated_env, check=False)
        assert result.returncode != 0
        assert "report-id" in result.stderr.lower() or "required" in result.stderr.lower()

    def test_dashboard_widget_data_requires_params(self, authenticated_env: dict[str, str]) -> None:
        result = _run(["dashboard", "widget-data"], env=authenticated_env, check=False)
        assert result.returncode != 0

        result = _run(["dashboard", "widget-data", "--report-id", "123"], env=authenticated_env, check=False)
        assert result.returncode != 0

        result = _run(["dashboard", "widget-data", "--widget-id", "widget1"], env=authenticated_env, check=False)
        assert result.returncode != 0


class TestDashboardLiveReads:
    def test_dashboard_list_json_output(self, dashboard_probe: dict[str, Any]) -> None:
        assert dashboard_probe["list_payload"] is not None
        assert isinstance(dashboard_probe["list_records"], list)

    def test_dashboard_list_human_output(self, authenticated_env: dict[str, str]) -> None:
        result = _run(["dashboard", "list"], env=authenticated_env, check=False)
        assert result.returncode == 0, result.stderr or result.stdout
        assert result.stdout.strip()

    def test_dashboard_shared_json_output(self, authenticated_env: dict[str, str], dashboard_probe: dict[str, Any]) -> None:
        result = _run(["--json", "dashboard", "shared"], env=authenticated_env, check=False)
        assert result.returncode == 0, result.stderr or result.stdout
        payload = _parse_json_output(result)
        assert payload == dashboard_probe["shared_payload"] or isinstance(payload, (dict, list))


class TestDashboardLiveActions:
    def test_dashboard_share_with_real_report_id(self, authenticated_env: dict[str, str], dashboard_probe: dict[str, Any]) -> None:
        report_id = dashboard_probe["report_id"]
        if not report_id:
            pytest.skip("no dashboard/report id found from live dashboard list/shared response")

        result = _run(
            ["--json", "dashboard", "share", "--report-id", report_id, "--user-id", TEST_USERNAME],
            env=authenticated_env,
            check=False,
        )
        assert result.returncode == 0, result.stderr or result.stdout
        payload = _parse_json_output(result)
        assert isinstance(payload, (dict, list, str, int, float, bool))

    def test_dashboard_widget_data_with_real_ids(self, authenticated_env: dict[str, str], dashboard_probe: dict[str, Any]) -> None:
        report_id = dashboard_probe["report_id"]
        widget_id = dashboard_probe["widget_id"]
        if not report_id:
            pytest.skip("no report id available for widget-data test")
        if not widget_id:
            show_result = _run(["--json", "report", "info", "--report-ids", report_id], env=authenticated_env, check=False)
            if show_result.returncode != 0:
                pytest.skip(f"cannot inspect report info for report {report_id}: {show_result.stderr or show_result.stdout}")
            show_payload = _parse_json_output(show_result)
            widget_id = _find_widget_id(show_payload)
        if not widget_id:
            pytest.skip(f"no widget id available for report {report_id}")

        result = _run(
            ["--json", "dashboard", "widget-data", "--report-id", report_id, "--widget-id", widget_id],
            env=authenticated_env,
            check=False,
        )
        assert result.returncode == 0, result.stderr or result.stdout
        payload = _parse_json_output(result)
        assert isinstance(payload, dict)
        assert payload.get("success") is True
        assert "data" in payload


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
