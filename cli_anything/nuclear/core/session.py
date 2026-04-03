"""HTTP session management for Nuclear CLI."""

from __future__ import annotations

import functools
import json as _json
from typing import Any, Callable, Optional

import click
import requests
from requests import Response, Session

from cli_anything.nuclear.core.config import Config, get_config

# Alias
FineRespond = dict[str, Any]


def _json_loads(text: str) -> Any:
    """Parse JSON, stripping a trailing semicolon if present."""
    text = text.strip()
    if text.endswith(";"):
        text = text[:-1]
    return _json.loads(text)


class NuclearSession:
    """Stateful HTTP session for the FineDC / Nuclear BI API.

    Wraps a ``requests.Session`` and attaches authentication (JWT cookie or
    token) from the shared :class:`Config`.  Provides typed API call helpers
    that return structured results or raise :class:`NuclearError`.
    """

    _instance: Optional["NuclearSession"] = None

    def __init__(self, cfg: Optional[Config] = None) -> None:
        self.cfg = cfg or get_config()
        self._session: Session = requests.Session()
        self._session.headers.update({
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "finebi-cli/1.0",
        })
        # Auto-restore auth token from saved config
        if self.cfg.auth_token:
            self._session.headers["Authorization"] = f"Bearer {self.cfg.auth_token}"

    @classmethod
    def get_instance(cls) -> "NuclearSession":
        """Return the singleton session, creating it once."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton (useful for testing / logout)."""
        if cls._instance is not None:
            cls._instance.close()
        cls._instance = None

    def close(self) -> None:
        self._session.close()

    # --- Auth helpers --------------------------------------------------------

    def set_auth_token(self, token: str) -> None:
        """Attach a JWT auth token as an Authorization Bearer header."""
        self._session.headers["Authorization"] = f"Bearer {token}"

    # --- Core request methods ------------------------------------------------

    def _url(self, path: str) -> str:
        return self.cfg.api_url(path)

    def _auth_params(self, params: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        """Merge caller params with the fine_auth_token query param."""
        merged = dict(params) if params else {}
        token = self.cfg.auth_token
        if token and "fine_auth_token" not in merged:
            merged["fine_auth_token"] = token
        return merged

    def get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        *,
        stream: bool = False,
        timeout: Optional[int] = None,
    ) -> Response:
        timeout = timeout or self.cfg.timeout
        url = self._url(path)
        return self._session.get(url, params=self._auth_params(params), timeout=timeout, stream=stream)

    def post(
        self,
        path: str,
        json: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        *,
        timeout: Optional[int] = None,
    ) -> Response:
        timeout = timeout or self.cfg.timeout
        url = self._url(path)
        return self._session.post(url, json=json, params=self._auth_params(params), timeout=timeout)

    def post_file(
        self,
        path: str,
        files: dict[str, Any],
        data: Optional[dict[str, Any]] = None,
        *,
        timeout: Optional[int] = None,
    ) -> Response:
        timeout = timeout or self.cfg.timeout
        url = self._url(path)
        return self._session.post(url, files=files, data=data, timeout=timeout)

    def api_put(
        self,
        path: str,
        body: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        *,
        require_success: bool = True,
    ) -> FineRespond:
        """Call PUT with a JSON body and return the parsed response."""
        timeout = self.cfg.timeout
        url = self._url(path)
        resp = self._session.put(url, json=body, params=self._auth_params(params), timeout=timeout)
        return self._parse_response(resp, require_success)

    # --- Typed API helpers ---------------------------------------------------

    def api_get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        *,
        require_success: bool = True,
    ) -> FineRespond:
        """Call GET and return the parsed JSON body, or raise NuclearError."""
        resp = self.get(path, params=params)
        return self._parse_response(resp, require_success)

    def api_post(
        self,
        path: str,
        body: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        *,
        require_success: bool = True,
    ) -> FineRespond:
        """Call POST with a JSON body and return the parsed response."""
        resp = self.post(path, json=body, params=params)
        return self._parse_response(resp, require_success)

    def decision_get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        *,
        require_success: bool = True,
    ) -> FineRespond:
        """Call GET on the FineReport Decision platform and return parsed JSON."""
        timeout = self.cfg.timeout
        url = self.cfg.decision_url(path)
        resp = self._session.get(url, params=self._auth_params(params), timeout=timeout)
        return self._parse_response(resp, require_success)

    def decision_post(
        self,
        path: str,
        body: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        *,
        require_success: bool = True,
    ) -> FineRespond:
        """Call POST on the FineReport Decision platform and return parsed JSON."""
        timeout = self.cfg.timeout
        url = self.cfg.decision_url(path)
        resp = self._session.post(url, json=body, params=self._auth_params(params), timeout=timeout)
        return self._parse_response(resp, require_success)

    def api_file_get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        *,
        timeout: Optional[int] = None,
    ) -> bytes:
        """Download a file (PNG / Excel / PDF)."""
        resp = self.get(path, params=params, stream=True, timeout=timeout)
        self._raise_for_status(resp)
        return resp.content

    def _parse_response(self, resp: Response, require_success: bool) -> FineRespond:
        self._raise_for_status(resp)
        text = resp.text.strip()

        # Handle JSONP responses: callback({...})  or  callback([...])
        if text.startswith("callback(") and text.endswith(")"):
            text = text[len("callback("):-1]

        try:
            data = _json_loads(text)
        except ValueError as exc:
            raise NuclearError(f"Non-JSON response from API: {resp.text[:200]}", resp) from exc

        if require_success and isinstance(data, dict):
            # Check for error codes
            if data.get("errorCode") and data.get("errorMsg"):
                raise NuclearError(
                    data["errorMsg"],
                    resp,
                    data,
                )
            status = data.get("status", data.get("success"))
            if status is False or data.get("error"):
                raise NuclearError(
                    data.get("message") or data.get("msg") or str(data.get("error")),
                    resp,
                    data,
                )
        return data

    def _raise_for_status(self, resp: Response) -> None:
        try:
            resp.raise_for_status()
        except requests.HTTPError as exc:
            raise NuclearError(f"HTTP {resp.status_code}: {resp.reason}", resp) from exc


# --- Error types ------------------------------------------------------------

class NuclearError(click.ClickException):
    """Raised when the API returns an error or an unexpected HTTP status occurs."""

    def __init__(
        self,
        message: str,
        response: Optional[Response] = None,
        data: Optional[FineRespond] = None,
    ) -> None:
        super().__init__(message)
        self.response = response
        self.data = data


# --- Decorators --------------------------------------------------------------

def requires_auth(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator that aborts if no auth token is configured."""

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        cfg = get_config()
        if not cfg.auth_token:
            raise click.ClickException(
                "Not authenticated. Run: finebi-cli auth login --url <url> --user <user> --password <password>"
            )
        return func(*args, **kwargs)

    return wrapper
