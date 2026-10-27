import threading
import unittest
from unittest.mock import patch

from . import tracker
from .catalog import route_id_from_input, search_routes, selected_routes


class CatalogTests(unittest.TestCase):
    def test_official_link_is_parsed_without_accepting_other_hosts(self):
        self.assertEqual(route_id_from_input("https://pda5284.gov.taipei/MQS/route.jsp?rid=10841"), 10841)
        self.assertEqual(route_id_from_input("10841"), 10841)
        self.assertIsNone(route_id_from_input("https://elsewhere.example/MQS/route.jsp?rid=10841"))

    def test_numeric_route_name_searches_names_when_it_is_not_a_rid(self):
        with patch.object(tracker, "_catalog_expires", float("inf")):
            self.assertEqual(search_routes("908")[0]["id"], 16585)

    def test_route_names_accept_language_independent_number_aliases(self):
        with patch.object(tracker, "_catalog_expires", float("inf")):
            for spelling in ("橘5", "Ｏｒａｎｇｅ ５", "orange5", "Orange Five"):
                with self.subTest(spelling=spelling):
                    self.assertEqual(search_routes(spelling)[0]["id"], 16405)

    def test_structured_number_does_not_match_longer_number(self):
        route_five = dict(tracker.ROUTES[16405])
        route_fifty = dict(route_five, name="橘50", name_en="Orange 50")
        with patch.dict(tracker.ROUTES, {16405: route_five, 50000: route_fifty}, clear=True), \
                patch.object(tracker, "_catalog_expires", float("inf")):
            self.assertEqual([r["id"] for r in search_routes("Orange 5")], [16405])
            self.assertEqual([r["id"] for r in search_routes("Orange 50")], [50000])

    def test_dynamic_taipei_route_uses_taipei_feed_and_generic_stop_order(self):
        route = {"Id": 10841, "nameZh": "0東", "nameEn": "0East", "pathAttributeId": 108410,
                 "departureZh": "內湖", "destinationZh": "臺北車站",
                 "departureEn": "Neihu", "destinationEn": "Taipei Main Sta."}
        feeds = {"new-taipei": {"BusInfo": []}, "taipei": {"BusInfo": [route]}}

        def fake_fetch(name, source="new-taipei"):
            if name == "Route":
                return feeds[source]
            if name == "Stop":
                return {"BusInfo": [
                    {"Id": 1, "routeId": 10841, "goBack": "0", "seqNo": 1,
                     "nameZh": "內湖", "latitude": "25", "longitude": "121"},
                    {"Id": 2, "routeId": 10841, "goBack": "0", "seqNo": 2,
                     "nameZh": "臺北車站", "latitude": "25", "longitude": "121.1"}]}
            raise AssertionError(name)

        with patch.dict(tracker.ROUTES, {}, clear=True), \
                patch.object(tracker, "fetch_feed", side_effect=fake_fetch) as fetch, \
                patch.object(tracker, "_catalog_expires", 0):
            found = search_routes("0東")
            self.assertEqual(found[0]["source"], "taipei")
            self.assertEqual(found[0]["heads"], ("往臺北車站", "往內湖"))
            self.assertEqual(selected_routes([10841])[0]["id"], 10841)
            cache = object.__new__(tracker.FeedCache)
            cache._data = {}
            cache._fetched_at = {}
            cache._locks = {"taipei:Stop": threading.Lock()}
            self.assertEqual([s["Id"] for s in cache.stops(10841)], [1, 2])
            self.assertEqual([s["Id"] for s in tracker.ordered_stops(cache.stops(10841), 0, 10841)], [1, 2])
            fetch.assert_any_call("Stop", "taipei")
            self.assertEqual(search_routes("https://pda5284.gov.taipei/MQS/route.jsp?rid=10841")[0]["id"], 10841)


if __name__ == "__main__":
    unittest.main()
