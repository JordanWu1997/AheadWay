"""Regression checks for live phone alert timing and subscription changes."""

import tempfile
import time
import unittest
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric import ec

from .push import PushService, alert_candidate, b64, public_bytes


class PushTests(unittest.TestCase):
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
            self.assertTrue(service.remove(subscription["endpoint"], 5))
            self.assertFalse(service.save({**settings, "revision": 4}))
            self.assertFalse(service.rows(), "a delayed save cannot recreate a disabled alert")
            self.assertTrue(service.save({**settings, "revision": 6}))

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
