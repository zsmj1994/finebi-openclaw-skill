"""
Unit tests for cli_anything.nuclear core modules.

These tests use synthetic data only – no network calls or external dependencies.
"""

from __future__ import annotations

import json as _json
import os
import sys
from pathlib import Path
from unittest import mock

import pytest

# Ensure the package is importable from the source tree
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from cli_anything.nuclear.core import config as _config
from cli_anything.nuclear.core import session as _session


# ---------------------------------------------------------------------------
# Config tests
# ---------------------------------------------------------------------------

class TestConfig:
    """Tests for Config management."""

    def test_default_values(self, tmp_path: pytest.Fixture) -> None:
        """Config should return sensible defaults when nothing is saved."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            assert cfg.base_url == _config.DEFAULT_BASE_URL
            assert cfg.version == _config.DEFAULT_VERSION
            assert cfg.timeout == 30
            assert cfg.auth_token is None
            assert cfg.current_user is None

    def test_set_and_get(self, tmp_path: pytest.Fixture) -> None:
        """Values should be stored and retrieved correctly."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://example.com/bi"
            cfg.auth_token = "secret-token"
            cfg.timeout = 60
            assert cfg.base_url == "http://example.com/bi"
            assert cfg.auth_token == "secret-token"
            assert cfg.timeout == 60

    def test_save_and_load(self, tmp_path: pytest.Fixture) -> None:
        """Config should survive a save/load round-trip."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://saved.com"
            cfg.auth_token = "token123"
            cfg.save()

            loaded = _config.Config.load()
            assert loaded.base_url == "http://saved.com"
            assert loaded.auth_token == "token123"

    def test_clear_auth(self, tmp_path: pytest.Fixture) -> None:
        """clear_auth should remove token and user."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.auth_token = "token"
            cfg.current_user = "admin"
            cfg.clear_auth()
            assert cfg.auth_token is None
            assert cfg.current_user is None

    def test_api_url(self, tmp_path: pytest.Fixture) -> None:
        """api_url should join base URL with path correctly."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://localhost:8080/bi"
            assert cfg.api_url("/platform/dashboard/list") == "http://localhost:8080/bi/platform/dashboard/list"
            assert cfg.api_url("platform/dashboard/list") == "http://localhost:8080/bi/platform/dashboard/list"


# ---------------------------------------------------------------------------
# Session tests
# ---------------------------------------------------------------------------

class TestNuclearSession:
    """Tests for NuclearSession."""

    def test_singleton(self) -> None:
        """NuclearSession.get_instance() should return the same instance."""
        _session.NuclearSession._instance = None
        s1 = _session.NuclearSession.get_instance()
        s2 = _session.NuclearSession.get_instance()
        assert s1 is s2
        _session.NuclearSession.reset()

    def test_reset_clears_instance(self) -> None:
        """reset() should clear the singleton."""
        _session.NuclearSession._instance = None
        _session.NuclearSession.get_instance()
        _session.NuclearSession.reset()
        assert _session.NuclearSession._instance is None

    def test_set_auth_token(self) -> None:
        """set_auth_token should attach a cookie to the session without raising."""
        _session.NuclearSession._instance = None
        cfg = _config.Config({"base_url": "http://localhost:8080/bi", "auth_token": None})
        s = _session.NuclearSession(cfg)
        # Should not raise – previously the missing () on _cookie_domain caused an error
        s.set_auth_token("jwt-token-xyz")

    def test_url_building(self) -> None:
        """_url should use the config base URL."""
        _session.NuclearSession._instance = None
        cfg = _config.Config({"base_url": "http://test:9000/bi"})
        s = _session.NuclearSession(cfg)
        assert s._url("/api/test") == "http://test:9000/bi/api/test"
        assert s._url("api/test") == "http://test:9000/bi/api/test"


class TestNuclearError:
    """Tests for NuclearError."""

    def test_creation(self) -> None:
        """NuclearError should be a ClickException with the right message."""
        err = _session.NuclearError("Something went wrong")
        assert err.message == "Something went wrong"

    def test_with_response(self) -> None:
        """NuclearError should preserve response and data."""
        class FakeResp:
            status_code = 401
            text = '{"error": "unauthorized"}'
        data = {"error": "unauthorized"}
        err = _session.NuclearError("401", FakeResp(), data)
        assert err.response.status_code == 401
        assert err.data == data


# ---------------------------------------------------------------------------
# Output tests
# ---------------------------------------------------------------------------

class TestOutputUtils:
    """Tests for output formatting utilities."""

    def test_ensure_list_list(self) -> None:
        """Already-a-list should be returned unchanged."""
        from cli_anything.nuclear.utils.output import _ensure_list
        assert _ensure_list([1, 2, 3]) == [1, 2, 3]

    def test_ensure_list_dict_with_data_key(self) -> None:
        """Dict with 'data' key should extract the list."""
        from cli_anything.nuclear.utils.output import _ensure_list
        assert _ensure_list({"data": [1, 2, 3]}) == [1, 2, 3]

    def test_ensure_list_dict_without_list_key(self) -> None:
        """Dict without a list key should be wrapped in a list."""
        from cli_anything.nuclear.utils.output import _ensure_list
        assert _ensure_list({"name": "test"}) == [{"name": "test"}]

    def test_ensure_list_primitive(self) -> None:
        """Primitives should be wrapped in a list."""
        from cli_anything.nuclear.utils.output import _ensure_list
        assert _ensure_list("hello") == ["hello"]
        assert _ensure_list(42) == [42]

    def test_json_roundtrip(self) -> None:
        """Data should survive a JSON serialize/deserialize round-trip."""
        from cli_anything.nuclear.utils.output import _ensure_list
        data = {"data": [{"id": "1", "name": "Report A"}]}
        items = _ensure_list(data)
        text = _json.dumps(items, ensure_ascii=False)
        parsed = _json.loads(text)
        assert parsed == items


# ---------------------------------------------------------------------------
# Auth module tests
# ---------------------------------------------------------------------------

class TestAuthModule:
    """Tests for auth module functions."""

    def test_logout_clears_config(self, tmp_path: pytest.Fixture) -> None:
        """logout() should return the logged-out user info."""
        from cli_anything.nuclear.core import auth as _auth

        cfg = _config.Config()
        cfg.auth_token = "token"
        cfg.current_user = "admin"

        # Patch where get_config is *used* (in auth module), not where it is defined
        with mock.patch.object(_auth, "get_config", return_value=cfg):
            with mock.patch.object(_auth, "save_config"):
                _session.NuclearSession._instance = None
                result = _auth.logout()
                assert result["user"] == "admin"
                assert result["status"] == "logged_out"

    def test_status_returns_auth_info(self) -> None:
        """status() should return current auth status from config."""
        from cli_anything.nuclear.core import auth as _auth

        cfg = _config.Config({
            "base_url": "http://x.com",
            "auth_token": "tok",
            "current_user": "bob",
            "version": "v2",
        })
        with mock.patch.object(_auth, "get_config", return_value=cfg):
            result = _auth.status()
            assert result["base_url"] == "http://x.com"
            assert result["user"] == "bob"
            assert result["authenticated"] is True
            assert result["version"] == "v2"


# ---------------------------------------------------------------------------
# Requires_auth decorator tests
# ---------------------------------------------------------------------------

class TestRequiresAuth:
    """Tests for the @requires_auth decorator."""

    def test_aborts_without_token(self) -> None:
        """Should raise ClickException when no token is set."""
        from click import ClickException
        from cli_anything.nuclear.core.session import requires_auth, get_config as _sess_gc

        cfg = _config.Config()
        cfg.auth_token = None

        # Patch where get_config is used in the session module
        import cli_anything.nuclear.core.session as _sess_mod
        with mock.patch.object(_sess_mod, "get_config", return_value=cfg):
            @requires_auth
            def protected_fn() -> str:
                return "secret"

            with pytest.raises(ClickException):
                protected_fn()

    def test_passes_with_token(self) -> None:
        """Should execute the function when a token is set."""
        from cli_anything.nuclear.core.session import requires_auth

        cfg = _config.Config()
        cfg.auth_token = "valid-token"

        import cli_anything.nuclear.core.session as _sess_mod
        with mock.patch.object(_sess_mod, "get_config", return_value=cfg):
            @requires_auth
            def protected_fn() -> str:
                return "ok"

            assert protected_fn() == "ok"


# ---------------------------------------------------------------------------
# Workflow / integration tests
# ---------------------------------------------------------------------------

class TestWorkflowSimulation:
    """Simulate real-world CLI workflows."""

    def test_config_save_load_cycle(self, tmp_path: pytest.Fixture) -> None:
        """Simulate: set base-url → save → load → verify value."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://workflow-test:8080/bi"
            cfg.save()

            loaded = _config.Config.load()
            assert loaded.base_url == "http://workflow-test:8080/bi"

    def test_output_table_headers_and_rows(self) -> None:
        """Verify table output format handles multiple rows correctly."""
        from cli_anything.nuclear.utils.output import _print_table

        headers = ["id", "name", "status"]
        rows = [
            {"id": "1", "name": "Report A", "status": "active"},
            {"id": "2", "name": "Report B", "status": "archived"},
        ]
        mapper = lambda r: (r["id"], r["name"], r["status"])
        # Should not raise
        _print_table(rows, headers, mapper)

    def test_api_url_various_paths(self, tmp_path: pytest.Fixture) -> None:
        """API URL construction should be correct for various path styles."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://bi.example.com/finedc"

            assert cfg.api_url("/platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("/v5/api/conf/update/generate") == "http://bi.example.com/finedc/v5/api/conf/update/generate"


# ---------------------------------------------------------------------------
# Subject module tests
# ---------------------------------------------------------------------------

class TestSubjectModule:
    """Tests for subject module API URL patterns."""

    def test_subject_folders_url(self) -> None:
        """subject_folders() should call /v5/api/conf/subjects/first/folders."""
        from cli_anything.nuclear.core import subject as _subject

        with mock.patch.object(_session.NuclearSession, "api_get") as mock_get:
            mock_get.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _subject.subject_folders()
            mock_get.assert_called_once()
            args = mock_get.call_args[0]
            assert "conf/subjects/first/folders" in args[0]

    def test_subject_folder_url(self) -> None:
        """subject_folder_contents() should call /v5/api/conf/subjects/folders/{id}."""
        from cli_anything.nuclear.core import subject as _subject

        with mock.patch.object(_session.NuclearSession, "api_get") as mock_get:
            mock_get.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _subject.subject_folder_contents("abc123")
            args = mock_get.call_args[0]
            assert "conf/subjects/folders/abc123" in args[0]


# ---------------------------------------------------------------------------
# Table module tests
# ---------------------------------------------------------------------------

class TestTableModule:
    """Tests for table module API URL patterns."""

    def test_table_info_url(self) -> None:
        """table_info() should call /v5/api/conf/tables/{name}."""
        from cli_anything.nuclear.core import table as _table

        with mock.patch.object(_session.NuclearSession, "api_get") as mock_get:
            mock_get.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _table.table_info("sales")
            args = mock_get.call_args[0]
            assert "conf/tables/sales" in args[0]

    def test_table_consanguinity_url(self) -> None:
        """table_consanguinity() should POST to /v5/api/conf/tables/consanguinity."""
        from cli_anything.nuclear.core import table as _table

        with mock.patch.object(_session.NuclearSession, "api_post") as mock_post:
            mock_post.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _table.table_consanguinity({"tableName": "sales"})
            args = mock_post.call_args[0]
            assert "conf/tables/consanguinity" in args[0]


# ---------------------------------------------------------------------------
# Session: api_put
# ---------------------------------------------------------------------------

class TestApiPut:
    """Tests for the api_put helper."""

    def test_api_put_method(self) -> None:
        """NuclearSession.api_put should send a PUT request with JSON body."""
        _session.NuclearSession._instance = None
        cfg = _config.Config()
        cfg.base_url = "http://test:9000/bi"
        cfg.auth_token = "tok"
        s = _session.NuclearSession(cfg)
        with mock.patch.object(s._session, "put") as mock_put:
            mock_put.return_value.text = '{"status": "ok"}'
            mock_put.return_value.status_code = 200
            result = s.api_put("/test/endpoint", body={"name": "foo"})
            mock_put.assert_called_once()
            _, kwargs = mock_put.call_args
            assert kwargs["json"] == {"name": "foo"}


# ---------------------------------------------------------------------------
# Workflow / integration tests
# ---------------------------------------------------------------------------

class TestWorkflowSimulation:
    """Simulate real-world CLI workflows."""

    def test_config_save_load_cycle(self, tmp_path: pytest.Fixture) -> None:
        """Simulate: set base-url → save → load → verify value."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://workflow-test:8080/bi"
            cfg.save()

            loaded = _config.Config.load()
            assert loaded.base_url == "http://workflow-test:8080/bi"

    def test_output_table_headers_and_rows(self) -> None:
        """Verify table output format handles multiple rows correctly."""
        from cli_anything.nuclear.utils.output import _print_table

        headers = ["id", "name", "status"]
        rows = [
            {"id": "1", "name": "Report A", "status": "active"},
            {"id": "2", "name": "Report B", "status": "archived"},
        ]
        mapper = lambda r: (r["id"], r["name"], r["status"])
        # Should not raise
        _print_table(rows, headers, mapper)

    def test_api_url_various_paths(self, tmp_path: pytest.Fixture) -> None:
        """API URL construction should be correct for various path styles."""
        with mock.patch.object(_config, "CONFIG_DIR", tmp_path / "finebi-cli"):
            cfg = _config.Config()
            cfg.base_url = "http://bi.example.com/finedc"

            assert cfg.api_url("/platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("platform/dashboard/list") == "http://bi.example.com/finedc/platform/dashboard/list"
            assert cfg.api_url("/v5/api/conf/update/generate") == "http://bi.example.com/finedc/v5/api/conf/update/generate"

    def test_subject_api_urls(self) -> None:
        """Subject module should use correct v5/api/conf/subjects/* paths."""
        from cli_anything.nuclear.core import subject as _subject

        with mock.patch.object(_session.NuclearSession, "api_get") as mock_get:
            mock_get.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _subject.subject_tree_root()
            assert "conf/subjects/tree" in mock_get.call_args[0][0]

    def test_table_api_urls(self) -> None:
        """Table module should use correct v5/api/conf/tables/* paths."""
        from cli_anything.nuclear.core import table as _table

        with mock.patch.object(_session.NuclearSession, "api_get") as mock_get:
            mock_get.return_value = {}
            _session.NuclearSession._instance = None
            cfg = _config.Config()
            cfg.auth_token = "tok"
            s = _session.NuclearSession(cfg)
            _table.table_detail("my_table")
            assert "conf/tables/detail/my_table" in mock_get.call_args[0][0]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
