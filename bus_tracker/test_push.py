"""Regression checks for live phone alert timing and subscription changes."""

import tempfile
import sqlite3
import time
import unittest
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric import ec

from .push import PushService, alert_candidate, b64, public_bytes


class PushTests(unittest.TestCase):
    def test_existing_subscription_database_gains_bus_filter_column(self):
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "push.sqlite3"
            with sqlite3.connect(database) as db:
                db.execute("""CREATE TABLE subscriptions (
                    endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
                    route_id INTEGER NOT NULL, direction INTEGER NOT NULL, stop_id INTEGER NOT NULL,
                    closed_loop INTEGER NOT NULL, walk_minutes INTEGER NOT NULL,
                    last_key TEXT NOT NULL DEFAULT '', last_sent INTEGER NOT NULL DEFAULT 0)""")
            service = PushService("example.ts.net", database, Path(directory) / "vapid.pem")
            with service.connect() as db:
                columns = {row[1] for row in db.execute("PRAGMA table_info(subscriptions)")}
            self.assertIn("tracked_bus_id", columns)

    def test_newer_selection_wins_and_walk_update_keeps_deduplication(self):
        with tempfile.TemporaryDirectory() as directory:
            service = PushService("example.ts.net", Path(directory) / "push.sqlite3",
                                  Path(directory) / "vapid.pem")
            subscription = {"endpoint": "https://fcm.googleapis.com/fcm/send/example",
                            "keys": {"p256dh": b64(public_bytes(ec.generate_private_key(ec.SECP256R1()))),
                                     "auth": b64(b"x" * 16)}}
            settings = {"subscription": subscription, "route_id": 16405,
                        "direction": 0, "stop_id": 101, "closed_loop": True,
                        "walk_minutes": 5, "revision": 1}
            self.assertTrue(service.save(settings))
            service.state(subscription["endpoint"], "BUS-1", 100)
            self.assertTrue(service.save({**settings, "walk_minutes": 8, "revision": 2}))
            self.assertEqual(service.rows()[0]["last_key"], "BUS-1")
            self.assertEqual(service.rows()[0]["last_sent"], 100)
            old_target = service.rows()[0]
            self.assertTrue(service.save({**settings, "stop_id": 102, "revision": 3}))
            self.assertEqual(service.rows()[0]["last_key"], "")
            self.assertFalse(service.is_current(old_target), "a queued send for the old stop is skipped")
            self.assertFalse(service.save({**settings, "stop_id": 101, "revision": 2}))
            self.assertFalse(service.save({**settings, "stop_id": 101, "revision": 3}))
            self.assertEqual(service.rows()[0]["stop_id"], 102)
            previous = service.rows()[0]
            self.assertTrue(service.save({**settings, "stop_id": 102,
                                          "tracked_bus_id": "BUS-2", "revision": 4}))
            self.assertEqual(service.rows()[0]["tracked_bus_id"], "BUS-2")
            self.assertEqual(service.rows()[0]["last_key"], "")
            self.assertFalse(service.is_current(previous), "queued alerts for the old bus are skipped")
            self.assertTrue(service.remove(subscription["endpoint"], 5))
            self.assertFalse(service.save({**settings, "revision": 4}))
            self.assertFalse(service.rows(), "a delayed save cannot recreate a disabled alert")
            self.assertTrue(service.save({**settings, "revision": 6}))

    def test_tracked_alert_never_substitutes_another_bus_or_official_eta(self):
        now = time.time()
        fetched = datetime.fromtimestamp(now - 20, timezone.utc).isoformat()
        snapshot = {"stop": {"name": "測試站"}, "officialEtaSeconds": 180,
                    "feedFetchedAt": {name: fetched for name in ("BusData", "BusEvent", "EstimateTime")},
                    "vehicles": [{"id": "OTHER", "atStop": False, "crossDirection": False,
                                  "dataAgeSeconds": 20, "confidence": "medium",
                                  "estimatedEtaWindowSeconds": [180, 300]}]}
        self.assertIsNone(alert_candidate(snapshot, 5, now, "BUS-2"))
        tracked = {"id": "BUS-2", "atStop": False, "crossDirection": False,
                   "dataAgeSeconds": 20, "confidence": "medium",
                   "estimatedEtaWindowSeconds": [300, 420]}
        snapshot["vehicles"].append(tracked)
        key, body = alert_candidate(snapshot, 5, now, "BUS-2")
        self.assertEqual(key, "BUS-2")
        self.assertIn("BUS-2", body)
        self.assertNotIn("OTHER", body)
        tracked["crossDirection"] = True
        key, body = alert_candidate(snapshot, 5, now, "BUS-2")
        self.assertEqual(key, "BUS-2")
        self.assertIn("折返續行", body)
        self.assertNotIn("OTHER", body)
        self.assertNotEqual(alert_candidate(snapshot, 5, now)[0], "BUS-2",
                            "opposite-direction buses are not used for unpinned alerts")
        tracked["crossDirection"] = False
        tracked["confidence"] = "low"
        self.assertIsNone(alert_candidate(snapshot, 5, now, "BUS-2"))

    def test_alert_uses_elapsed_feed_and_vehicle_time(self):
        now = time.time()
        fetched = datetime.fromtimestamp(now - 60, timezone.utc).isoformat()
        snapshot = {"stop": {"name": "測試站"}, "officialEtaSeconds": 420,
                    "feedFetchedAt": {name: fetched for name in ("BusData", "BusEvent", "EstimateTime")},
                    "vehicles": []}
        key, message = alert_candidate(snapshot, 5, now)
        self.assertTrue(key.startswith("official:"))
        self.assertIn("建議現在出發", message)
        snapshot["vehicles"] = [{"id": "BUS-2", "atStop": False, "crossDirection": False,
                                 "dataAgeSeconds": 60, "confidence": "medium",
                                 "estimatedEtaWindowSeconds": [450, 600],
                                 "estimatedEtaSeconds": 520}]
        self.assertEqual(alert_candidate(snapshot, 5, now)[0], "BUS-2")
        snapshot["vehicles"][0]["crossDirection"] = True
        self.assertTrue(alert_candidate(snapshot, 5, now)[0].startswith("official:"))
        snapshot["feedFetchedAt"] = {name: datetime.fromtimestamp(now - 120, timezone.utc).isoformat()
                                     for name in ("BusData", "BusEvent", "EstimateTime")}
        self.assertIsNone(alert_candidate(snapshot, 5, now))


if __name__ == "__main__":
    unittest.main()
