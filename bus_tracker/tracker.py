"""Read New Taipei's public feeds and locate vehicles on a selected route."""

from __future__ import annotations

import gzip
import json
import math
import statistics
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen

from .calibration import DATABASE, CalibrationStore, prediction_window

BASE = "https://tcgbusfs.blob.core.windows.net/ntpcbus/Get%s.gz"
ROUTE_ID = 16405
TURNAROUND_STOP_NAME = "捷運景安站(景平路)"
ROUTES = {
    16405: {"name": "橘5", "name_en": "Orange Five", "source": 16405,
            "heads": ("往捷運景安站", "往板橋"),
            "heads_en": ("toward Jingan MRT Station", "toward Banqiao"),
            "terminal_direction": 1},
    16585: {"name": "908", "name_en": "Route 908", "source": 16585,
            "heads": ("往捷運景安站", "往三峽"),
            "heads_en": ("toward Jingan MRT Station", "toward Sanxia"),
            "terminal_direction": 0},
    16664: {"name": "921", "name_en": "Route 921", "source": 16664,
            "heads": ("往捷運景安站", "往三峽"),
            "heads_en": ("toward Jingan MRT Station", "toward Sanxia"),
            "terminal_direction": 0},
}
TAIPEI = timezone(timedelta(hours=8))


def route_info(route_id: int) -> dict:
    try:
        return ROUTES[route_id]
    except KeyError as exc:
        raise ValueError("Unsupported bus route") from exc


def fetch_feed(name: str) -> dict:
    if name not in {"Route", "Stop", "BusData", "BusEvent", "EstimateTime"}:
        raise ValueError("Unknown feed")
    request = Request(BASE % name, headers={"User-Agent": "BusTracker/0.1"})
    with urlopen(request, timeout=15) as response:
        return json.loads(gzip.decompress(response.read()))


def age_seconds(value: str, now: datetime) -> float:
    try:
        observed = datetime.strptime(value, "%Y-%m-%d %H:%M:%S").replace(tzinfo=TAIPEI)
        return (now - observed).total_seconds()
    except (TypeError, ValueError):
        return float("inf")


def _meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    x = (lon2 - lon1) * math.cos(math.radians((lat1 + lat2) / 2)) * 111_320
    y = (lat2 - lat1) * 111_320
    return math.hypot(x, y)


def vehicle_progress(vehicle: dict, stops: list[dict]) -> tuple[float, float] | None:
    """Project GPS onto the stop-to-stop polyline; return progress and error in m."""
    try:
        lat, lon = float(vehicle["Latitude"]), float(vehicle["Longitude"])
    except (KeyError, TypeError, ValueError):
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None
    best = None
    for index, (a, b) in enumerate(zip(stops, stops[1:])):
        ax = (float(a["longitude"]) - lon) * math.cos(math.radians(lat)) * 111_320
        ay = (float(a["latitude"]) - lat) * 111_320
        bx = (float(b["longitude"]) - lon) * math.cos(math.radians(lat)) * 111_320
        by = (float(b["latitude"]) - lat) * 111_320
        dx, dy = bx - ax, by - ay
        raw_fraction = -(ax * dx + ay * dy) / (dx * dx + dy * dy) if dx * dx + dy * dy else 0.0
        fraction = max(0.0, min(1.0, raw_fraction))
        distance = math.hypot(ax + fraction * dx, ay + fraction * dy)
        candidate = (distance, index + fraction)
        if index == len(stops) - 2 and raw_fraction > 1 and abs(raw_fraction - 1) * math.hypot(dx, dy) < 400:
            candidate = (math.hypot(ax + raw_fraction * dx, ay + raw_fraction * dy), index + raw_fraction)
        if best is None or candidate < best:
            best = candidate
    if best is None:
        return None
    return best[1], best[0]


