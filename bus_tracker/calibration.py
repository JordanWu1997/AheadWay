"""Local prediction-versus-arrival history for approximate ETA ranges."""

from datetime import datetime, timedelta
from pathlib import Path
from contextlib import contextmanager
import json
import math
import sqlite3
import threading

DATABASE = Path(__file__).with_name("arrival_history.sqlite3")


class CalibrationStore:
    def __init__(self, path=DATABASE):
        self.path = str(path)
        self.lock = threading.Lock()
        with self._connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS forecasts (
                plate TEXT NOT NULL, stop_id INTEGER NOT NULL, direction INTEGER NOT NULL,
                made_at INTEGER NOT NULL, eta_seconds INTEGER NOT NULL, basis TEXT NOT NULL,
                PRIMARY KEY (plate, stop_id, direction, made_at))""")
            db.execute("""CREATE TABLE IF NOT EXISTS arrivals (
                plate TEXT NOT NULL, stop_id INTEGER NOT NULL, arrived_at INTEGER NOT NULL,
                PRIMARY KEY (plate, stop_id, arrived_at))""")
            db.execute("""CREATE TABLE IF NOT EXISTS errors (
                plate TEXT NOT NULL, stop_id INTEGER NOT NULL, direction INTEGER NOT NULL,
                arrived_at INTEGER NOT NULL, predicted_seconds INTEGER NOT NULL,
                error_seconds INTEGER NOT NULL, basis TEXT NOT NULL,
                PRIMARY KEY (plate, stop_id, direction, arrived_at))""")

    @contextmanager
    def _connect(self):
        db = sqlite3.connect(self.path, timeout=5)
        db.execute("PRAGMA busy_timeout=5000")
        try:
            with db:
                yield db
        finally:
            db.close()

    def observe_arrivals(self, events, now):
        """Match a fresh stop arrival to the latest forecast at least 60 seconds earlier."""
        cutoff = int((now - timedelta(hours=2)).timestamp())
        with self.lock, self._connect() as db:
            for event in events:
                if str(event.get("CarOnStop")) != "1":
                    continue
                try:
                    plate = str(event["BusID"])
                    stop_id = int(event["StopID"])
                    arrived = int(datetime.strptime(event["DataTime"], "%Y-%m-%d %H:%M:%S")
                                  .replace(tzinfo=now.tzinfo).timestamp())
                except (KeyError, TypeError, ValueError):
                    continue
                if not plate or plate.startswith("TEST") or arrived < cutoff or arrived > int(now.timestamp()) + 60:
                    continue
                inserted = db.execute("INSERT OR IGNORE INTO arrivals VALUES (?, ?, ?)",
                                      (plate, stop_id, arrived))
                if not inserted.rowcount:
                    continue
                rows = db.execute("""SELECT direction, made_at, eta_seconds, basis FROM forecasts
                    WHERE plate=? AND stop_id=? AND made_at BETWEEN ? AND ?
                    ORDER BY made_at DESC""", (plate, stop_id, arrived - 3600, arrived - 60)).fetchall()
                seen_directions = set()
                for direction, made_at, eta, basis in rows:
                    if direction in seen_directions:
                        continue
                    seen_directions.add(direction)
                    error = arrived - made_at - eta
                    db.execute("INSERT OR IGNORE INTO errors VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (plate, stop_id, direction, arrived, eta, error, basis))
                db.execute("DELETE FROM forecasts WHERE plate=? AND stop_id=? AND made_at<=?",
                           (plate, stop_id, arrived))
            db.execute("DELETE FROM forecasts WHERE made_at<?", (cutoff,))
            db.execute("DELETE FROM errors WHERE arrived_at<?", (int((now - timedelta(days=30)).timestamp()),))
            db.execute("DELETE FROM arrivals WHERE arrived_at<?", (int((now - timedelta(days=30)).timestamp()),))

    def record_forecasts(self, snapshot):
        made_at = int(datetime.fromisoformat(snapshot["updatedAt"]).timestamp())
        direction = snapshot["direction"]
        stop_id = snapshot["stop"]["id"]
        with self.lock, self._connect() as db:
            for vehicle in snapshot["vehicles"]:
                eta = vehicle["estimatedEtaSeconds"]
                if vehicle.get("atStop") or vehicle.get("crossDirection") or eta < 60:
                    continue
                db.execute("INSERT OR IGNORE INTO forecasts VALUES (?, ?, ?, ?, ?, ?)",
                           (vehicle["id"], stop_id, vehicle.get("originDirection", direction), made_at, eta,
                            json.dumps(vehicle.get("etaBasis", {}))))

    def error_sample(self, direction, stops_away, now):
        """Return the 80th percentile absolute error in the same trip-distance bucket."""
        lower = int((now - timedelta(days=30)).timestamp())
        # Short and long predictions behave differently; use the expected
        # horizon as a stable proxy for stop distance in stored forecasts.
        min_eta, max_eta = (0, 600) if stops_away <= 5 else (600, 7200)
        with self.lock, self._connect() as db:
            values = sorted(abs(row[0]) for row in db.execute("""SELECT error_seconds FROM errors
                WHERE direction=? AND arrived_at>=? AND predicted_seconds BETWEEN ? AND ?""",
                (direction, lower, min_eta, max_eta)).fetchall())
        if not values:
            return None, 0
        return values[min(len(values) - 1, math.ceil(.8 * len(values)) - 1)], len(values)


def prediction_window(seconds, basis, stops_away, direction, now, calibration=None):
    if seconds <= 0:
        return [0, 0], 0
    segments = sum(basis.values()) or 1
    distance_share = basis.get("distance", 0) / segments
    official_share = basis.get("official-gap", 0) / segments
    baseline = max(60, seconds * (.18 + .15 * distance_share + .08 * official_share))
    measured, count = calibration.error_sample(direction, stops_away, now) if calibration else (None, 0)
    margin = max(45, round((baseline + measured) / 2)) if measured is not None and count >= 5 else round(baseline)
    return [max(0, round(seconds - margin)), round(seconds + margin)], count
