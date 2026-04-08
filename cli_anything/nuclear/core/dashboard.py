"""Dashboard management module for Nuclear CLI."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


@requires_auth
def dashboard_list(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """List dashboards for a given subject."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/list", params={"subjectId": subject_id, **kwargs})


@requires_auth
def shared_dashboards(**kwargs: Any) -> dict[str, Any]:
    """List shared dashboards."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/dashboard/share", params=kwargs)


@requires_auth
def dashboard_public_link_create(report_id: str, user_id: str = "", **kwargs: Any) -> dict[str, Any]:
    """Create a public sharing link for a report."""
    session = NuclearSession.get_instance()
    path = f"/v5/api/platform/dashboard/{report_id}/create"
    params = {"userId": user_id, **kwargs} if user_id else kwargs
    return session.api_get(path, params=params)


@requires_auth
def dashboard_widget_data(report_id: str, widget_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get data for a specific widget within a report."""
    session = NuclearSession.get_instance()
    return session.api_get(
        "/v5/api/dashboard/report/widget/data",
        params={"reportId": report_id, "widgetId": widget_id, **kwargs},
    )
