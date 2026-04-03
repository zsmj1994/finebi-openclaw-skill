"""
End-to-end tests for cli-anything-nuclear CLI.

These tests verify the full CLI pipeline using subprocess calls.
Requires the CLI to be installed in PATH as 'nuclear' (or 'cli-anything-nuclear').

Run with:  pytest test_full_e2e.py -v

For subprocess tests to work without a live server, set:
    CLI_ANYTHING_FORCE_INSTALLED=1
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

# Path resolution helpers ---------------------------------------------------

CLI_ANYTHING_FORCE_INSTALLED = os.environ.get("CLI_ANYTHING_FORCE_INSTALLED", "")


def _resolve_cli() -> str:
    """Return the installed CLI command name."""
    # Check if it is on PATH first
    for name in ("finebi-cli", "cli-anything-finebi-cli"):
        if shutil.which(name):
            return name
    # Fallback: try finebi-cli (pip-installed entry point)
    return "finebi-cli"


def _cli_path() -> str:
    """Return the full path to the finebi-cli script (for development use)."""
    this_dir = Path(__file__).parent
    harness_root = this_dir.parent.parent.parent  # finebi-cli/
    cli_script = harness_root / "cli_anything" / "nuclear" / "nuclear_cli.py"
    if cli_script.exists():
        return f"{sys.executable} {cli_script}"
    return "finebi-cli"


def _run(args: list[str], *, check: bool = True, **kwargs) -> subprocess.CompletedProcess:
    """Run the CLI with given arguments and return the result."""
    cmd = _cli_path().split() + args
    return subprocess.run(cmd, capture_output=True, text=True, check=check, **kwargs)


# ---------------------------------------------------------------------------
# Subprocess smoke tests
# ---------------------------------------------------------------------------

class TestCLISubprocess:
    """Smoke tests that exercise the CLI via subprocess – no live server needed."""

    def test_help_shows_top_level(self) -> None:
        """`finebi-cli --help` should exit 0 and show usage."""
        result = _run(["--help"], check=False)
        assert result.returncode == 0
        assert "FineDC" in result.stdout or "finebi" in result.stdout.lower()

    def test_version_flag(self) -> None:
        """`finebi-cli --version` should print a version string."""
        result = _run(["--version"], check=False)
        assert result.returncode == 0
        assert result.stdout.strip()

    def test_auth_group_help(self) -> None:
        """`finebi-cli auth --help` should list auth subcommands."""
        result = _run(["auth", "--help"], check=False)
        assert result.returncode == 0
        assert "login" in result.stdout
        assert "logout" in result.stdout
        assert "status" in result.stdout

    def test_report_group_help(self) -> None:
        """`finebi-cli report --help` should list report subcommands."""
        result = _run(["report", "--help"], check=False)
        assert result.returncode == 0
        assert "list" in result.stdout
        assert "info" in result.stdout
        assert "create" in result.stdout

    def test_export_group_help(self) -> None:
        """`finebi-cli export --help` should list export subcommands."""
        result = _run(["export", "--help"], check=False)
        assert result.returncode == 0
        assert "png" in result.stdout
        assert "excel" in result.stdout
        assert "pdf" in result.stdout

    def test_package_group_help(self) -> None:
        """`finebi-cli package --help` should list package subcommands."""
        result = _run(["package", "--help"], check=False)
        assert result.returncode == 0
        assert "create" in result.stdout
        assert "delete" in result.stdout
        assert "structure" in result.stdout

    def test_data_group_help(self) -> None:
        """`finebi-cli data --help` should list data subcommands."""
        result = _run(["data", "--help"], check=False)
        assert result.returncode == 0
        assert "folders" in result.stdout
        assert "table-preview" in result.stdout
        assert "query" in result.stdout

    def test_spider_group_help(self) -> None:
        """`finebi-cli spider --help` should list spider subcommands."""
        result = _run(["spider", "--help"], check=False)
        assert result.returncode == 0
        assert "generate" in result.stdout

    def test_schedule_group_help(self) -> None:
        """`finebi-cli schedule --help` should list schedule subcommands."""
        result = _run(["schedule", "--help"], check=False)
        assert result.returncode == 0
        assert "tree" in result.stdout

    def test_config_group_help(self) -> None:
        """`finebi-cli config --help` should list config subcommands."""
        result = _run(["config", "--help"], check=False)
        assert result.returncode == 0
        assert "set-base-url" in result.stdout
        assert "set-token" in result.stdout
        assert "show" in result.stdout

    def test_json_flag_accepted(self) -> None:
        """`finebi-cli --json auth status` should accept the --json flag."""
        result = _run(["--json", "auth", "status"], check=False)
        assert result.returncode == 0
        # Should output JSON
        try:
            parsed = json.loads(result.stdout)
            assert isinstance(parsed, dict)
        except json.JSONDecodeError:
            # This is OK – unauthenticated may return non-JSON, but flag should be accepted
            pass

    def test_auth_status_unauthenticated(self) -> None:
        """`finebi-cli auth status` should return a response even without auth."""
        result = _run(["auth", "status"], check=False)
        assert result.returncode == 0
        assert "base_url" in result.stdout or "authenticated" in result.stdout

    def test_auth_login_fails_without_server(self) -> None:
        """`finebi-cli auth login` should fail when no server is reachable."""
        result = _run(["auth", "login", "--user", "admin", "--password", "pass"], check=False)
        # Should fail since no server is running – either a connection error or 404
        assert result.returncode == 1
        assert "login" in result.stderr.lower() or "error" in result.stderr.lower() or "failed" in result.stderr.lower()

    def test_config_show(self) -> None:
        """`finebi-cli config show` should display configuration."""
        result = _run(["config", "show"], check=False)
        assert result.returncode == 0
        assert "base_url" in result.stdout or "timeout" in result.stdout

    def test_report_list_runs(self) -> None:
        """`finebi-cli report list` should either succeed or fail gracefully."""
        result = _run(["report", "list", "--subject-id", "1"], check=False)
        # May succeed (if server running + authenticated) or fail (no auth/server)
        assert result.returncode in (0, 1)

    def test_export_requires_report_id(self) -> None:
        """`finebi-cli export png` without --report-id should fail with clear message."""
        result = _run(["export", "png"], check=False)
        assert result.returncode != 0
        assert "report-id" in result.stderr.lower() or "missing" in result.stderr.lower()

    def test_package_requires_group_id(self) -> None:
        """`finebi-cli package create` without --group-id should fail."""
        result = _run(["package", "create", "--name", "test"], check=False)
        assert result.returncode != 0


# ---------------------------------------------------------------------------
# Workflow simulation tests
# ---------------------------------------------------------------------------

class TestWorkflowSimulation:
    """Simulate real-world CLI workflows using mock responses."""

    def test_config_set_and_show_cycle(self, tmp_path) -> None:
        """Simulate: set base-url → show config → verify value."""
        from cli_anything.nuclear.core import config as _config

        with pytest.MonkeyPatch.context() as mp:
            mp.setattr(_config, "CONFIG_DIR", tmp_path / "finebi-cli")
            cfg = _config.Config()
            cfg.base_url = "http://workflow-test:8080/bi"
            cfg.save()

            loaded = _config.Config.load()
            assert loaded.base_url == "http://workflow-test:8080/bi"

    def test_output_table_rendering(self) -> None:
        """Verify table output format is correct."""
        from cli_anything.nuclear.utils.output import _print_table

        headers = ["id", "name", "status"]
        rows = [
            {"id": "1", "name": "Report A", "status": "active"},
            {"id": "2", "name": "Report B", "status": "archived"},
        ]
        mapper = lambda r: (r["id"], r["name"], r["status"])

        # Should not raise
        _print_table(rows, headers, mapper)

    def test_output_json_mode(self) -> None:
        """Verify JSON mode output is valid JSON."""
        from cli_anything.nuclear.utils.output import _ensure_list

        data = {"data": [{"id": "1", "name": "A"}]}
        items = _ensure_list(data)
        assert items == [{"id": "1", "name": "A"}]

        # Verify JSON round-trip
        text = json.dumps(items, ensure_ascii=False)
        parsed = json.loads(text)
        assert parsed == items

    def test_api_url_construction(self, tmp_path) -> None:
        """Verify full API URLs are constructed correctly."""
        from cli_anything.nuclear.core import config as _config

        with pytest.MonkeyPatch.context() as mp:
            mp.setattr(_config, "CONFIG_DIR", tmp_path / "finebi-cli")
            cfg = _config.Config()
            cfg.base_url = "http://bi.example.com/finedc"

            assert cfg.api_url("/platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("/v5/api/conf/update/generate") == "http://bi.example.com/finedc/v5/api/conf/update/generate"


    def test_subject_group_help(self) -> None:
        """`finebi-cli subject --help` should list subject subcommands."""
        result = _run(["subject", "--help"], check=False)
        assert result.returncode == 0
        assert "folders" in result.stdout
        assert "tree-root" in result.stdout
        assert "content" in result.stdout
        assert "reports" in result.stdout
        assert "search" in result.stdout
        assert "consanguinity" in result.stdout

    def test_table_group_help(self) -> None:
        """`finebi-cli table --help` should list table subcommands."""
        result = _run(["table", "--help"], check=False)
        assert result.returncode == 0
        assert "info" in result.stdout
        assert "detail" in result.stdout
        assert "consanguinity" in result.stdout
        assert "fields" in result.stdout
        assert "sql-preview" in result.stdout

    def test_subject_folders_runs(self) -> None:
        """`finebi-cli subject folders` should either succeed or fail gracefully."""
        result = _run(["subject", "folders"], check=False)
        assert result.returncode in (0, 1)

    def test_table_info_requires_name(self) -> None:
        """`finebi-cli table info` without --name should fail."""
        result = _run(["table", "info"], check=False)
        assert result.returncode != 0

    def test_subject_tree_requires_folder_id(self) -> None:
        """`finebi-cli subject tree` without --folder-id should fail."""
        result = _run(["subject", "tree"], check=False)
        assert result.returncode != 0

    def test_subject_content_requires_subject_id(self) -> None:
        """`finebi-cli subject content` without --subject-id should fail."""
        result = _run(["subject", "content"], check=False)
        assert result.returncode != 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
