"""Schedule module for Nuclear CLI."""

from __future__ import annotations

from typing import Any

from cli_anything.nuclear.core.config import get_config
from cli_anything.nuclear.core.session import NuclearSession, requires_auth


@requires_auth
def schedule_tree(**kwargs: Any) -> dict[str, Any]:
    """Get the reports tree for scheduling."""
    session = NuclearSession.get_instance()
    version = get_config().version
    return session.api_get(f"/v5/api/{version}/schedule/bi/platform/dashboard/reports/tree", params=kwargs)
