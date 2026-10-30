import unittest

from bus_tracker.journeys import find_stop_routes, match_score, routes_at_stop, suggestions


ROUTES = {7: {'name': '7', 'name_en': 'Route 7', 'heads': ('往終點', '往起點'),
              'heads_en': ('to end', 'to start'), 'feed': 'new-taipei'}}


def stop(id, name, sequence, direction=0):
    return {'Id': id, 'routeId': 7, 'goBack': direction, 'seqNo': sequence,
            'nameZh': name, 'nameEn': ''}


class StopRouteTests(unittest.TestCase):
    def test_routes_include_each_direction_and_matched_stop(self):
        rows = [stop(1, '捷運景安站', 1), stop(2, '三峽一站', 2),
                stop(3, '捷運景安站', 3, 1)]
        found = routes_at_stop(rows, '景安', ROUTES)
        self.assertEqual([(item['direction'], item['stopId']) for item in found], [(0, 1), (1, 3)])
        self.assertEqual(routes_at_stop(rows, '不存在', ROUTES), [])

    def test_named_stop_variants_survive_many_exact_matches(self):
        routes = {route_id: {'name': str(route_id), 'name_en': str(route_id),
                             'heads': ('往終點', '往起點'), 'heads_en': ('to end', 'to start'),
                             'feed': 'new-taipei'} for route_id in range(1, 45)}
        rows = [dict(stop(route_id, '捷運景安站', 1), routeId=route_id)
                for route_id in range(1, 44)]
        rows.append(dict(stop(908, '捷運景安站(景平路)', 1), routeId=44))
        found = routes_at_stop(rows, '捷運景安站', routes)
        self.assertEqual(len(found), 44)
        self.assertTrue(any(item['stopName'] == '捷運景安站(景平路)' for item in found))

    def test_finder_includes_official_stop_eta(self):
        class FakeCache:
            def get(self, name, ttl, feed='new-taipei'):
                if feed != 'new-taipei':
                    raise ValueError('offline')
                if name == 'Stop':
                    return {'BusInfo': [stop(1, '景安站', 1)]}
                return {'BusInfo': [{'RouteID': 7, 'StopID': 1, 'GoBack': 0,
                                     'EstimateTime': 121}]}
        result = find_stop_routes(FakeCache(), ROUTES, '景安')
        self.assertEqual(result['routes'][0]['officialMinutes'], 3)
        self.assertEqual(result['routes'][0]['stopId'], 1)

    def test_fuzzy_and_suggestions(self):
        self.assertGreaterEqual(match_score('景安', '捷運景安站'), 40)
        self.assertGreaterEqual(match_score('Jingan Staton', 'Jingan Station'), 40)
        self.assertEqual(suggestions([stop(1, '捷運景安站', 1)], '景安')[0]['name'], '捷運景安站')


if __name__ == '__main__':
    unittest.main()
