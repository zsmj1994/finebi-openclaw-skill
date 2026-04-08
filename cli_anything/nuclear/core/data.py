"""Data Center API module for Nuclear CLI."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


def _api() -> str:
    return "v5/api"


@requires_auth
def data_folders(**kwargs: Any) -> dict[str, Any]:
    """List first-level folders."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/folders", params=kwargs)


@requires_auth
def data_folder_structure(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get the structure of a specific folder."""
    session = NuclearSession.get_instance()
    return session.api_post(
        f"/{_api()}/folders/{folder_id}/structure",
        body=kwargs,
        params={"folderId": folder_id},
    )


@requires_auth
def data_folder_tree(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get the full tree under a folder."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/folders/tree/{folder_id}", params={"folderId": folder_id, **kwargs})


@requires_auth
def data_table_preview(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get preview data for a table."""
    session = NuclearSession.get_instance()
    return session.api_get(
        f"/{_api()}/tables/{table_name}/data",
        params={"tableName": table_name, **kwargs},
    )


@requires_auth
def data_table_structure(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get the schema/structure of a table."""
    session = NuclearSession.get_instance()
    return session.api_get(
        f"/{_api()}/tables/{table_name}/structure",
        params={"tableName": table_name, **kwargs},
    )


@requires_auth
def data_model(model_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get a data model by ID."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/model/{model_id}/structure", params={"modelId": model_id, **kwargs})


@requires_auth
def data_query(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Execute a data model query."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/data/model", body=body, params=kwargs)


@requires_auth
def data_preview(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Preview data with pagination."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/preview/page", body=body, params=kwargs)


@requires_auth
def data_search_tables(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Search tables by keyword."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/folders/table/search", body=body, params=kwargs)


@requires_auth
def data_search_fields(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Search fields by keyword."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/folders/field/search", body=body, params=kwargs)


@requires_auth
def data_field_data(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get field data values."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/field/data", body=body, params=kwargs)


@requires_auth
def data_field_range(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get the range (min/max) of a field."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/field/range", body=body, params=kwargs)


@requires_auth
def data_resource_list(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get a filtered list of resources."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/resource/list", body=body, params=kwargs)


@requires_auth
def data_sql_params(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get SQL parameters for a query."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/sql/params", body=body, params=kwargs)


@requires_auth
def data_index(index_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get an index definition by ID."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/index/{index_id}", params={"indexId": index_id, **kwargs})


@requires_auth
def data_dimension(dimension_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get a dimension definition by ID."""
    session = NuclearSession.get_instance()
    return session.api_get(
        f"/{_api()}/dimension/{dimension_id}",
        params={"dimensionId": dimension_id, **kwargs},
    )


@requires_auth
def data_business_model(business_model_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get a business model by ID."""
    session = NuclearSession.get_instance()
    return session.api_get(
        f"/{_api()}/businessModel/{business_model_id}",
        params={"businessModelId": business_model_id, **kwargs},
    )
