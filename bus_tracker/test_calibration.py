import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .calibration import CalibrationStore, prediction_window

TAIPEI = timezone(timedelta(hours=8))


class CalibrationTests(unittest.TestCase):
    def test_terminal_forecast_keeps_the_approach_direction(self):
        with tempfile.TemporaryDirectory() as directory:
            store = CalibrationStore(Path(directory) / "arrivals.sqlite3")
            store.record_forecasts({"updatedAt": "2026-10-23T15:00:00+08:00", "direction": 1,
                "stop": {"id": 122402}, "vehicles": [{"id": "BUS-1", "atStop": False,
                "originDirection": 0, "estimatedEtaSeconds": 180,
                "etaBasis": {"official-gap": 1}}]})
            with store._connect() as db:
                directions = [row[0] for row in db.execute("SELECT direction FROM forecasts")]
            self.assertEqual(directions, [0])

    def test_actual_arrivals_calibrate_range_once_per_bus(self):
        with tempfile.TemporaryDirectory() as directory:
            store = CalibrationStore(Path(directory) / "arrivals.sqlite3")
            now = datetime(2026, 10, 23, 15, 0, tzinfo=TAIPEI)
            for index in range(5):
                made_at = now + timedelta(minutes=index * 10)
                plate = f"BUS-{index}"
                store.record_forecasts({"updatedAt": made_at.isoformat(), "direction": 0,
                    "stop": {"id": 122402}, "vehicles": [{"id": plate, "atStop": False,
                    "estimatedEtaSeconds": 180, "etaBasis": {"observed": 1}}]})
                arrived = made_at + timedelta(seconds=240)
                event = {"BusID": plate, "StopID": "122402", "CarOnStop": "1",
                         "DataTime": arrived.strftime("%Y-%m-%d %H:%M:%S")}
                store.observe_arrivals([event, event], arrived)
            error, count = store.error_sample(0, 3, now + timedelta(hours=1))
            self.assertEqual((error, count), (60, 5))
            window, samples = prediction_window(600, {"observed": 3}, 3, 0,
                                                now + timedelta(hours=1), store)
            self.assertEqual(samples, 5)
            self.assertLess(window[0], 600)
            self.assertGreater(window[1], 600)

    def test_sparse_distance_predictions_get_wider_range(self):
        now = datetime(2026, 10, 23, 15, 0, tzinfo=TAIPEI)
        observed, _ = prediction_window(600, {"observed": 4}, 4, 0, now)
        distance, _ = prediction_window(600, {"distance": 4}, 4, 0, now)
        self.assertLess(distance[0], observed[0])
        self.assertGreater(distance[1], observed[1])


if __name__ == "__main__":
    unittest.main()
