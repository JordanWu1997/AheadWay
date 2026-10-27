"""Search and serialize routes supported by the Taipei and New Taipei feeds."""

import re
import unicodedata
from urllib.parse import parse_qs, urlparse

from .tracker import ROUTE_ID, ROUTES, refresh_route_catalog, route_info

DEFAULT_ROUTES = (ROUTE_ID, 16585, 16664)
COLOR_NAMES = {"橘": "orange", "紅": "red", "藍": "blue", "綠": "green", "棕": "brown",
               "黃": "yellow", "紫": "purple", "小": "small"}
NUMBER_WORDS = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
                "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
                "ten": "10"}


def search_key(value):
    """Fold display spelling and common color/number variants for search only."""
    value = unicodedata.normalize("NFKC", value).casefold().strip()
    for chinese, english in COLOR_NAMES.items():
        if value.startswith(chinese):
            value = english + value[len(chinese):]
            break
    value = re.sub(r"[\s\-‐‑–—_]+", "", value)
    for word, digit in NUMBER_WORDS.items():
        value = re.sub(rf"(?<=[a-z]){word}$", digit, value)
    return value


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
    needle = search_key(query)
    structured_number = bool(re.fullmatch(r"[a-z]+\d+", needle))
    matches = []
    for route_id, info in ROUTES.items():
        keys = (search_key(info["name"]), search_key(info["name_en"]))
        if needle in keys:
            rank = 0
        elif any(key.startswith(needle) for key in keys) and not structured_number:
            rank = 1
        elif any(needle in key for key in keys) and not structured_number:
            rank = 2
        else:
            continue
        matches.append((rank, len(info["name"]), info["name"], route_id))
    matches.sort()
    return [route_payload(route_id) for _, _, _, route_id in matches[:limit]]
