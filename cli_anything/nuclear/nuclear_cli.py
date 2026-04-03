#!/usr/bin/env python3
"""
finebi-cli – CLI harness for FineDC / Nuclear BI Platform.

Usage examples::

    finebi-cli auth login --url http://localhost:8080/bi --user admin --password admin
    finebi-cli report list --subject-id 1
    finebi-cli export pdf --report-id 123 --output report.pdf
    finebi-cli package list
    finebi-cli data folders
    finebi-cli spider generate
"""

from __future__ import annotations

import json
import sys
from typing import Any

import click

from cli_anything.nuclear import __version__
from cli_anything.nuclear.core import auth as _auth
from cli_anything.nuclear.core import entry as _entry
from cli_anything.nuclear.core import config as _config
from cli_anything.nuclear.core import dashboard as _dashboard
from cli_anything.nuclear.core import data as _data
from cli_anything.nuclear.core import export as _export
from cli_anything.nuclear.core import package as _package
from cli_anything.nuclear.core import report as _report
from cli_anything.nuclear.core import schedule as _schedule
from cli_anything.nuclear.core import spider as _spider
from cli_anything.nuclear.core import subject as _subject
from cli_anything.nuclear.core import table as _table
from cli_anything.nuclear.core.session import NuclearError, NuclearSession
from cli_anything.nuclear.utils.output import output_result, print_entry_tree, print_tree


# ---------------------------------------------------------------------------
# Shared options
# ---------------------------------------------------------------------------

_url_option = click.option(
    "--url",
    "base_url",
    help="FineDC / Nuclear BI base URL (e.g. http://localhost:8080/bi)",
)
_timeout_option = click.option(
    "--timeout",
    type=int,
    default=None,
    help="Request timeout in seconds (default: from config or 30)",
)


def _common_options(func):
    func = _url_option(func)
    func = _timeout_option(func)
    return func


# ---------------------------------------------------------------------------
# CLI root
# ---------------------------------------------------------------------------

@click.group(
    "finebi-cli",
    context_settings={"help_option_names": ["-h", "--help"]},
    invoke_without_command=True,
)
@click.option("--json", "json_mode", is_flag=True, help="Output raw JSON (good for piping / scripting).")
@click.option("-v", "--version", is_flag=True, help="Print version and exit.")
@click.pass_context
def cli(ctx: click.Context, json_mode: bool, version: bool) -> None:
    """finebi-cli – CLI for the FineDC / Nuclear BI platform."""
    ctx.obj = {"json_mode": json_mode}
    if version:
        click.echo(__version__)
        ctx.exit(0)
    if ctx.invoked_subcommand is None:
        click.echo(ctx.get_help())


# ---------------------------------------------------------------------------
# auth group
# ---------------------------------------------------------------------------

@cli.group("auth", help="Authentication management.")
def auth_group() -> None:
    pass


@auth_group.command("login")
@_common_options
@click.option("--user", "-u", required=True, help="Username.")
@click.option("--password", "-p", "passwd", required=True, help="Password.")
@click.pass_context
def auth_login(ctx: click.Context, base_url: str, user: str, passwd: str, timeout: int | None) -> None:
    """Login to FineDC / Nuclear BI."""
    if not base_url:
        cfg = _config.get_config()
        base_url = cfg.base_url
        if not base_url:
            raise click.BadParameter("No base URL.  Use --url or set it via 'nuclear config set-base-url'.")
    try:
        result = _auth.login(base_url, user, passwd, timeout=timeout or 30)
        output_result(ctx, result, single=True)
        click.secho("✓ Logged in successfully.", fg="green")
    except NuclearError as e:
        raise click.ClickException(str(e)) from e


@auth_group.command("logout")
@click.pass_context
def auth_logout(ctx: click.Context) -> None:
    """Logout and clear stored credentials."""
    result = _auth.logout()
    output_result(ctx, result, single=True)
    click.secho("✓ Logged out.", fg="green")


@auth_group.command("status")
@click.pass_context
def auth_status(ctx: click.Context) -> None:
    """Show current authentication status."""
    result = _auth.status()
    output_result(ctx, result, single=True)


# ---------------------------------------------------------------------------
# config group
# ---------------------------------------------------------------------------

@cli.group("config", help="CLI configuration management.")
def config_group() -> None:
    pass


