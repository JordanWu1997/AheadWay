"""Search and serialize routes supported by the Taipei and New Taipei feeds."""

from urllib.parse import parse_qs, urlparse

from .tracker import ROUTE_ID, ROUTES, refresh_route_catalog, route_info

DEFAULT_ROUTES = (ROUTE_ID, 16585, 16664)


def route_payload(route_id):
    info = route_info(route_id)
    return {"id": route_id, "name": info["name"], "nameEn": info["name_en"],
            "spoken": info["name"], "heads": info["heads"],
            "headsEn": info["heads_en"], "source": info["feed"],
            "officialUrl": f"https://pda5284.gov.taipei/MQS/route.jsp?rid={route_id}",
            "terminalDirection": info.get("terminal_direction"),
            "turnaroundStop": info.get("turnaround_stop")}


def selected_routes(ids=None):
    chosen = DEFAULT_ROUTES if ids is None else ids
    if any(route_id not in ROUTES for route_id in chosen):
        refresh_route_catalog()
    return [route_payload(route_id) for route_id in chosen if route_id in ROUTES]


def route_id_from_input(value):
    query = value.strip()
    if query.isdecimal():
        return int(query)
    if not query.startswith(("https://", "http://")):
        return None
    url = urlparse(query)
    if url.hostname != "pda5284.gov.taipei" or url.path != "/MQS/route.jsp":
        return None
    values = parse_qs(url.query).get("rid", [])
    return int(values[0]) if len(values) == 1 and values[0].isdecimal() else None


def search_routes(query, limit=25):
    if not isinstance(query, str) or not 1 <= len(query.strip()) <= 120:
        raise ValueError("Enter a route name or official route link")
    refresh_route_catalog()
    route_id = route_id_from_input(query)
    if route_id in ROUTES:
        return [route_payload(route_id)]
    if route_id is not None and query.strip().startswith(("https://", "http://")):
        return []
    needle = query.strip().casefold()
    matches = [(route_id, info) for route_id, info in ROUTES.items()
               if needle in info["name"].casefold() or needle in info["name_en"].casefold()]
    matches.sort(key=lambda item: (item[1]["name"].casefold() != needle,
                                   not item[1]["name"].casefold().startswith(needle),
                                   len(item[1]["name"]), item[1]["name"], item[0]))
    return [route_payload(route_id) for route_id, _ in matches[:limit]]
