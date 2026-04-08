"""Table management module for Nuclear CLI — wraps v5/conf/tables/* APIs."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


def _api() -> str:
    return "v5/conf"


# ---------------------------------------------------------------------------
# Table info
# ---------------------------------------------------------------------------

@requires_auth
def table_info(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get simplified table info by name (GET /tables/{tableName})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/{table_name}", params=kwargs)


@requires_auth
def table_detail(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get detailed table info (GET /tables/detail/{tableName})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/detail/{table_name}", params=kwargs)


@requires_auth
def table_publish_status(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get publish status for a table (GET /tables/{tableName}/publish)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/{table_name}/publish", params=kwargs)


@requires_auth
def table_used_status(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Check if a table is used by other resources (GET /tables/{tableName}/used)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/{table_name}/used", params=kwargs)


@requires_auth
def table_dictionary(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get data dictionary info for a table (GET /tables/dictionary/{tableName})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/dictionary/{table_name}", params=kwargs)


@requires_auth
def table_model_status(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get model status for a table (GET /tables/model/status/{tableName})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/model/status/{table_name}", params=kwargs)


@requires_auth
def table_check_relation(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Check if a table has relation and authority settings (GET /check/table/{tableName}/relation/status)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/check/table/{table_name}/relation/status", params=kwargs)


@requires_auth
def tables_get(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get table configuration by names (POST /tables/get)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/get", body=body, params=kwargs)


@requires_auth
def table_origin(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get origin table name and parent info (GET /tables/{tableName}/origin)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/{table_name}/origin", params=kwargs)


# ---------------------------------------------------------------------------
# Consanguinity (lineage)
# ---------------------------------------------------------------------------

@requires_auth
def table_consanguinity(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get graph lineage info (POST /tables/consanguinity)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/consanguinity", body=body, params=kwargs)


@requires_auth
def table_consanguinity_search(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Search in lineage graph (POST /tables/consanguinity/search)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/consanguinity/search", body=body, params=kwargs)


@requires_auth
def table_usage(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get table usage/lineage info (POST /tables/usage)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/usage", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Fields
# ---------------------------------------------------------------------------

@requires_auth
def table_fields(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get field info for tables (POST /tables/fields)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/fields", body=body, params=kwargs)


@requires_auth
def table_fields_page(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get paginated field data preview (POST /tables/fields/page)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/fields/page", body=body, params=kwargs)


@requires_auth
def table_field_label(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get field group/label setting for a table (GET /tables/{tableName}/fields/label)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/tables/{table_name}/fields/label", params=kwargs)


@requires_auth
def table_data_size(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get data preview total size (POST /tables/data/size)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/data/size", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# SQL
# ---------------------------------------------------------------------------

@requires_auth
def table_sql_preview(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Preview SQL data (POST /sql/preview)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/sql/preview", body=body, params=kwargs)


@requires_auth
def table_sql_check(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """SQL dataset save check (POST /sql/check)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/sql/check", body=body, params=kwargs)


@requires_auth
def table_sql_params(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get SQL parameters (POST /sql/param)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/sql/param", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Batch / path helpers
# ---------------------------------------------------------------------------

@requires_auth
def table_positions(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get path info for tables (POST /tables/position)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/position", body=body, params=kwargs)


@requires_auth
def table_formula_all(engine_type: str, **kwargs: Any) -> dict[str, Any]:
    """Get all supported formulas for an engine type (GET /formula/all/{engineType})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/formula/all/{engine_type}", params=kwargs)


@requires_auth
def table_duplicate_check(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Check for duplicate data in a table (POST /tables/fields/duplicate/check)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/tables/fields/duplicate/check", body=body, params=kwargs)
