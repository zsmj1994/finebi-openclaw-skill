"""Spider / update management module for Nuclear CLI."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.session import NuclearSession, requires_auth


@requires_auth
def spider_generate(**kwargs: Any) -> dict[str, Any]:
    """Trigger a global spider data update."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/conf/update/generate", params=kwargs)


@requires_auth
def spider_update_pack_table(info: str, **kwargs: Any) -> dict[str, Any]:
    """Trigger a spider update for a specific package/table."""
    session = NuclearSession.get_instance()
    return session.api_get("/v5/api/conf/update/pack/table", params={"info": info, **kwargs})


@requires_auth
def spider_batch_update(tasks: list[dict[str, Any]], **kwargs: Any) -> dict[str, Any]:
    """Trigger batch spider updates."""
    session = NuclearSession.get_instance()
    return session.api_post("/v5/api/conf/update/batch", body=tasks, params=kwargs)


@requires_auth
def spider_task_status(task_instance_id: str, **kwargs: Any) -> dict[str, Any]:
    """Get the status of a spider update task instance."""
    session = NuclearSession.get_instance()
    return session.api_get(
        f"/v5/api/conf/update/instance/{task_instance_id}",
        params={"taskInstanceId": task_instance_id, **kwargs},
    )
