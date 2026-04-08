"""Package / folder management module for Nuclear CLI — wraps v5/conf/packs/* APIs."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


def _api() -> str:
    return "v5/conf"


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@requires_auth
def package_create(group_id: str, **kwargs: Any) -> dict[str, Any]:
    """Create an empty folder/package under the given group (GET /packs/{pid}/add)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/{group_id}/add", params=kwargs)


@requires_auth
def package_delete(item_ids: list[str], **kwargs: Any) -> dict[str, Any]:
    """Delete one or more packages/folders (POST /packs/delete)."""
    session = NuclearSession.get_instance()
    body = {"ItemIds": item_ids, **kwargs}
    return session.api_post(f"/{_api()}/packs/delete", body=body)


@requires_auth
def package_rename(pack_id: str, new_name: str, **kwargs: Any) -> dict[str, Any]:
    """Rename a package/folder (PUT /packs/{packId}/rename)."""
    session = NuclearSession.get_instance()
    body = {"newName": new_name, **kwargs}
    return session.api_put(f"/{_api()}/packs/{pack_id}/rename", body=body)


# ---------------------------------------------------------------------------
# Read / browse
# ---------------------------------------------------------------------------

@requires_auth
def package_root_folders(**kwargs: Any) -> dict[str, Any]:
    """Get first-level folders (GET /packs/folders)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/folders", params=kwargs)


@requires_auth
def package_info(pack_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get full folder info by packId (GET /packs/{packId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/{pack_id}", params=kwargs)


@requires_auth
def package_structure(pack_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get folder hierarchy without tables (GET /packs/structure/{packId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/structure/{pack_id}", params=kwargs)


@requires_auth
def package_tree(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get full tree (with tables) by folderId (GET /packs/tree/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/tree/{folder_id}", params=kwargs)


@requires_auth
def package_crumb(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get breadcrumb by folderId (GET /packs/crumb/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/crumb/{folder_id}", params=kwargs)


@requires_auth
def package_subfolder_names(pack_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get sub-folder names (GET /packs/{packId}/names)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/{pack_id}/names", params=kwargs)


# ---------------------------------------------------------------------------
# Batch / move / sort
# ---------------------------------------------------------------------------

@requires_auth
def package_get_by_ids(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get folder info by IDs (POST /packs/get)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/packs/get", body=body, params=kwargs)


@requires_auth
def package_positions(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get path info for packages (POST /packs/position)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/packs/position", body=body, params=kwargs)


@requires_auth
def package_items_move(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-move tables/folders (POST /packs/items/move)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/packs/items/move", body=body, params=kwargs)


@requires_auth
def package_sort(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Custom sort for resources (POST /packs/sort)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/packs/sort", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Tree lookups by resource type
# ---------------------------------------------------------------------------

@requires_auth
def package_tree_by_table(table_name: str, **kwargs: Any) -> dict[str, Any]:
    """Get tree by table name (GET /packs/tree/table/{tableName})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/tree/table/{table_name}", params=kwargs)


@requires_auth
def package_tree_by_index(index_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get tree by index ID (GET /packs/tree/index/{indexId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/tree/index/{index_id}", params=kwargs)


@requires_auth
def package_tree_by_dimension(dimension_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get tree by dimension ID (GET /packs/tree/dimension/{dimensionId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/tree/dimension/{dimension_id}", params=kwargs)


@requires_auth
def package_tree_by_business_model(business_model_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get tree by business model ID (GET /packs/tree/businessModel/{businessModelId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/packs/tree/businessModel/{business_model_id}", params=kwargs)


# ---------------------------------------------------------------------------
# Page / config
# ---------------------------------------------------------------------------

@requires_auth
def package_page(**kwargs: Any) -> dict[str, Any]:
    """Get data catalog configuration page."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/conf/page", params=kwargs)


@requires_auth
def analysis_page(**kwargs: Any) -> dict[str, Any]:
    """Get 'My Analysis' page data."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/page/analysis", params=kwargs)