@config_group.command("set-base-url")
@click.argument("url")
def config_set_url(url: str) -> None:
    """Set the default FineDC base URL."""
    cfg = _config.get_config()
    cfg.base_url = url.rstrip("/")
    _config.save_config()
    click.secho(f"✓ Base URL set to: {cfg.base_url}", fg="green")


@config_group.command("set-token")
@click.argument("token")
def config_set_token(token: str) -> None:
    """Set the auth token (JWT)."""
    cfg = _config.get_config()
    cfg.auth_token = token
    _config.save_config()
    NuclearSession.get_instance().set_auth_token(token)
    click.secho("✓ Auth token saved.", fg="green")


@config_group.command("show")
@click.pass_context
def config_show(ctx: click.Context) -> None:
    """Show current configuration (token is redacted)."""
    cfg = _config.get_config()
    data = {
        "base_url": cfg.base_url,
        "version": cfg.version,
        "timeout": cfg.timeout,
        "current_user": cfg.current_user,
        "auth_token": ("[redacted]" if cfg.auth_token else None),
    }
    output_result(ctx, data, single=True)


# ---------------------------------------------------------------------------
# report group
# ---------------------------------------------------------------------------

@cli.group("report", help="Report management (CRUD, save-as, lineage).")
def report_group() -> None:
    pass


@report_group.command("create")
@click.option("--data", required=True, help="Encrypted or encoded report data string.")
@click.pass_context
def report_create(ctx: click.Context, data: str) -> None:
    """Create a new report/dashboard."""
    result = _report.report_create(data)
    output_result(ctx, result)


@report_group.command("list")
@click.option("--subject-id", required=True, help="Subject ID to list reports for.")
@click.pass_context
def report_list(ctx: click.Context, subject_id: str) -> None:
    """List reports for a subject."""
    result = _report.report_list(subject_id)
    output_result(
        ctx,
        result,
        table_headers=["id", "name", "subject", "created", "modified"],
        row_mapper=lambda r: (
            r.get("id", ""),
            r.get("name", ""),
            r.get("subjectName", ""),
            r.get("createTime", ""),
            r.get("modifyTime", ""),
        ),
    )


@report_group.command("info")
@click.option("--report-ids", required=True, help="Comma-separated report ID(s).")
@click.pass_context
def report_info(ctx: click.Context, report_ids: str) -> None:
    """Get detailed info for one or more reports."""
    result = _report.report_info(report_ids)
    output_result(ctx, result)


@report_group.command("rename")
@click.option("--info", required=True, help="Encrypted info string (reportId+newName).")
@click.pass_context
def report_rename(ctx: click.Context, info: str) -> None:
    """Rename a report."""
    result = _report.report_rename(info)
    output_result(ctx, result)
    click.secho("✓ Report renamed.", fg="green")


@report_group.command("delete")
@click.option("--report-id", required=True, help="Report ID to delete.")
@click.pass_context
def report_delete(ctx: click.Context, report_id: str) -> None:
    """Delete a report."""
    if not click.confirm(f"Delete report {report_id}?"):
        ctx.exit(0)
    result = _report.report_delete(report_id)
    output_result(ctx, result)
    click.secho("✓ Report deleted.", fg="green")


@report_group.command("save-as")
@click.option("--report-id", required=True, help="Source report ID.")
@click.option("--new-name", required=True, help="Name for the new copy.")
@click.pass_context
def report_save_as(ctx: click.Context, report_id: str, new_name: str) -> None:
    """Save a report as a copy."""
    body = {"reportId": report_id, "newName": new_name}
    result = _report.report_save_as(body)
    output_result(ctx, result)
    click.secho("✓ Report saved as copy.", fg="green")


@report_group.command("consanguinity")
@click.option("--report-id", required=True, help="Report ID.")
@click.pass_context
def report_consanguinity(ctx: click.Context, report_id: str) -> None:
    """Show report lineage / consanguinity analysis."""
    result = _report.report_consanguinity(report_id)
    output_result(ctx, result)


@report_group.command("check")
@click.pass_context
def report_check(ctx: click.Context) -> None:
    """Check the state of a report."""
    result = _report.report_check()
    output_result(ctx, result, single=True)


# ---------------------------------------------------------------------------
# dashboard group
# ---------------------------------------------------------------------------

@cli.group("dashboard", help="Dashboard operations (listing, sharing, widget data).")
def dashboard_group() -> None:
    pass


