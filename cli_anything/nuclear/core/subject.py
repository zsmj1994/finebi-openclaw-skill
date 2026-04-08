"""Subject (主题) management module for Nuclear CLI — wraps v5/conf/subjects/* APIs."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


def _api() -> str:
    return "v5/conf"


# ---------------------------------------------------------------------------
# Folders / hierarchy
# ---------------------------------------------------------------------------

@requires_auth
def subject_folders(**kwargs: Any) -> dict[str, Any]:
    """Get first-level folders in 'My Analysis' (GET /subjects/first/folders)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/first/folders", params=kwargs)


@requires_auth
def subject_folder_contents(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get contents of a folder (sub-folders + subjects) (GET /subjects/folders/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/{folder_id}", params=kwargs)


@requires_auth
def subject_folder_contents_structured(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get folder contents without subjects (GET /subjects/folders/structure/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/structure/{folder_id}", params=kwargs)


@requires_auth
def subject_folder_add(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Add a sub-folder under the given folder (GET /subjects/folders/{folderId}/add)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/{folder_id}/add", params=kwargs)


@requires_auth
def subject_folder_rename(folder_id: str, new_name: str, **kwargs: Any) -> dict[str, Any]:
    """Rename a folder (PUT /subjects/folders/{folderId}/rename)."""
    session = NuclearSession.get_instance()
    body = {"newName": new_name, **kwargs}
    return session.api_put(f"/{_api()}/subjects/folders/{folder_id}/rename", body=body)


@requires_auth
def subject_folder_names(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get all sub-folder names in a folder (GET /subjects/folders/{folderId}/names)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/{folder_id}/names", params=kwargs)


@requires_auth
def subject_folder_sibling_names(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get sibling folder names at same level as folderId (GET /subjects/folders/{folderId}/current/names)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/{folder_id}/current/names", params=kwargs)


@requires_auth
def subject_tree(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get full tree (with tables) under a folder/subject (GET /subjects/folders/tree/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/tree/{folder_id}", params=kwargs)


@requires_auth
def subject_tree_root(**kwargs: Any) -> dict[str, Any]:
    """Get the top-level subject tree (GET /subjects/tree)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/tree", params=kwargs)


@requires_auth
def subject_crumb(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get breadcrumb path to a folder/subject (GET /subjects/folders/crumb/{folderId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/folders/crumb/{folder_id}", params=kwargs)


# ---------------------------------------------------------------------------
# Subjects
# ---------------------------------------------------------------------------

@requires_auth
def subject_content(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get all items (datasets, components, dashboards) in a subject (GET /subjects/{subjectId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/{subject_id}", params=kwargs)


@requires_auth
def subject_reports(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get all dashboards in a subject (GET /subjects/{subjectId}/reports)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/{subject_id}/reports", params=kwargs)


@requires_auth
def subject_get_by_ids(subject_ids: list[str], **kwargs: Any) -> dict[str, Any]:
    """Batch-fetch subject info by IDs (POST /subjects/get)."""
    session = NuclearSession.get_instance()
    body = {"subjectIds": subject_ids, **kwargs}
    return session.api_post(f"/{_api()}/subjects/get", body=body)


@requires_auth
def subject_create(folder_id: str, **kwargs: Any) -> dict[str, Any]:
    """Create a new subject under the given folder (GET /subjects/{subjectId}/add)."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/{folder_id}/add", params=kwargs)


@requires_auth
def subject_delete(item_ids: list[str], **kwargs: Any) -> dict[str, Any]:
    """Delete subjects/folders or resources within a subject (POST /subjects/delete)."""
    session = NuclearSession.get_instance()
    body = {"ItemIds": item_ids, **kwargs}
    return session.api_post(f"/{_api()}/subjects/delete", body=body)


@requires_auth
def subject_rename(subject_id: str, new_name: str, **kwargs: Any) -> dict[str, Any]:
    """Rename a subject (POST /subjects/{subjectId}/rename)."""
    session = NuclearSession.get_instance()
    body = {"newName": new_name, **kwargs}
    return session.api_post(f"/{_api()}/subjects/{subject_id}/rename", body=body)


@requires_auth
def subject_copy(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Copy a subject (POST /subjects/copy)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/copy", body=body, params=kwargs)


@requires_auth
def subject_items_move(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-move datasets, components, dashboards, folders, or subjects (POST /subjects/items/move)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/items/move", body=body, params=kwargs)


@requires_auth
def subject_consanguinity(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get lineage/consanguinity within a subject (GET /subjects/consanguinity/{subjectId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/consanguinity/{subject_id}", params=kwargs)


# ---------------------------------------------------------------------------
# Subject search
# ---------------------------------------------------------------------------

@requires_auth
def subject_search(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Search subjects/folders within a subject (POST /conf/subjects/search)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/search", body=body, params=kwargs)


@requires_auth
def subject_groups_search(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Search across all subjects/folders (POST /conf/subjects/groups/search)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/groups/search", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Merge / batch operations
# ---------------------------------------------------------------------------

@requires_auth
def subject_merge(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Merge two or more subjects into one (POST /subjects/merge)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/merge", body=body, params=kwargs)


@requires_auth
def subject_merge_recommend(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Get recommended subjects for merge (POST /subjects/merge/recommend)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/merge/recommend", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Ordering / sort
# ---------------------------------------------------------------------------

@requires_auth
def subject_order_update(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Update custom sort order within a subject (POST /subjects/order/update)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/order/update", body=body, params=kwargs)


@requires_auth
def subject_table_order_update(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Update custom sort order of datasets within a subject (POST /subjects/table/order/update)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/table/order/update", body=body, params=kwargs)


# ---------------------------------------------------------------------------
# Batch / info helpers
# ---------------------------------------------------------------------------

@requires_auth
def subject_positions(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get path/position info for subjects (POST /subjects/position)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/position", body=body, params=kwargs)


@requires_auth
def subject_publish_status(body: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Batch-get publish status for subjects (POST /subjects/publish/status)."""
    session = NuclearSession.get_instance()
    return session.api_post(f"/{_api()}/subjects/publish/status", body=body, params=kwargs)


@requires_auth
def subject_docs(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get all analysis documents inside a subject (GET /subject/docs/{subjectId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subject/docs/{subject_id}", params=kwargs)


@requires_auth
def subject_accelerate_check(subject_id: str, **kwargs: Any) -> dict[str, Any]:
    """Check accelerate status of resources within a subject (GET /subjects/accelerate/check/{subjectId})."""
    session = NuclearSession.get_instance()
    return session.api_get(f"/{_api()}/subjects/accelerate/check/{subject_id}", params=kwargs)
