import unittest
import threading
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

from bus_tracker import tracker as tracker_module
from bus_tracker.tracker import (FeedCache, SegmentHistory, build_snapshot, official_status,
                                 ordered_stops, segment_travel_times, vehicle_progress)


class TrackerTests(unittest.TestCase):
    def test_explicit_refresh_bypasses_thirty_second_feed_cache_with_cooldown(self):
        cache = object.__new__(FeedCache)
        cache._data = {}
        cache._fetched_at = {}
        cache._locks = {"BusData": threading.Lock()}
        clock = [100.0]
        feeds = [{"version": 1}, {"version": 2}]
        with patch.object(tracker_module.time, "monotonic", side_effect=lambda: clock[0]), \
                patch.object(tracker_module, "fetch_feed", side_effect=feeds) as fetch:
            self.assertEqual(cache.get("BusData", 30)["version"], 1)
            clock[0] = 110.0
            self.assertEqual(cache.get("BusData", 30)["version"], 1)
            self.assertEqual(cache.get("BusData", 30, refresh=True)["version"], 2)
            clock[0] = 112.0
            self.assertEqual(cache.get("BusData", 30, refresh=True)["version"], 2)
            self.assertEqual(fetch.call_count, 2)

    def setUp(self):
        self.now = datetime(2026, 10, 23, 15, 0, tzinfo=timezone(timedelta(hours=8)))
        self.routes = [{"Id": 16405, "pathAttributeId": 157401}]
        self.stops = [
            {"Id": i + 1, "routeId": 16405, "goBack": "0", "seqNo": i,
             "nameZh": name, "latitude": str(25 + i * .001), "longitude": "121.5"}
            for i, name in enumerate(("A", "B", "C", "D"))
        ]
        self.estimate = [{"RouteID": 16405, "StopID": 4, "GoBack": "0", "EstimateTime": "180"}]

    def bus(self, plate, latitude, route="157401", age=0):
        return {"BusID": plate, "RouteID": route, "GoBack": "0", "Latitude": str(latitude),
                "Longitude": "121.5", "BusStatus": "0", "DutyStatus": "0",
                "DataTime": (self.now - timedelta(seconds=age)).strftime("%Y-%m-%d %H:%M:%S")}

    def test_multiple_buses_have_separate_segment_based_etas(self):
        buses = [self.bus("far", 25.0002), self.bus("near", 25.0017), self.bus("passed", 25.004)]
        result = build_snapshot(self.routes, self.stops, buses, self.estimate, 4, 0, self.now)
        self.assertEqual(result["officialEtaSeconds"], 180)
        self.assertEqual([v["id"] for v in result["vehicles"]], ["near", "far"])
        self.assertEqual([v["stopsAway"] for v in result["vehicles"]], [2, 3])
        self.assertGreater(result["vehicles"][1]["estimatedEtaSeconds"],
                           result["vehicles"][0]["estimatedEtaSeconds"])
        self.assertTrue(all(v["etaBasis"]["distance"] > 0 for v in result["vehicles"]))
        self.assertNotEqual(result["vehicles"][0]["estimatedEtaSeconds"], result["officialEtaSeconds"])

    def test_adjacent_official_eta_differences_supply_segment_times(self):
        estimate = [{"RouteID": 16405, "StopID": i, "GoBack": "0", "EstimateTime": str(seconds)}
                    for i, seconds in ((1, 0), (2, 90), (3, 210), (4, 300))]
        events = [{"BusID": plate, "RouteID": "157401", "GoBack": "0",
                   "StopID": str(stop), "CarOnStop": "1", "DataTime": "2026-10-23 15:00:00"}
                  for plate, stop in (("near", 2), ("far", 1))]
        result = build_snapshot(self.routes, self.stops, [], estimate, 4, 0, self.now, events)
        self.assertEqual([v["estimatedEtaSeconds"] for v in result["vehicles"]], [210, 300])
        self.assertEqual(result["vehicles"][0]["etaBasis"]["official-gap"], 2)

    def test_observed_stop_transition_overrides_adjacent_eta_gap(self):
        history = SegmentHistory()
        first = {"BusID": "bus", "RouteID": "157401", "GoBack": "0", "StopID": "1",
                 "CarOnStop": "0", "DataTime": "2026-10-23 15:00:00"}
        second = {**first, "StopID": "2", "CarOnStop": "1", "DataTime": "2026-10-23 15:02:00"}
        history.observe([first], self.stops, {"157401"}, self.now)
        history.observe([second], self.stops, {"157401"}, self.now + timedelta(minutes=2))
        observed = history.medians(self.now + timedelta(minutes=2))
        self.assertEqual(observed[(0, 1, 2)], 120)
        segments = segment_travel_times(self.stops, 0, [], observed)
        self.assertEqual(segments[0], (120.0, "observed"))

    def test_inconsistent_official_stop_gap_uses_distance_fallback(self):
        estimates = [{"RouteID": 16405, "StopID": 1, "GoBack": "0", "EstimateTime": "600"},
                     {"RouteID": 16405, "StopID": 2, "GoBack": "0", "EstimateTime": "60"}]
        segments = segment_travel_times(self.stops, 0, estimates)
        self.assertEqual(segments[0][1], "distance")
        self.assertGreater(segments[0][0], 0)

    def test_stale_and_wrong_route_are_removed(self):
        buses = [self.bus("stale", 25.002, age=300), self.bus("wrong", 25.002, route="0")]
        result = build_snapshot(self.routes, self.stops, buses, self.estimate, 4, 0, self.now)
        self.assertEqual(result["vehicles"], [])

    def test_projection_rejects_invalid_coordinates(self):
        self.assertIsNone(vehicle_progress({"Latitude": "", "Longitude": "121.5"}, self.stops))

    def test_official_nonrunning_status_is_preserved(self):
        estimate = [{"RouteID": 16405, "StopID": 4, "GoBack": "2", "EstimateTime": "-1"}]
        result = build_snapshot(self.routes, self.stops, [], estimate, 4, 0, self.now)
        self.assertIsNone(result["officialEtaSeconds"])
        self.assertEqual(result["officialStatus"], "未發車")

    def test_route_statuses_follow_official_labels(self):
        self.assertEqual([official_status(x) for x in (0, 179, 180, -1, -3, None)],
                         ["進站中", "將到站", "3分", "未發車", "末班已過", "資料暫缺"])
        result = build_snapshot(self.routes, self.stops, [], self.estimate, 4, 0, self.now)
        self.assertEqual(result["routeStatuses"][-1]["label"], "3分")

    def test_event_only_bus_remains_visible_with_next_stop(self):
        self.stops[1]["nameEn"] = "Stop B"
        self.stops[3]["nameEn"] = "Stop D"
        event = {"BusID": "EAA-109", "RouteID": "157401", "GoBack": "0",
                 "StopID": "1", "CarOnStop": "0", "DataTime": "2026-10-23 15:00:00"}
        result = build_snapshot(self.routes, self.stops, [], self.estimate, 4, 0, self.now, [event])
        self.assertEqual(len(result["vehicles"]), 1)
        self.assertEqual(result["vehicles"][0]["nextStop"], "B")
        self.assertEqual(result["vehicles"][0]["nextStopEn"], "Stop B")
        self.assertEqual(result["stop"]["nameEn"], "Stop D")
        self.assertEqual(result["vehicles"][0]["locationLabel"], "已離站 A")
        self.assertIsNone(result["vehicles"][0]["mapErrorMeters"])
        self.assertEqual(result["routeVehicles"][0]["stopId"], 1)

    def test_bus_entering_stop_reports_the_following_stop(self):
        event = {"BusID": "EAA-109", "RouteID": "157401", "GoBack": "0",
                 "StopID": "2", "CarOnStop": "1", "DataTime": "2026-10-23 15:00:00"}
        result = build_snapshot(self.routes, self.stops, [], self.estimate, 4, 0, self.now, [event])
        self.assertEqual(result["vehicles"][0]["locationLabel"], "進站 B")
        self.assertEqual(result["vehicles"][0]["nextStop"], "C")

    def test_908_and_921_terminal_and_following_buses(self):
        for route_id in (16585, 16664):
            with self.subTest(route_id=route_id):
                path_id = str(route_id + 1000)
                route = [{"Id": route_id, "pathAttributeId": int(path_id)}]
                stops = [
                    {"Id": route_id * 10 + index, "routeId": route_id,
                     "goBack": "0" if index < 3 else "1", "seqNo": index,
                     "nameZh": name, "nameEn": name,
                     "latitude": str(24.99 + index * .001), "longitude": "121.5"}
                    for index, name in enumerate(("三峽", "中興街口", "捷運景安站(景平路)", "返程第一站"))
                ]
                terminal = stops[2]["Id"]
                self.assertEqual([s["Id"] for s in ordered_stops(stops, 1, route_id)],
                                 [terminal, stops[3]["Id"]])
                events = [{"BusID": plate, "RouteID": path_id, "GoBack": "0",
                           "StopID": str(stop), "CarOnStop": "1",
                           "DataTime": "2026-10-23 15:00:00"}
                          for plate, stop in (("near", stops[1]["Id"]), ("following", stops[0]["Id"]))]
                estimate = [{"RouteID": route_id, "StopID": terminal,
                             "GoBack": "0", "EstimateTime": "120"}]
                result = build_snapshot(route, stops, [], estimate, terminal, 0,
                                        self.now, events, route_id=route_id)
                self.assertEqual([v["id"] for v in result["vehicles"]], ["near", "following"])
                self.assertGreater(result["vehicles"][1]["estimatedEtaSeconds"],
                                   result["vehicles"][0]["estimatedEtaSeconds"])
                self.assertEqual(result["routeId"], route_id)
                self.assertEqual(result["officialEtaSeconds"], 120)
                terminal_event = {**events[0], "BusID": "terminal", "StopID": str(terminal)}
                return_view = build_snapshot(route, stops, [], estimate, terminal, 1,
                                             self.now, [terminal_event], route_id=route_id)
                self.assertEqual([v["id"] for v in return_view["vehicles"]], ["terminal"])
                self.assertTrue(return_view["vehicles"][0]["atStop"])
                return_with_following = build_snapshot(route, stops, [], estimate, terminal, 1,
                                                       self.now, events + [terminal_event], route_id=route_id)
                self.assertEqual([v["id"] for v in return_with_following["vehicles"]],
                                 ["terminal", "near", "following"])
                self.assertEqual(return_with_following["vehicles"][1]["originDirection"], 0)

    def test_turnaround_is_reachable_from_outbound_with_following_buses(self):
        stops = [
            {"Id": 122400, "routeId": 16405, "goBack": "0", "seqNo": 30,
             "nameZh": "圓通路口", "latitude": "24.993563", "longitude": "121.497652"},
            {"Id": 122401, "routeId": 16405, "goBack": "0", "seqNo": 31,
             "nameZh": "中興街口", "latitude": "24.993460", "longitude": "121.500082"},
            {"Id": 122402, "routeId": 16405, "goBack": "1", "seqNo": 32,
             "nameZh": "捷運景安站(景平路)", "latitude": "24.993701", "longitude": "121.504583"},
            {"Id": 122403, "routeId": 16405, "goBack": "1", "seqNo": 33,
             "nameZh": "中興街口", "latitude": "24.993819", "longitude": "121.500205"},
        ]
        self.assertEqual([s["Id"] for s in ordered_stops(stops, 0)], [122400, 122401, 122402])
        self.assertEqual([s["Id"] for s in ordered_stops(stops, 1)], [122402, 122403])
        near = self.bus("near", 24.99358); near["Longitude"] = "121.5025"
        following = self.bus("following", 24.99351); following["Longitude"] = "121.4990"
        returning = self.bus("returning", 24.9937); returning["Longitude"] = "121.5045"; returning["GoBack"] = "1"
        eta = [{"RouteID": 16405, "StopID": 122402, "GoBack": "1", "EstimateTime": "120"}]
        event = {"BusID": "returning", "RouteID": "157401", "GoBack": "1",
                 "StopID": "122402", "CarOnStop": "1", "DataTime": "2026-10-23 15:00:00"}
        result = build_snapshot(self.routes, stops, [near, following, returning], eta, 122402, 0,
                                self.now, [event])
        self.assertEqual(result["officialEtaSeconds"], 120)
        self.assertEqual([v["id"] for v in result["vehicles"]], ["returning", "near", "following"])
        self.assertEqual([v["stopsAway"] for v in result["vehicles"]], [0, 1, 2])
        self.assertTrue(result["vehicles"][0]["atStop"])
        self.assertEqual(result["vehicles"][0]["estimatedEtaSeconds"], 0)
        self.assertGreater(result["vehicles"][2]["estimatedEtaSeconds"],
                           result["vehicles"][1]["estimatedEtaSeconds"])
        self.assertEqual(result["vehicles"][0]["nextStop"], "中興街口")
        lagged_position = {**returning, "GoBack": "0"}
        with_lagged_direction = build_snapshot(self.routes, stops, [near, following, lagged_position],
                                              eta, 122402, 0, self.now, [event])
        self.assertEqual(with_lagged_direction["vehicles"][0]["id"], "returning")
        self.assertTrue(with_lagged_direction["vehicles"][0]["atStop"])
        return_view = build_snapshot(self.routes, stops, [near, following, returning], eta, 122402, 1,
                                     self.now, [event])
        self.assertEqual([v["id"] for v in return_view["vehicles"]], ["returning", "near", "following"])
        self.assertEqual([v["stopsAway"] for v in return_view["vehicles"]], [0, 1, 2])
        self.assertTrue(return_view["vehicles"][0]["atStop"])
        self.assertEqual(return_view["vehicles"][1]["originDirection"], 0)
        separate_return = build_snapshot(self.routes, stops, [near, following, returning], eta, 122402, 1,
                                         self.now, [event], closed_loop=False)
        self.assertEqual([v["id"] for v in separate_return["vehicles"]], ["returning"])
        event["CarOnStop"] = "0"
        departed = build_snapshot(self.routes, stops, [near, following, returning], eta, 122402, 0,
                                  self.now, [event])
        self.assertEqual([v["id"] for v in departed["vehicles"]], ["near", "following", "returning"])
        self.assertTrue(departed["vehicles"][-1]["crossDirection"])
        self.assertFalse(departed["vehicles"][-1]["atStop"])
        event["CarOnStop"] = "1"
        separate = build_snapshot(self.routes, stops, [near, following, returning], eta, 122402, 0,
                                  self.now, [event], closed_loop=False)
        self.assertFalse(separate["closedLoop"])
        self.assertEqual([v["id"] for v in separate["vehicles"]], ["near", "following"])

    def test_opposite_direction_bus_reaches_arbitrary_stop_on_next_circuit(self):
        route_id = 16585
        route = [{"Id": route_id, "pathAttributeId": 16685}]
        stops = [
            {"Id": 1, "routeId": route_id, "goBack": "0", "seqNo": 0,
             "nameZh": "三峽", "latitude": "25.000", "longitude": "121.5"},
            {"Id": 2, "routeId": route_id, "goBack": "0", "seqNo": 1,
             "nameZh": "中途站", "latitude": "25.001", "longitude": "121.5"},
            {"Id": 3, "routeId": route_id, "goBack": "0", "seqNo": 2,
             "nameZh": "捷運景安站(景平路)", "latitude": "25.002", "longitude": "121.5"},
            {"Id": 4, "routeId": route_id, "goBack": "1", "seqNo": 3,
             "nameZh": "返程中途站", "latitude": "25.001", "longitude": "121.5"},
            {"Id": 5, "routeId": route_id, "goBack": "1", "seqNo": 4,
             "nameZh": "三峽", "latitude": "25.000", "longitude": "121.5"},
        ]
        stamp = self.now.strftime("%Y-%m-%d %H:%M:%S")
        events = [
            {"BusID": "outbound", "RouteID": "16685", "GoBack": "0",
             "StopID": "1", "CarOnStop": "1", "DataTime": stamp},
            {"BusID": "inbound", "RouteID": "16685", "GoBack": "1",
             "StopID": "4", "CarOnStop": "1", "DataTime": stamp},
        ]
        direct_only = build_snapshot(route, stops, [], [], 2, 0, self.now, events,
                                     closed_loop=False, route_id=route_id)
        self.assertEqual([v["id"] for v in direct_only["vehicles"]], ["outbound"])
        result = build_snapshot(route, stops, [], [], 2, 0, self.now, events,
                                closed_loop=True, route_id=route_id)
        self.assertEqual([v["id"] for v in result["vehicles"]], ["outbound", "inbound"])
        wrapped = result["vehicles"][1]
        self.assertTrue(wrapped["crossDirection"])
        self.assertFalse(wrapped["atStop"], "a bus at an earlier stop has not arrived at the selected stop")
        self.assertEqual(wrapped["originDirection"], 1)
        self.assertEqual(wrapped["confidence"], "low")
        inbound_to_end = build_snapshot(route, stops, [], [], 5, 1, self.now, events,
                                        closed_loop=False, route_id=route_id)
        outbound_first_segment = segment_travel_times(ordered_stops(stops, 0, route_id), 0, [],
                                                      route_id=route_id)[0][0]
        self.assertEqual(wrapped["estimatedEtaSeconds"],
                         inbound_to_end["vehicles"][0]["estimatedEtaSeconds"] + 120 +
                         round(outbound_first_segment))


if __name__ == "__main__":
    unittest.main()
