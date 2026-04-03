"""Output formatting utilities for Nuclear CLI."""

from __future__ import annotations

import json as _json
from typing import Any, Iterable, Optional

import click


def output_result(
    ctx: click.Context,
    data: Any,
    *,
    json_key: Optional[str] = None,
    table_headers: Optional[list[str]] = None,
    row_mapper: Optional[Any] = None,
    single: bool = False,
) -> None:
    """Emit *data* either as a JSON blob or as a human-readable table.

    Parameters
    ----------
    ctx : click.Context
        Active Click context – used to detect ``--json``.
    data : Any
        Raw API response or processed data.
    json_key : str, optional
        Key to extract from *data* before displaying.  If ``None`` the full
        response is emitted in JSON mode.
    table_headers : list[str], optional
        Column headers for the human-readable table.
    row_mapper : callable, optional
        ``row_mapper(item) -> tuple`` – converts each item to a table row.
    single : bool
        If ``True``, treat *data* as a single record rather than a list.
    """
    if ctx.obj and ctx.obj.get("json_mode"):
        payload = data.get(json_key, data) if isinstance(data, dict) and json_key else data
        click.echo(_json.dumps(payload, indent=2, ensure_ascii=False))
        return

    # Human-readable mode
    if single:
        _print_single(data)
    elif table_headers and row_mapper:
        _print_table(data, table_headers, row_mapper)
    else:
        # Fallback: pretty-print
        if isinstance(data, (dict, list)):
            click.echo(_json.dumps(data, indent=2, ensure_ascii=False))
        else:
            click.echo(data)


def _print_single(record: Any) -> None:
    if isinstance(record, dict):
        for key, value in record.items():
            click.echo(f"  {key}: {value}")
    else:
        click.echo(record)


def _print_table(
    records: Any,
    headers: list[str],
    row_mapper: Any,
) -> None:
    items = _ensure_list(records)
    if not items:
        click.echo("(no results)")
        return

    rows = [row_mapper(item) for item in items]
    col_widths = [
        max(len(str(row[i])) for row in ([tuple(headers)] + rows))
        for i in range(len(headers))
    ]

    # Header
    header_line = "  ".join(
        str(h).ljust(col_widths[i]) for i, h in enumerate(headers)
    )
    click.echo(header_line)
    click.echo("  ".join("-" * w for w in col_widths))

    # Rows
    for row in rows:
        click.echo("  ".join(
            str(cell).ljust(col_widths[i]) for i, cell in enumerate(row)
        ))


def _ensure_list(data: Any) -> list[Any]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        # Some API responses wrap the list in a key
        for key in ("data", "items", "records", "list", "result"):
            if key in data and isinstance(data[key], list):
                return data[key]
        return [data]
    return [data]


# ---------------------------------------------------------------------------
# Tree formatting
# ---------------------------------------------------------------------------

TREE_CHILDREN_KEYS = ("folders", "subjects")
TREE_ITEM_KEYS = ("tables", "indexes", "dimensions", "businessModels")
TREE_NAME_KEY = "name"


def print_tree(data: dict[str, Any], prefix: str = "", is_last: bool = True) -> None:
    """Recursively print a folder tree.

    The node should have the structure:
        {
            "name": "...",
            "folders": [sub-folders...],
            "tables": {"availableTables": [...]},
            "subjects": [...],
            ...
        }
    """
    name = data.get(TREE_NAME_KEY, data.get("id", "?"))
    connector = "└── " if is_last else "├── "
    click.echo(f"{prefix}{connector}{name}")

    children_prefix = prefix + ("    " if is_last else "│   ")

    # Print sub-folders
    sub_folders = data.get("folders", [])
    for i, sub in enumerate(sub_folders):
        print_tree(sub, prefix=children_prefix, is_last=(i == len(sub_folders) - 1))

    # Print tables
    tables_data = data.get("tables", {})
    available_tables = tables_data.get("availableTables", []) if isinstance(tables_data, dict) else []
    for i, table in enumerate(available_tables):
        tbl_name = table.get("tableName", table.get("name", "?"))
        is_last_table = (
            i == len(available_tables) - 1
            and not data.get("subjects")
            and not data.get("indexes", {}).get("availableIndexes", [])
            and not data.get("dimensions", {}).get("availableDimensions", [])
            and not data.get("businessModels", {}).get("availableModels", [])
        )
        tbl_connector = "└── " if is_last_table else "├── "
        click.echo(f"{children_prefix}{tbl_connector}[table] {tbl_name}")

    # Print other item types (subjects, indexes, dimensions, businessModels)
    for item_type, available_key in [
        ("subjects", None),
        ("indexes", "availableIndexes"),
        ("dimensions", "availableDimensions"),
        ("businessModels", "availableModels"),
    ]:
        items = data.get(item_type, [])
        if available_key:
            items = items.get(available_key, []) if isinstance(items, dict) else []
        if not items:
            continue
        for i, item in enumerate(items):
            item_name = item.get("name", item.get("fieldName", "?"))
            # Last item of this type?
            remaining = []
            for k2, ak2 in [
                ("indexes", "availableIndexes"),
                ("dimensions", "availableDimensions"),
                ("businessModels", "availableModels"),
            ]:
                if k2 == item_type:
                    continue
                v = data.get(k2, {})
                remaining.extend(v.get(ak2, []) if isinstance(v, dict) else [])
            is_last_item = i == len(items) - 1 and not remaining
            ic = "└── " if is_last_item else "├── "
            click.echo(f"{children_prefix}{ic}[{item_type}] {item_name}")