@dashboard_group.command("list")
@click.option("--subject-id", help="Subject ID.")
@click.pass_context
def dashboard_list(ctx: click.Context, subject_id: str) -> None:
    """List dashboards for a subject."""
    result = _dashboard.dashboard_list(subject_id or "")
    output_result(
        ctx,
        result,
        table_headers=["id", "name", "subject", "type", "created"],
        row_mapper=lambda r: (
            r.get("id", ""),
            r.get("name", ""),
            r.get("subjectName", ""),
            r.get("type", ""),
            r.get("createTime", ""),
        ),
    )


@dashboard_group.command("shared")
@click.pass_context
def dashboard_shared(ctx: click.Context) -> None:
    """List shared dashboards."""
    result = _dashboard.shared_dashboards()
    output_result(ctx, result)


@dashboard_group.command("share")
@click.option("--report-id", required=True, help="Report ID.")
@click.option("--user-id", default="", help="User ID (optional).")
@click.pass_context
def dashboard_share(ctx: click.Context, report_id: str, user_id: str) -> None:
    """Create a public sharing link for a report."""
    result = _dashboard.dashboard_public_link_create(report_id, user_id)
    output_result(ctx, result)
    if not (ctx.obj and ctx.obj.get("json_mode")):
        click.secho("✓ Public link created.", fg="green")


@dashboard_group.command("widget-data")
@click.option("--report-id", required=True, help="Report ID.")
@click.option("--widget-id", required=True, help="Widget ID.")
@click.pass_context
def dashboard_widget_data(ctx: click.Context, report_id: str, widget_id: str) -> None:
    """Get data for a specific widget."""
    result = _dashboard.dashboard_widget_data(report_id, widget_id)
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# export group
# ---------------------------------------------------------------------------

@cli.group("export", help="Export reports (PNG, Excel, PDF).")
def export_group() -> None:
    pass


def _add_export_options(cmd: click.Command) -> click.Command:
    cmd = click.option("--report-id", required=True, help="Report ID.")(cmd)
    cmd = click.option("--widget-id", help="Optional widget ID for single-widget export.")(cmd)
    cmd = click.option("--output", "-o", help="Output file path.")(cmd)
    return cmd


@export_group.command("png")
@_add_export_options
@click.pass_context
def export_png(ctx: click.Context, report_id: str, widget_id: str | None, output: str | None) -> None:
    """Export a report as a PNG image."""
    path = _export.export_png(report_id, widget_id, output)
    click.secho(f"✓ PNG saved to: {path}", fg="green")


@export_group.command("excel")
@_add_export_options
@click.pass_context
def export_excel(ctx: click.Context, report_id: str, widget_id: str | None, output: str | None) -> None:
    """Export a report as an Excel file."""
    path = _export.export_excel(report_id, widget_id, output)
    click.secho(f"✓ Excel saved to: {path}", fg="green")


@export_group.command("pdf")
@_add_export_options
@click.pass_context
def export_pdf(ctx: click.Context, report_id: str, widget_id: str | None, output: str | None) -> None:
    """Export a report as a PDF document."""
    path = _export.export_pdf(report_id, widget_id, output)
    click.secho(f"✓ PDF saved to: {path}", fg="green")


# ---------------------------------------------------------------------------
# package group
# ---------------------------------------------------------------------------

@cli.group("package", help="Package / folder management.")
def package_group() -> None:
    pass


@package_group.command("list")
@click.pass_context
def package_root(ctx: click.Context) -> None:
    """List root-level folders/groups."""
    result = _package.package_root_folders()
    # API returns {"data": {"folders": [...]}}; extract the folders list
    data = result.get("data", result)
    folders = data.get("folders", []) if isinstance(data, dict) else data
    output_result(
        ctx,
        folders if not ctx.obj.get("json_mode") else result,
        table_headers=["id", "name", "parent"],
        row_mapper=lambda r: (
            r.get("id", ""),
            r.get("name", ""),
            r.get("parentId", ""),
        ),
    )


@package_group.command("create")
@click.option("--group-id", required=True, help="Parent group ID.")
@click.pass_context
def package_create(ctx: click.Context, group_id: str) -> None:
    """Create an empty folder under a group."""
    result = _package.package_create(group_id)
    output_result(ctx, result)
    click.secho("✓ Folder created.", fg="green")