def ordered_stops(stops: list[dict], direction: int, route_id: int = ROUTE_ID) -> list[dict]:
    """Show the 景安 turnaround in both directions, respecting its feed leg."""
    info = route_info(route_id)
    route_stops = [s for s in stops if s.get("routeId") == route_id]
    ordered = sorted((s for s in route_stops if str(s.get("goBack")) == str(direction)),
                     key=lambda s: int(s["seqNo"]))
    if direction != info["terminal_direction"]:
        turnaround = next((s for s in route_stops if s.get("nameZh") == TURNAROUND_STOP_NAME
                           and str(s.get("goBack")) == str(info["terminal_direction"])), None)
        if turnaround:
            if direction == 0 and (not ordered or int(turnaround["seqNo"]) > int(ordered[-1]["seqNo"])):
                ordered.append(turnaround)
            elif direction == 1 and (not ordered or int(turnaround["seqNo"]) < int(ordered[0]["seqNo"])):
                ordered.insert(0, turnaround)
    return ordered


def official_status(seconds: int | None) -> str:
    if seconds is None:
        return "資料暫缺"
    if seconds < -4:
        return "資料暫缺"
    return {-1: "未發車", -2: "交管不停", -3: "末班已過",
            -4: "今日未營運", 0: "進站中"}.get(
                seconds, "將到站" if 0 < seconds < 180 else f"{seconds // 60}分")


def _estimate_for_stop(estimates: list[dict], stop_id: int, direction: int,
                       route_id: int = ROUTE_ID) -> int | None:
    matches = [e for e in estimates if e.get("RouteID") == route_id and e.get("StopID") == stop_id]
    row = next((e for e in matches if str(e.get("GoBack")) == str(direction)),
               matches[0] if matches else None)
    raw = str(row.get("EstimateTime", "")) if row else ""
    return int(raw) if raw.lstrip("-").isdigit() else None


