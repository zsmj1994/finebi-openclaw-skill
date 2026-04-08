"""Authentication module for Nuclear CLI."""

from __future__ import annotations

from typing import Any, Optional

import click

from cli_anything.nuclear.core.config import Config, get_config, save_config
from cli_anything.nuclear.core.session import NuclearSession, requires_auth
from cli_anything.nuclear.utils.output import output_result


def login(
    base_url: str,
    username: str,
    password: str,
    *,
    timeout: int = 30,
) -> dict[str, Any]:
    """Authenticate to the FineDC server and store the token.

    FineDC expects a JSON POST to /login with:
      {"username": "...", "password": "...", "encrypted": false, "tenantId": ""}

    Returns a dict with user info and token.
    """
    import requests

    url = f"{base_url.rstrip('/')}/login"
    payload = {
        "username": username,
        "password": password,
        "encrypted": False,
        "tenantId": "",
    }
    resp = requests.post(
        url,
        json=payload,
        headers={
            "User-Agent": "finebi-cli/1.0",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=timeout,
    )

    if resp.status_code != 200:
        detail = ""
        try:
            body = resp.json()
            detail = body.get("message") or body.get("msg") or body.get("error") or ""
        except Exception:
            detail = resp.text[:200] if resp.text else resp.reason
        raise click.ClickException(
            f"Login failed: HTTP {resp.status_code} – {detail}"
        )

    # Guard: reject non-JSON responses (e.g. HTML error pages)
    content_type = resp.headers.get("Content-Type", "")
    if not content_type.startswith("application/json") and not resp.text.strip().startswith("{"):
        # Try to extract a meaningful error from the HTML body
        text = resp.text
        if "User not exist" in text or "wrong password" in text.lower():
            raise click.ClickException("Login failed: User not exist, or wrong password!")
        if "locked" in text.lower() or "disabled" in text.lower():
            raise click.ClickException("Login failed: Account locked or disabled.")
        raise click.ClickException(
            f"Login failed: unexpected non-JSON response (Content-Type: {content_type}). "
            "Check the base URL is correct."
        )

    # Extract token from response
    token: Optional[str] = None
    try:
        body = resp.json()
        # FineDC returns accessToken in the response data
        data = body.get("data", body)
        token = (
            data.get("accessToken")
            or data.get("access_token")
            or data.get("token")
            or body.get("accessToken")
            or body.get("access_token")
            or body.get("token")
        )
    except Exception:
        pass

    # Fallback: check cookies
    if not token:
        for cookie_name in ("fine_auth_token", "FINE_AUTH_TOKEN", "token"):
            if cookie_name in resp.cookies:
                token = resp.cookies[cookie_name]
                break

    # Last resort: raw response text
    if not token:
        token = resp.text.strip().strip('"')

    cfg = get_config()
    cfg.base_url = base_url.rstrip("/")
    cfg.auth_token = token
    cfg.current_user = username
    cfg.timeout = timeout
    save_config()

    # Also update the session
    session = NuclearSession.get_instance()
    session.cfg = cfg
    session.set_auth_token(token)

    return {"user": username, "token": token, "base_url": cfg.base_url}


def logout() -> dict[str, Any]:
    """Clear the stored auth token and reset the session."""
    cfg = get_config()
    user = cfg.current_user
    cfg.clear_auth()
    save_config()
    NuclearSession.reset()
    return {"user": user, "status": "logged_out"}


def status() -> dict[str, Any]:
    """Return current auth status."""
    cfg = get_config()
    return {
        "base_url": cfg.base_url,
        "user": cfg.current_user,
        "authenticated": bool(cfg.auth_token),
        "version": cfg.version,
    }