@package_group.command("delete")
@click.option("--item-ids", required=True, help="Comma-separated item IDs to delete.")
@click.pass_context
def package_delete(ctx: click.Context, item_ids: str) -> None:
    """Delete packages/folders."""
    if not click.confirm(f"Delete items {item_ids}?"):
        ctx.exit(0)
    ids = [i.strip() for i in item_ids.split(",")]
    result = _package.package_delete(ids)
    output_result(ctx, result)
    click.secho("✓ Items deleted.", fg="green")


@package_group.command("rename")
@click.option("--pack-id", required=True, help="Package/folder ID.")
@click.option("--new-name", required=True, help="New name.")
@click.pass_context
def package_rename(ctx: click.Context, pack_id: str, new_name: str) -> None:
    """Rename a package/folder."""
    result = _package.package_rename(pack_id, new_name)
    output_result(ctx, result)
    click.secho(f"✓ Renamed to '{new_name}'.", fg="green")


@package_group.command("structure")
@click.option("--pack-id", required=True, help="Package/folder ID.")
@click.option("--with-tables", is_flag=True, help="Include table details.")
@click.pass_context
def package_structure(ctx: click.Context, pack_id: str, with_tables: bool) -> None:
    """Get the structure of a package/folder as a tree."""
    result = _package.package_structure(pack_id, include_tables=with_tables)

    if ctx.obj and ctx.obj.get("json_mode"):
        click.echo(json.dumps(result, indent=2, ensure_ascii=False))
        return

    # Extract the data node from the API response
    data = result.get("data", result)

    # Print the folder tree
    print_tree(data)
    click.echo(f"\n  id: {data.get('id', '-')}")
    click.echo(f"  position: {data.get('position', '-')}")


# ---------------------------------------------------------------------------
# data group
# ---------------------------------------------------------------------------

@cli.group("data", help="Data Center operations (folders, tables, models, queries).")
def data_group() -> None:
    pass


@data_group.command("folders")
@click.pass_context
def data_folders(ctx: click.Context) -> None:
    """List first-level data folders."""
    result = _data.data_folders()
    output_result(
        ctx,
        result,
        table_headers=["id", "name", "type", "parent"],
        row_mapper=lambda r: (
            r.get("id", ""),
            r.get("name", ""),
            r.get("type", ""),
            r.get("parentId", ""),
        ),
    )


@data_group.command("folder-tree")
@click.option("--folder-id", required=True, help="Folder ID.")
@click.pass_context
def data_folder_tree(ctx: click.Context, folder_id: str) -> None:
    """Get the full tree under a folder."""
    result = _data.data_folder_tree(folder_id)
    output_result(ctx, result)


@data_group.command("table-preview")
@click.option("--table-name", required=True, help="Table name.")
@click.pass_context
def data_table_preview(ctx: click.Context, table_name: str) -> None:
    """Get preview data for a table."""
    result = _data.data_table_preview(table_name)
    output_result(ctx, result)


@data_group.command("table-structure")
@click.option("--table-name", required=True, help="Table name.")
@click.pass_context
def data_table_structure(ctx: click.Context, table_name: str) -> None:
    """Get the schema of a table."""
    result = _data.data_table_structure(table_name)
    output_result(ctx, result)


@data_group.command("model")
@click.option("--model-id", required=True, help="Model ID.")
@click.pass_context
def data_model(ctx: click.Context, model_id: str) -> None:
    """Get a data model by ID."""
    result = _data.data_model(model_id)
    output_result(ctx, result)


@data_group.command("query")
@click.option("--body", required=True, help="JSON string for query body.")
@click.pass_context
def data_query(ctx: click.Context, body: str) -> None:
    """Execute a data model query (pass JSON body)."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_query(parsed)
    output_result(ctx, result)


@data_group.command("preview")
@click.option("--body", required=True, help="JSON string for preview body.")
@click.pass_context
def data_preview(ctx: click.Context, body: str) -> None:
    """Preview data with pagination (pass JSON body)."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_preview(parsed)
    output_result(ctx, result)


@data_group.command("search-tables")
@click.option("--body", required=True, help='JSON body e.g. {"keyword": "sales"}')
@click.pass_context
def data_search_tables(ctx: click.Context, body: str) -> None:
    """Search tables by keyword."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_search_tables(parsed)
    output_result(ctx, result)


@data_group.command("search-fields")
@click.option("--body", required=True, help='JSON body e.g. {"keyword": "revenue"}')
@click.pass_context
def data_search_fields(ctx: click.Context, body: str) -> None:
    """Search fields by keyword."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_search_fields(parsed)
    output_result(ctx, result)


