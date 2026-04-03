"""Configuration management for Nuclear CLI."""

from __future__ import annotations

import json
import os
import platform
from pathlib import Path
from typing import Any, Optional

import click

DEFAULT_BASE_URL = "http://localhost:8080/bi"
DEFAULT_VERSION = "v5"
CONFIG_FILE_NAME = "config.json"

_platform = platform.system()
if _platform == "Windows":
    _CONFIG_HOME = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
elif _platform == "Darwin":
    _CONFIG_HOME = Path.home() / "Library" / "Application Support"
else:
    _CONFIG_HOME = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))

CONFIG_DIR = Path(os.environ.get("FINEBI_CONFIG_DIR", _CONFIG_HOME / "finebi-cli"))
CONFIG_FILE = CONFIG_DIR / CONFIG_FILE_NAME


class Config:
    """Nuclear CLI configuration manager.

    Stores base URL, auth token, default API version, and other settings
    in a JSON file at ~/.finebi-cli/config.json.
    """

    def __init__(self, data: Optional[dict[str, Any]] = None) -> None:
        self._data: dict[str, Any] = data or {}
        self._dirty = data is None

    @classmethod
    def _config_path(cls) -> Path:
        """Path to the config file – computed dynamically so it follows CONFIG_DIR."""
        return CONFIG_DIR / CONFIG_FILE_NAME

    @classmethod
    def load(cls) -> "Config":
        """Load configuration from disk."""
        path = cls._config_path()
        if path.exists():
            try:
                with open(path) as f:
                    return cls(json.load(f))
            except (json.JSONDecodeError, OSError):
                return cls()
        return cls()

    def save(self) -> None:
        """Save configuration to disk."""
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        self._config_path().write_text(json.dumps(self._data, indent=2, ensure_ascii=False))

    # --- Accessors -----------------------------------------------------------

    @property
    def base_url(self) -> str:
        return self._data.get("base_url", DEFAULT_BASE_URL).rstrip("/")

    @base_url.setter
    def base_url(self, value: str) -> None:
        self._set("base_url", value.rstrip("/"))

    @property
    def auth_token(self) -> Optional[str]:
        return self._data.get("auth_token")

    @auth_token.setter
    def auth_token(self, value: Optional[str]) -> None:
        self._set("auth_token", value)

    @property
    def version(self) -> str:
        return self._data.get("version", DEFAULT_VERSION)

    @version.setter
    def version(self, value: str) -> None:
        self._set("version", value)

    @property
    def current_user(self) -> Optional[str]:
        return self._data.get("current_user")

    @current_user.setter
    def current_user(self, value: Optional[str]) -> None:
        self._set("current_user", value)

    @property
    def timeout(self) -> int:
        return int(self._data.get("timeout", 30))

    @timeout.setter
    def timeout(self, value: int) -> None:
        self._set("timeout", value)

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._set(key, value)

    def _set(self, key: str, value: Any) -> None:
        if self._data.get(key) != value:
            self._data[key] = value
            self._dirty = True

    def is_dirty(self) -> bool:
        return self._dirty

    def clear_auth(self) -> None:
        self._data.pop("auth_token", None)
        self._data.pop("current_user", None)
        self._dirty = True

    # --- CLI helpers ---------------------------------------------------------

    def ensure_base_url(self, ctx: click.Context, param: Any, value: Optional[str]) -> Optional[str]:
        if value:
            return value.rstrip("/")
        # If --url was not passed, ensure config has a base_url
        if not self.base_url:
            raise click.BadParameter(
                "No base URL set.  Use --url or 'finebi-cli config set-base-url <url>'."
            )
        return self.base_url

    def api_url(self, path: str) -> str:
        """Build a full API URL from a relative path."""
        return f"{self.base_url}/{path.lstrip('/')}"

    def decision_url(self, path: str) -> str:
        """Build a full URL for the FineReport Decision platform.

        Handles two common base_url patterns:
        - BI URL:       ``http://localhost:8080/bi``       → WebReport root = ``http://localhost:8080/WebReport``
        - Decision URL: ``http://localhost:8080/WebReport/decision`` → WebReport root = ``http://localhost:8080/WebReport``
        """
        base = self.base_url
        if "/WebReport" in base:
            # Already points at (or inside) the WebReport webapp – find the root
            idx = base.index("/WebReport")
            webroot = base[: idx + len("/WebReport")]
        else:
            # Derive from BI-style URL by stripping the last path segment
            parts = base.rsplit("/", 1)
            server_root = parts[0] if len(parts) == 2 and parts[1] else base
            webroot = f"{server_root}/WebReport"
        return f"{webroot}/{path.lstrip('/')}"


# Global config instance (lazy)
_config: Optional[Config] = None


def get_config() -> Config:
    """Return the global Config singleton, loading from disk on first call."""
    global _config
    if _config is None:
        _config = Config.load()
    return _config


def save_config() -> None:
    """Persist the global config to disk if it is dirty."""
    global _config
    if _config is not None and _config.is_dirty():
        _config.save()
        _config._dirty = False
