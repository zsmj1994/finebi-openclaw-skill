"""Entry / directory tree module for Nuclear CLI.

Covers the FineReport Decision platform's directory-and-template tree,
exposed under ``/decision/v10/view/entry/tree``.
"""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


@requires_auth
def entry_tree(**kwargs: Any) -> dict[str, Any]:
    """Fetch the full entry/directory tree (templates mounted in directories)."""
    session = NuclearSession.get_instance()
    return session.decision_get("/decision/v10/view/entry/tree", params=kwargs or None)


@requires_auth
def entry_resource(publish_task_id: str) -> dict[str, Any]:
    """Fetch dashboard and component info for a published resource.

    ``publish_task_id`` is the resource ID from the entry tree node
    (the ``id`` / ``publishTaskId`` field on a published entry).
    """
    session = NuclearSession.get_instance()
    return session.decision_post(
        "/decision/v5/conf/publish/subjects/publish/resource",
        body={"publishTaskId": publish_task_id},
    )