@data_group.command("field-data")
@click.option("--body", required=True, help="JSON body for field data query.")
@click.pass_context
def data_field_data(ctx: click.Context, body: str) -> None:
    """Get field data values."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_field_data(parsed)
    output_result(ctx, result)


@data_group.command("field-range")
@click.option("--body", required=True, help="JSON body for field range query.")
@click.pass_context
def data_field_range(ctx: click.Context, body: str) -> None:
    """Get min/max range of a field."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _data.data_field_range(parsed)
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# spider group
# ---------------------------------------------------------------------------

@cli.group("spider", help="Spider / data update operations.")
def spider_group() -> None:
    pass


@spider_group.command("generate")
@click.pass_context
def spider_generate(ctx: click.Context) -> None:
    """Trigger a global spider data update."""
    result = _spider.spider_generate()
    output_result(ctx, result)
    click.secho("✓ Global update triggered.", fg="green")


@spider_group.command("update")
@click.option("--info", required=True, help="Encrypted info string (packId/tableId).")
@click.pass_context
def spider_update_pack(ctx: click.Context, info: str) -> None:
    """Trigger a spider update for a specific package/table."""
    result = _spider.spider_update_pack_table(info)
    output_result(ctx, result)
    click.secho("✓ Package/table update triggered.", fg="green")


@spider_group.command("batch")
@click.option("--tasks", required=True, help='JSON array of task objects.')
@click.pass_context
def spider_batch(ctx: click.Context, tasks: str) -> None:
    """Trigger batch spider updates."""
    try:
        parsed = json.loads(tasks)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _spider.spider_batch_update(parsed)
    output_result(ctx, result)
    click.secho("✓ Batch update triggered.", fg="green")


@spider_group.command("status")
@click.option("--task-instance-id", required=True, help="Task instance ID.")
@click.pass_context
def spider_status(ctx: click.Context, task_instance_id: str) -> None:
    """Get the status of a spider update task."""
    result = _spider.spider_task_status(task_instance_id)
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# schedule group
# ---------------------------------------------------------------------------

@cli.group("schedule", help="Scheduling operations.")
def schedule_group() -> None:
    pass


@schedule_group.command("tree")
@click.pass_context
def schedule_tree(ctx: click.Context) -> None:
    """Get the reports tree for scheduling."""
    result = _schedule.schedule_tree()
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# subject group
# ---------------------------------------------------------------------------

@cli.group("subject", help="Subject (主题) management — folder hierarchy, items, search.")
def subject_group() -> None:
    pass


@subject_group.command("folders")
@click.pass_context
def subject_folders(ctx: click.Context) -> None:
    """List first-level folders in 'My Analysis'."""
    result = _subject.subject_folders()
    output_result(ctx, result)


@subject_group.command("tree-root")
@click.pass_context
def subject_tree_root(ctx: click.Context) -> None:
    """Get the top-level subject tree."""
    result = _subject.subject_tree_root()
    output_result(ctx, result)


@subject_group.command("folder")
@click.option("--folder-id", required=True, help="Folder ID.")
@click.pass_context
def subject_folder(ctx: click.Context, folder_id: str) -> None:
    """List contents (sub-folders + subjects) of a folder."""
    result = _subject.subject_folder_contents(folder_id)
    output_result(ctx, result)


@subject_group.command("tree")
@click.option("--folder-id", required=True, help="Folder or subject ID.")
@click.pass_context
def subject_tree(ctx: click.Context, folder_id: str) -> None:
    """Get full tree (with tables) under a folder or subject."""
    result = _subject.subject_tree(folder_id)
    output_result(ctx, result)


@subject_group.command("crumb")
@click.option("--folder-id", required=True, help="Folder or subject ID.")
@click.pass_context
def subject_crumb(ctx: click.Context, folder_id: str) -> None:
    """Get breadcrumb path to a folder/subject."""
    result = _subject.subject_crumb(folder_id)
    output_result(ctx, result)


@subject_group.command("content")
@click.option("--subject-id", required=True, help="Subject ID.")
@click.pass_context
def subject_content(ctx: click.Context, subject_id: str) -> None:
    """Get all items (datasets, components, dashboards) in a subject."""
    result = _subject.subject_content(subject_id)
    output_result(ctx, result)