class SegmentHistory:
    """Keep recent observed stop-to-stop travel times from consecutive bus events."""

    def __init__(self, route_id: int = ROUTE_ID):
        self.route_id = route_id
        self.samples = defaultdict(lambda: deque(maxlen=12))
        self.previous = {}
        self.lock = threading.Lock()

    def observe(self, events: list[dict], stops: list[dict], path_ids: set[str], now: datetime):
        adjacent = {(direction, a["Id"], b["Id"])
                    for direction in (0, 1)
                    for a, b in zip(ordered_stops(stops, direction, self.route_id),
                                    ordered_stops(stops, direction, self.route_id)[1:])}
        with self.lock:
            for event in events:
                if str(event.get("RouteID")) not in path_ids or str(event.get("BusStatus")) == "99" or \
                        str(event.get("DutyStatus")) == "2" or age_seconds(event.get("DataTime"), now) > 240:
                    continue
                plate = str(event.get("BusID") or "")
                if not plate or plate.startswith("TEST"):
                    continue
                try:
                    stamp = datetime.strptime(event["DataTime"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=TAIPEI)
                    stop_id = int(event["StopID"])
                except (KeyError, TypeError, ValueError):
                    continue
                if (now - stamp).total_seconds() < -60:
                    continue
                current = (stop_id, stamp, str(event.get("CarOnStop")) == "1")
                last = self.previous.get(plate)
                if last and stamp <= last[1]:
                    continue
                if last and stop_id == last[0]:
                    # Prefer a departure event; repeated position updates at one
                    # stop must not turn into artificially short segment times.
                    if last[2] and not current[2] or (stamp - last[1]).total_seconds() > 600:
                        self.previous[plate] = current
                    continue
                if last and current[2]:
                    seconds = (stamp - last[1]).total_seconds()
                    if 15 <= seconds <= 1800:
                        for key in adjacent:
                            if key[1:] == (last[0], stop_id):
                                self.samples[key].append((stamp, seconds))
                self.previous[plate] = current
            cutoff = now - timedelta(hours=2)
            self.previous = {plate: item for plate, item in self.previous.items() if item[1] >= cutoff}

    def medians(self, now: datetime | None = None):
        now = now or datetime.now(TAIPEI)
        cutoff = now - timedelta(hours=3)
        with self.lock:
            return {key: statistics.median(seconds for stamp, seconds in values if stamp >= cutoff)
                    for key, values in self.samples.items() if any(stamp >= cutoff for stamp, _ in values)}


def segment_travel_times(ordered: list[dict], direction: int, estimates: list[dict],
                         observed: dict | None = None,
                         route_id: int = ROUTE_ID) -> list[tuple[float, str]]:
    """Seconds and basis for each consecutive stop pair in one direction."""
    observed = observed or {}
    result = []
    for a, b in zip(ordered, ordered[1:]):
        meters = _meters(float(a["latitude"]), float(a["longitude"]),
                         float(b["latitude"]), float(b["longitude"]))
        fallback = (max(25.0, min(1800.0, 30.0 + meters / 13.0)) if meters > 2000 else
                    max(25.0, min(420.0, 20.0 + meters / 5.0)))
        key = (direction, a["Id"], b["Id"])
        sample = observed.get(key)
        if sample is not None and 15 <= sample <= 1800:
            result.append((float(sample), "observed"))
            continue
        eta_a = _estimate_for_stop(estimates, a["Id"], direction, route_id)
        eta_b = _estimate_for_stop(estimates, b["Id"], direction, route_id)
        delta = eta_b - eta_a if eta_a is not None and eta_b is not None else None
        if delta is not None and 15 <= delta <= 1800 and .35 * fallback <= delta <= 3.5 * fallback:
            result.append((float(delta), "official-gap"))
        else:
            result.append((fallback, "distance"))
    return result


def estimate_vehicle_eta(position: float, target_index: int,
                         segments: list[tuple[float, str]]) -> tuple[int, dict[str, int]]:
    """Sum remaining fractions of stop-to-stop segments up to the selected stop."""
    if position >= target_index:
        return 0, {"observed": 0, "official-gap": 0, "distance": 0}
    total = 0.0
    basis = {"observed": 0, "official-gap": 0, "distance": 0}
    for index in range(max(0, math.floor(position)), target_index):
        weight = 1.0 if index > position else min(1.0, index + 1 - position)
        seconds, source = segments[index]
        total += seconds * weight
        basis[source] += 1
    return max(0, round(total)), basis


def build_snapshot(routes: list[dict], stops: list[dict], positions: list[dict],
                   estimates: list[dict], stop_id: int, direction: int,
                   now: datetime | None = None, events: list[dict] | None = None,
                   closed_loop: bool = True, observed_segments: dict | None = None,
                   calibration: CalibrationStore | None = None,
                   route_id: int = ROUTE_ID) -> dict:
    now = now or datetime.now(TAIPEI)
    info = route_info(route_id)
    variants = [r for r in routes if r.get("Id") == route_id]
    if not variants:
        raise ValueError(f"{info['name']} is absent from the route feed")
    path_ids = {str(r["pathAttributeId"]) for r in variants}
    ordered = ordered_stops(stops, direction, route_id)
    target_indices = [i for i, s in enumerate(ordered) if s["Id"] == stop_id]
    if not target_indices:
        raise ValueError(f"Stop does not belong to {info['name']} in this direction")
    target_index = target_indices[0]
    selected = ordered[target_index]
    eta = _estimate_for_stop(estimates, stop_id, direction, route_id)
    segments = segment_travel_times(ordered, direction, estimates, observed_segments, route_id)
    route_statuses = [
        {"id": s["Id"], "direction": leg, "seconds": seconds,
         "label": official_status(seconds)}
        for leg in (0, 1) for s in ordered_stops(stops, leg, route_id)
        for seconds in [_estimate_for_stop(estimates, s["Id"], leg, route_id)]
    ]
    vehicles = []
    opposite_direction = 1 - direction
    onward_leg = ordered_stops(stops, opposite_direction, route_id)
    terminal_crossing = (closed_loop and target_index == len(ordered) - 1 and
                         bool(onward_leg) and onward_leg[0]["Id"] == stop_id)
    after_turnaround = onward_leg[1]["nameZh"] if len(onward_leg) > 1 else "終點站"
    after_turnaround_en = onward_leg[1].get("nameEn") if len(onward_leg) > 1 else "Terminal"
    stopped_at_terminal = set()
    stop_by_id = {str(s["Id"]): s for s in stops if s.get("routeId") == route_id}
    fresh_events = {}
    for event in events or []:
        if (str(event.get("RouteID")) not in path_ids or
                str(event.get("BusStatus")) == "99" or str(event.get("DutyStatus")) == "2"):
            continue
        event_age = age_seconds(event.get("DataTime"), now)
        if event_age < -60 or event_age > 240:
            continue
        plate = str(event.get("BusID"))
        if plate.startswith("TEST"):
            continue
        if plate not in fresh_events or event_age < age_seconds(fresh_events[plate].get("DataTime"), now):
            fresh_events[plate] = event
    route_vehicles = []
    for plate, event in fresh_events.items():
        station = stop_by_id.get(str(event.get("StopID")))
        if not station:
            continue
        bus_direction = int(event["GoBack"]) if str(event.get("GoBack")) in ("0", "1") else -1
        route_vehicles.append({"id": plate, "stopId": station["Id"],
                               "direction": bus_direction, "atStop": str(event.get("CarOnStop")) == "1"})
        if (terminal_crossing and bus_direction == opposite_direction and
                station["Id"] == stop_id and str(event.get("CarOnStop")) == "1"):
            stopped_at_terminal.add(plate)
    fresh_positions = {}
    for bus in positions:
        if str(bus.get("RouteID")) not in path_ids:
            continue
        if str(bus.get("BusStatus")) == "99" or str(bus.get("DutyStatus")) == "2":
            continue
        age = age_seconds(bus.get("DataTime"), now)
        if age < -60 or age > 240:
            continue
        plate = str(bus.get("BusID") or bus.get("CarID") or "unknown")
        if plate not in fresh_positions or age < age_seconds(fresh_positions[plate].get("DataTime"), now):
            fresh_positions[plate] = bus
    for plate in set(fresh_positions) | set(fresh_events):
        bus = fresh_positions.get(plate)
        event = fresh_events.get(plate)
        source = bus or event
        if not source or str(source.get("RouteID")) not in path_ids:
            continue
        if str(source.get("BusStatus")) == "99" or str(source.get("DutyStatus")) == "2":
            continue
        # The stop event is authoritative here. BusData can still report the
        # previous leg while the bus is already stopped at the turnaround.
        at_terminal = terminal_crossing and plate in stopped_at_terminal
        if at_terminal:
            distance = None
            if bus:
                try:
                    distance = _meters(float(bus["Latitude"]), float(bus["Longitude"]),
                                       float(selected["latitude"]), float(selected["longitude"]))
                except (KeyError, TypeError, ValueError):
                    pass
            if distance is None or distance <= 100:
                vehicles.append({"id": plate, "stopsAway": 0,
                                 "position": float(target_index), "atStop": True,
                                 "nextStop": after_turnaround, "nextStopEn": after_turnaround_en,
                                 "locationLabel": "本站進站中",
                                 "lastSeen": source.get("DataTime"),
                                 "dataAgeSeconds": max(0, round(age_seconds(source.get("DataTime"), now))),
                                 "mapErrorMeters": round(distance) if distance is not None else None,
                                 "estimatedEtaSeconds": 0,
                                 "etaBasis": {"observed": 0, "official-gap": 0, "distance": 0}})
            continue
        if str(source.get("GoBack")) != str(direction):
            continue
        projected = vehicle_progress(bus, ordered) if bus else None
        if projected and projected[1] > 400:
            projected = None
        event_index = next((i for i, s in enumerate(ordered) if event and
                            str(s["Id"]) == str(event.get("StopID")) and
                            str(event.get("GoBack")) == str(direction)), None)
        event_progress = (event_index + (0 if str(event.get("CarOnStop")) == "1" else .15)
                          if event_index is not None else None)
        if event_index is not None and (event_index > target_index or
                                        (event_index == target_index and str(event.get("CarOnStop")) == "0")):
            continue
        if projected and (event_progress is None or abs(projected[0] - event_progress) <= 2.5):
            progress, error = projected
        elif event_progress is not None:
            progress, error = event_progress, None
        else:
            continue
        if progress > target_index + 0.15:
            continue
        away = max(0, math.ceil(target_index - progress))
        next_index = max(0, min(len(ordered) - 1, math.ceil(progress)))
        if event_index is not None and str(event.get("CarOnStop")) == "1":
            next_index = max(next_index, min(len(ordered) - 1, event_index + 1))
        at_stop = (event_index == target_index and str(event.get("CarOnStop")) == "1"
                   and abs(progress - event_index) < .35)
        next_name = ordered[next_index]["nameZh"]
        next_name_en = ordered[next_index].get("nameEn") or next_name
        if target_index == len(ordered) - 1 and next_index == target_index and at_stop:
            next_name = after_turnaround if closed_loop else "終點站"
            next_name_en = after_turnaround_en if closed_loop else "Terminal"
        event_stop_name = ordered[event_index]["nameZh"] if event_index is not None else None
        location = (("進站 " if str(event.get("CarOnStop")) == "1" else "已離站 ") + event_stop_name
                    if event_stop_name else "GPS 位置估計")
        estimated_seconds, basis = estimate_vehicle_eta(progress, target_index, segments)
        vehicles.append({"id": plate,
                         "stopsAway": away, "position": round(progress, 2),
                         "atStop": at_stop, "nextStop": next_name, "nextStopEn": next_name_en,
                         "locationLabel": location, "lastSeen": source.get("DataTime"),
                         "dataAgeSeconds": max(0, round(age_seconds(source.get("DataTime"), now))),
                         "mapErrorMeters": round(error) if error is not None else None,
                         "estimatedEtaSeconds": estimated_seconds, "etaBasis": basis})
    if closed_loop and len(onward_leg) >= 2 and ordered:
        # A vehicle on the other leg may reach any selected stop after its
        # terminal, the short turn between legs, and the next leg's prefix.
        opposite_end = onward_leg[-1]
        bridge_meters = _meters(float(opposite_end["latitude"]), float(opposite_end["longitude"]),
                                float(ordered[0]["latitude"]), float(ordered[0]["longitude"]))
        if bridge_meters <= 1000:
            shared_endpoint = opposite_end["Id"] == ordered[0]["Id"] or (
                opposite_end["nameZh"] == ordered[0]["nameZh"] and bridge_meters <= 60)
            bridge_seconds = (0 if shared_endpoint and target_index == 0 else
                              max(120, round(60 + bridge_meters / 2)))
            prefix_seconds, prefix_basis = estimate_vehicle_eta(0, target_index, segments)
            incoming = build_snapshot(routes, stops, positions, estimates,
                                      opposite_end["Id"], opposite_direction,
                                      now=now, events=events, closed_loop=False,
                                      observed_segments=observed_segments,
                                      calibration=None, route_id=route_id)
            seen = {vehicle["id"] for vehicle in vehicles}
            for vehicle in incoming["vehicles"]:
                if vehicle["id"] in seen:
                    continue
                already_here = vehicle["atStop"] and shared_endpoint and target_index == 0
                basis = {key: vehicle["etaBasis"].get(key, 0) + prefix_basis.get(key, 0)
                         for key in ("observed", "official-gap", "distance")}
                if bridge_seconds:
                    basis["distance"] += 1
                vehicles.append({**vehicle,
                                 "originDirection": opposite_direction,
                                 "crossDirection": True,
                                 "atStop": already_here,
                                 "position": float(target_index) if already_here else vehicle["position"],
                                 "stopsAway": 0 if already_here else
                                     vehicle["stopsAway"] + target_index + (1 if bridge_seconds else 0),
                                 "estimatedEtaSeconds": 0 if already_here else
                                     vehicle["estimatedEtaSeconds"] + bridge_seconds + prefix_seconds,
                                 "etaBasis": basis,
                                 "locationLabel": ("本站進站中" if already_here else
                                     f"{info['heads'][opposite_direction]}沿線 · {vehicle['locationLabel']} · "
                                     "需折返續行後抵達")})
                seen.add(vehicle["id"])
    vehicles.sort(key=lambda b: (not b["atStop"], b["estimatedEtaSeconds"], b["id"]))
    for vehicle in vehicles:
        window, count = prediction_window(vehicle["estimatedEtaSeconds"], vehicle["etaBasis"],
                                          vehicle["stopsAway"], direction, now,
                                          None if vehicle.get("crossDirection") else calibration)
        vehicle["estimatedEtaWindowSeconds"] = window
        vehicle["calibrationSamples"] = count
        basis = vehicle["etaBasis"]
        if vehicle.get("crossDirection") or vehicle["dataAgeSeconds"] > 120 or basis.get("distance", 0) >= 2 or \
                (vehicle["mapErrorMeters"] is not None and vehicle["mapErrorMeters"] > 200):
            vehicle["confidence"] = "low"
        elif vehicle["dataAgeSeconds"] <= 60 and (basis.get("observed", 0) or count >= 5):
            vehicle["confidence"] = "high"
        else:
            vehicle["confidence"] = "medium"
    return {"route": info["name"], "routeId": route_id, "routeNameEn": info["name_en"],
            "direction": direction,
            "directionLabel": info["heads"][direction],
            "directionLabelEn": info["heads_en"][direction],
            "closedLoop": closed_loop,
            "stop": {"id": selected["Id"], "name": selected["nameZh"],
                     "nameEn": selected.get("nameEn") or selected["nameZh"]},
            "officialEtaSeconds": eta if eta is not None and eta >= 0 else None,
            "officialStatus": official_status(eta) if eta is None or eta < 0 else None,
            "routeStatuses": route_statuses, "routeVehicles": route_vehicles,
            "vehicles": vehicles, "updatedAt": now.isoformat(),
            "note": "The official ETA covers only the next bus. Vehicle ETAs are estimates from observed stop travel, adjacent official ETA differences, and distance fallback."}


class FeedCache:
    def __init__(self):
        self._data: dict[str, tuple[float, dict]] = {}
        self._fetched_at: dict[str, str] = {}
        self._locks = {name: threading.Lock() for name in
                       ("Route", "Stop", "BusData", "BusEvent", "EstimateTime")}
        self.history = {route_id: SegmentHistory(route_id) for route_id in ROUTES}
        self.calibration = {route_id: CalibrationStore(
            DATABASE if route_id == ROUTE_ID else
            Path(__file__).with_name(f"arrival_history_{route_id}.sqlite3"))
            for route_id in ROUTES}

    def get(self, name: str, ttl: int, refresh: bool = False) -> dict:
        max_age = min(ttl, 5) if refresh else ttl
        cached = self._data.get(name)
        if cached and time.monotonic() - cached[0] < max_age:
            return cached[1]
        with self._locks[name]:
            cached = self._data.get(name)
            if cached and time.monotonic() - cached[0] < max_age:
                return cached[1]
            result = fetch_feed(name)
            self._data[name] = (time.monotonic(), result)
            self._fetched_at[name] = datetime.now(TAIPEI).isoformat()
            return result

    def stops(self, route_id: int = ROUTE_ID) -> list[dict]:
        route_info(route_id)
        return sorted((s for s in self.get("Stop", 3600)["BusInfo"] if
                       s.get("routeId") == route_id),
                      key=lambda s: (int(s["goBack"]), int(s["seqNo"])))

    def snapshot(self, stop_id: int, direction: int, closed_loop: bool = True,
                 route_id: int = ROUTE_ID, refresh: bool = False) -> dict:
        route_info(route_id)
        routes = self.get("Route", 3600)["BusInfo"]
        stops = self.stops(route_id)
        positions = self.get("BusData", 30, refresh)["BusInfo"]
        estimates = self.get("EstimateTime", 30, refresh)["BusInfo"]
        events = self.get("BusEvent", 30, refresh)["BusInfo"]
        now = datetime.now(TAIPEI)
        path_ids = {str(r["pathAttributeId"]) for r in routes if r.get("Id") == route_id}
        self.history[route_id].observe(events, stops, path_ids, now)
        route_events = [event for event in events if str(event.get("RouteID")) in path_ids]
        self.calibration[route_id].observe_arrivals(route_events, now)
        snapshot = build_snapshot(routes, stops, positions, estimates, stop_id, direction,
                                  now=now, events=events, closed_loop=closed_loop,
                                  observed_segments=self.history[route_id].medians(now),
                                  calibration=self.calibration[route_id], route_id=route_id)
        snapshot["feedFetchedAt"] = {name: self._fetched_at.get(name) for name in
                                     ("BusData", "EstimateTime", "BusEvent")}
        self.calibration[route_id].record_forecasts(snapshot)
        return snapshot
