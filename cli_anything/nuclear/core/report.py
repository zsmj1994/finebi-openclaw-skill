"""Report management module for Nuclear CLI."""

from __future__ import annotations

from typing import Any, Optional

from cli_anything.nuclear.core.session import NuclearSession, requires_auth
from cli_anything.nuclear.utils.output import output_result


@requires_auth
def report_create(data: str, **kwargs: Any) -> dict[str, Any]:
    """Create a new report/dashboard."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/reports", params={"data": data, **kwargs})


@requires_auth
def report_list(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """List reports for a given subject."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/list", params={"subjectId": subject_id, **kwargs})


@requires_auth
def report_info(report_ids: str, **kwargs: Any) -> dict[str, Any]:
    """Get detailed information for one or more reports."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/reports/info", params={"info": report_ids, **kwargs})


@requires_auth
def report_rename(info: str, **kwargs: Any) -> dict[str, Any]:
    """Rename a report."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/rename", params={"info": info, **kwargs})


@requires_auth
def report_delete(report_id: str, **kwargs: Any) -> dict[str, Any]:
    """Delete a report."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/platform/dashboard/report", params={"reportId": report_id, **kwargs})


@requires_auth
def report_save_as(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Save a report as a copy."""
    session = NuclearSession.get_instance()
    return session.api_post("/v5/api/platform/dashboard/saveas", body=body, params=kwargs)


@requires_auth
def report_show(report_id: str, info: Optional[str] = None, **kwargs: Any) -> dict[str, Any]:
    """Show / preview a report."""
    session = NuclearSession.get_instance()
    params = {"reportId": report_id, **kwargs}
    if info:
        params["info"] = info
    return session.api_get(f"/v5/api/dashboard/report/{report_id}/show", params=params)


@requires_auth
def report_consanguinity(report_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get report lineage / consanguinity analysis."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/dashboard/report/consanguinity", params={"reportId": report_id, **kwargs})


@requires_auth
def report_check(**kwargs: Any) -> dict[str, Any]:
    """Check report state."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/dashboard/report/check", params=kwargs)