@subject_group.command("reports")
@click.option("--subject-id", required=True, help="Subject ID.")
@click.pass_context
def subject_reports(ctx: click.Context, subject_id: str) -> None:
    """List all dashboards in a subject."""
    result = _subject.subject_reports(subject_id)
    output_result(ctx, result)


@subject_group.command("get")
@click.option("--ids", required=True, help="Comma-separated subject IDs.")
@click.pass_context
def subject_get(ctx: click.Context, ids: str) -> None:
    """Batch-fetch subject info by IDs."""
    result = _subject.subject_get_by_ids([i.strip() for i in ids.split(",")])
    output_result(ctx, result)


@subject_group.command("search")
@click.option("--body", required=True, help='JSON body e.g. {"keyword": "sales"}')
@click.pass_context
def subject_search(ctx: click.Context, body: str) -> None:
    """Search within a subject."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _subject.subject_search(parsed)
    output_result(ctx, result)


@subject_group.command("groups-search")
@click.option("--body", required=True, help='JSON body e.g. {"keyword": "sales"}')
@click.pass_context
def subject_groups_search(ctx: click.Context, body: str) -> None:
    """Search across all subjects/folders."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _subject.subject_groups_search(parsed)
    output_result(ctx, result)


@subject_group.command("consanguinity")
@click.option("--subject-id", required=True, help="Subject ID.")
@click.pass_context
def subject_consanguinity(ctx: click.Context, subject_id: str) -> None:
    """Get lineage/consanguinity within a subject."""
    result = _subject.subject_consanguinity(subject_id)
    output_result(ctx, result)


@subject_group.command("create-folder")
@click.option("--folder-id", required=True, help="Parent folder ID.")
@click.pass_context
def subject_folder_add(ctx: click.Context, folder_id: str) -> None:
    """Add a sub-folder under a folder."""
    result = _subject.subject_folder_add(folder_id)
    output_result(ctx, result)
    click.secho("✓ Sub-folder created.", fg="green")


@subject_group.command("folder-rename")
@click.option("--folder-id", required=True, help="Folder ID.")
@click.option("--new-name", required=True, help="New name.")
@click.pass_context
def subject_folder_rename(ctx: click.Context, folder_id: str, new_name: str) -> None:
    """Rename a folder."""
    result = _subject.subject_folder_rename(folder_id, new_name)
    output_result(ctx, result)
    click.secho(f"✓ Folder renamed to '{new_name}'.", fg="green")


@subject_group.command("copy")
@click.option("--body", required=True, help='JSON body with source subjectId, targetGroupId, etc.')
@click.pass_context
def subject_copy(ctx: click.Context, body: str) -> None:
    """Copy a subject (pass JSON body)."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _subject.subject_copy(parsed)
    output_result(ctx, result)
    click.secho("✓ Subject copied.", fg="green")


@subject_group.command("docs")
@click.option("--subject-id", required=True, help="Subject ID.")
@click.pass_context
def subject_docs(ctx: click.Context, subject_id: str) -> None:
    """Get all analysis documents inside a subject."""
    result = _subject.subject_docs(subject_id)
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# table group
# ---------------------------------------------------------------------------

@cli.group("table", help="Table management — info, fields, lineage, SQL preview.")
def table_group() -> None:
    pass


@table_group.command("info")
@click.option("--name", "table_name", required=True, help="Table name.")
@click.pass_context
def table_info(ctx: click.Context, table_name: str) -> None:
    """Get simplified table info by name."""
    result = _table.table_info(table_name)
    output_result(ctx, result)


@table_group.command("detail")
@click.option("--name", "table_name", required=True, help="Table name.")
@click.pass_context
def table_detail(ctx: click.Context, table_name: str) -> None:
    """Get detailed table info."""
    result = _table.table_detail(table_name)
    output_result(ctx, result)


@table_group.command("publish-status")
@click.option("--name", "table_name", required=True, help="Table name.")
@click.pass_context
def table_publish_status(ctx: click.Context, table_name: str) -> None:
    """Get publish status of a table."""
    result = _table.table_publish_status(table_name)
    output_result(ctx, result)


@table_group.command("used")
@click.option("--name", "table_name", required=True, help="Table name.")
@click.pass_context
def table_used(ctx: click.Context, table_name: str) -> None:
    """Check if a table is used by other resources."""
    result = _table.table_used_status(table_name)
    output_result(ctx, result)


@table_group.command("dictionary")
@click.option("--name", "table_name", required=True, help="Table name.")
@click.pass_context
def table_dictionary(ctx: click.Context, table_name: str) -> None:
    """Get data dictionary info for a table."""
    result = _table.table_dictionary(table_name)
    output_result(ctx, result)


@table_group.command("consanguinity")
@click.option("--body", required=True, help='JSON body for lineage query.')
@click.pass_context
def table_consanguinity(ctx: click.Context, body: str) -> None:
    """Get graph lineage info."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_consanguinity(parsed)
    output_result(ctx, result)


