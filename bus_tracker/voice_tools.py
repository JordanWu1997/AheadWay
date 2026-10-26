"""Optional Hugging Face speech-to-speech tool for spoken bus queries."""

import asyncio

from .tracker import ROUTE_ID, ROUTES, FeedCache, ordered_stops

TOOLS = [{
    "type": "function",
    "name": "get_bus_arrivals",
    "description": "Get current 橘5, 908, or 921 bus information for a named stop. Use whenever the user asks about current bus arrivals.",
    "parameters": {
        "type": "object",
        "properties": {
            "stop_name": {"type": "string", "description": "Exact or partial Chinese stop name"},
            "route_id": {"type": "integer", "enum": [16405, 16585, 16664], "description": "16405=橘5; 16585=908; 16664=921"},
            "direction": {"type": "integer", "enum": [0, 1], "description": "0 toward 捷運景安站; 1 toward 板橋 for 橘5 or 三峽 for 908/921"},
        },
        "required": ["route_id", "stop_name", "direction"],
        "additionalProperties": False,
    },
}]

_cache = FeedCache()


def _lookup(stop_name: str, direction: int, route_id: int = ROUTE_ID) -> dict:
    if route_id not in ROUTES:
        return {"error": "Route must be 橘5, 908, or 921"}
    if direction not in (0, 1):
        return {"error": "Direction must be 0 or 1"}
    name = stop_name.strip()
    if not name:
        return {"error": "Please provide a stop name"}
    stops = [s for s in ordered_stops(_cache.stops(route_id), direction, route_id)
             if not any(tag in s["nameZh"] for tag in ("虛擬站不停靠", "暫時裁撤"))]
    exact = [s for s in stops if s["nameZh"] == name]
    matches = exact or [s for s in stops if name in s["nameZh"]]
    if not matches:
        return {"error": f"Stop not found on {ROUTES[route_id]['name']} in this direction"}
    if len(matches) > 1:
        return {"error": "Several stops match. Ask the user to choose one.",
                "matches": [{"name": s["nameZh"], "id": s["Id"]} for s in matches]}
    snapshot = _cache.snapshot(matches[0]["Id"], direction, True, route_id)
    return {"route": snapshot["route"], "direction": snapshot["directionLabel"],
            "stop": snapshot["stop"]["name"], "official_next_eta_seconds": snapshot["officialEtaSeconds"],
            "official_status": snapshot["officialStatus"],
            "following_vehicles": [{"plate": v["id"], "approx_stops_away": v["stopsAway"],
                                    "estimated_eta_seconds": v["estimatedEtaSeconds"],
                                    "next_stop": v["nextStop"]}
                                   for v in snapshot["vehicles"]],
            "caution": "Only the next ETA is official. Each vehicle ETA is an estimate from stop-to-stop travel time and may change with traffic."}


async def execute_tool(name, arguments):
    if name not in ("get_bus_arrivals", "get_orange5_arrivals"):
        raise ValueError(f"Unknown tool: {name}")
    return await asyncio.to_thread(_lookup, arguments["stop_name"], arguments["direction"],
                                   arguments.get("route_id", ROUTE_ID))
