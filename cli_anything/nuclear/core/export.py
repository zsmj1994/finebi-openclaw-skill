"""Export module for Nuclear CLI (PNG, Excel, PDF)."""

from __future__ import annotations

import os
from typing import Any, Optional

import click

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


@requires_auth
def export_png(
    report_id: str,
    widget_id: Optional[str] = None,
    output_path: Optional[str] = None,
    **kwargs: Any,
) -> bytes:
    """Export a report as a PNG image."""
    session = NuclearSession.get_instance()
    params = {"reportId": report_id}
    if widget_id:
        params["widgetId"] = widget_id
    params.update(kwargs)
    data = session.api_file_get("/v5/api/dashboard/report/export/png", params=params)

    output_path = output_path or f"report_{report_id}.png"
    with open(output_path, "wb") as f:
        f.write(data)
    return data


@requires_auth
def export_excel(
    report_id: str,
    widget_id: Optional[str] = None,
    output_path: Optional[str] = None,
    **kwargs: Any,
) -> bytes:
    """Export a report as an Excel file."""
    session = NuclearSession.get_instance()
    params = {"reportId": report_id}
    if widget_id:
        params["widgetId"] = widget_id
    params.update(kwargs)
    data = session.api_file_get("/v5/api/dashboard/report/export/excel", params=params)

    output_path = output_path or f"report_{report_id}.xlsx"
    with open(output_path, "wb") as f:
        f.write(data)
    return data


@requires_auth
def export_pdf(
    report_id: str,
    widget_id: Optional[str] = None,
    output_path: Optional[str] = None,
    **kwargs: Any,
) -> bytes:
    """Export a report as a PDF document."""
    session = NuclearSession.get_instance()
    params = {"reportId": report_id}
    if widget_id:
        params["widgetId"] = widget_id
    params.update(kwargs)
    data = session.api_file_get("/v5/api/dashboard/report/export/pdf", params=params)

    output_path = output_path or f"report_{report_id}.pdf"
    with open(output_path, "wb") as f:
        f.write(data)
    return data