@table_group.command("fields")
@click.option("--body", required=True, help='JSON body with table names, e.g. {"ids": ["sales"]}')
@click.pass_context
def table_fields(ctx: click.Context, body: str) -> None:
    """Batch-get field info for tables."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_fields(parsed)
    output_result(ctx, result)


@table_group.command("sql-preview")
@click.option("--body", required=True, help='JSON body for SQL preview.')
@click.pass_context
def table_sql_preview(ctx: click.Context, body: str) -> None:
    """Preview SQL query data."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_sql_preview(parsed)
    output_result(ctx, result)


@table_group.command("sql-params")
@click.option("--body", required=True, help='JSON body with encrypted SQL.')
@click.pass_context
def table_sql_params(ctx: click.Context, body: str) -> None:
    """Get SQL parameters for a query."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_sql_params(parsed)
    output_result(ctx, result)


@table_group.command("positions")
@click.option("--body", required=True, help='JSON body with table IDs.')
@click.pass_context
def table_positions(ctx: click.Context, body: str) -> None:
    """Batch-get path info for tables."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_positions(parsed)
    output_result(ctx, result)


@table_group.command("duplicate-check")
@click.option("--body", required=True, help='JSON body for duplicate check.')
@click.pass_context
def table_duplicate_check(ctx: click.Context, body: str) -> None:
    """Check for duplicate data in a table."""
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as e:
        raise click.BadParameter(f"Invalid JSON: {e}")
    result = _table.table_duplicate_check(parsed)
    output_result(ctx, result)


# ---------------------------------------------------------------------------
# entry group  (Decision platform directory / template tree)
# ---------------------------------------------------------------------------

@cli.group("entry", help="Decision platform entry directory and template tree.")
def entry_group() -> None:
    pass


@entry_group.command("resource")
@click.option("--publish-task-id", required=True, help="Published resource ID from the entry tree.")
@click.pass_context
def entry_resource(ctx: click.Context, publish_task_id: str) -> None:
    """Get dashboard and component info for a published resource."""
    result = _entry.entry_resource(publish_task_id)

    if ctx.obj and ctx.obj.get("json_mode"):
        click.echo(json.dumps(result, indent=2, ensure_ascii=False))
        return

    data = result.get("data", result) if isinstance(result, dict) else result

    _item_type_labels = {1: "仪表板", 2: "组件"}
    resources = data.get("resourceList", []) if isinstance(data, dict) else []

    if not resources:
        output_result(ctx, result)
        return

    subject_name = data.get("name", "") if isinstance(data, dict) else ""
    if subject_name:
        click.echo(f"主题: {subject_name}\n")

    output_result(
        ctx,
        resources,
        table_headers=["id", "name", "itemType"],
        row_mapper=lambda r: (
            r.get("id", ""),
            r.get("name", ""),
            _item_type_labels.get(r.get("itemType", 0), str(r.get("itemType", ""))),
        ),
    )


@entry_group.command("tree")
@click.pass_context
def entry_tree(ctx: click.Context) -> None:
    """List templates mounted in the Decision platform directory tree."""
    result = _entry.entry_tree()

    if ctx.obj and ctx.obj.get("json_mode"):
        click.echo(json.dumps(result, indent=2, ensure_ascii=False))
        return

    # The API may wrap the list under "data"
    nodes = result
    if isinstance(result, dict):
        nodes = result.get("data", result.get("children", result.get("list", [])))
    if isinstance(nodes, dict):
        nodes = [nodes]

    if not nodes:
        click.echo("(empty)")
        return

    print_entry_tree(nodes)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    cli(auto_envvar_prefix="FINEBI")


if __name__ == "__main__":
    main()
