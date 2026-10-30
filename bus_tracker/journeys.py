"""Find routes serving a searched stop in the city stop feeds."""
from difflib import SequenceMatcher
import re
import unicodedata

from .feeds import FEED_BASES


def stop_key(value):
    value = unicodedata.normalize("NFKC", str(value or "")).casefold().replace("台", "臺")
    return re.sub(r"[^\w\u3400-\u9fff]+", "", value)


def match_score(query, name):
    needle, target = stop_key(query), stop_key(name)
    if not needle or not target:
        return 0
    if needle == target:
        return 100
    if target.startswith(needle):
        return 85
    if needle in target:
        return 75
    if len(needle) < 2:
        return 0
    ratio = SequenceMatcher(None, needle, target).ratio()
    return round(65 * ratio) if ratio >= .68 else 0


def routes_at_stop(rows, query, routes, limit=250):
    """Rank route/direction/stop matches by name and next-bus availability."""
    matches = {}
    for row in rows:
        try:
            route_id = int(row['routeId'])
            direction = int(row['goBack'])
            stop_id = int(row['Id'])
        except (KeyError, ValueError, TypeError):
            continue
        if route_id not in routes or direction not in (0, 1):
            continue
        name = str(row.get('nameZh') or '').strip()
        if not name or any(tag in name for tag in ('虛擬站不停靠', '暫時裁撤')):
            continue
        name_en = str(row.get('nameEn') or '').strip()
        score = max(match_score(query, name), match_score(query, name_en))
        if score < 40:
            continue
        key = route_id, direction, stop_id
        info = routes[route_id]
        candidate = {'routeId': route_id, 'routeName': info['name'],
                     'routeNameEn': info['name_en'], 'direction': direction,
                     'head': info['heads'][direction], 'headEn': info['heads_en'][direction],
                     'stopId': stop_id, 'stopName': name, 'stopNameEn': name_en,
                     'score': score}
        if key not in matches or score > matches[key]['score']:
            matches[key] = candidate
    return sorted(matches.values(), key=lambda item: (-item['score'], item['routeName'],
                                                       item['direction'], item['stopName']))[:limit]


def suggestions(rows, query, limit=6):
    if not stop_key(query):
        return []
    names = {}
    for row in rows:
        name = str(row.get('nameZh') or '').strip()
        english = str(row.get('nameEn') or '').strip()
        score = max(match_score(query, name), match_score(query, english))
        if score >= 40 and (name not in names or score > names[name][0]):
            names[name] = (score, english)
    return [{'name': name, 'nameEn': english} for name, (score, english) in
            sorted(names.items(), key=lambda item: (-item[1][0], len(item[0]), item[0]))[:limit]]


def find_stop_routes(cache, routes, query):
    rows = []
    failed = 0
    for feed in FEED_BASES:
        try:
            rows.extend(cache.get('Stop', 3600, feed=feed)['BusInfo'])
        except (OSError, ValueError, KeyError, TypeError):
            failed += 1
    if failed == len(FEED_BASES):
        raise ValueError('Stop data is temporarily unavailable')
    answer = {'suggestions': suggestions(rows, query),
              'routes': routes_at_stop(rows, query, routes)}
    if answer['routes']:
        for feed in FEED_BASES:
            relevant = [item for item in answer['routes'] if routes[item['routeId']]['feed'] == feed]
            if not relevant:
                continue
            try:
                estimates = cache.get('EstimateTime', 30, feed=feed)['BusInfo']
            except (OSError, ValueError, KeyError, TypeError):
                continue
            needed = {(item['routeId'], item['stopId'], item['direction']) for item in relevant}
            eta = {}
            for row in estimates:
                try:
                    key = (int(row['RouteID']), int(row['StopID']), int(row['GoBack']))
                    if key not in needed:
                        continue
                    seconds = int(row['EstimateTime'])
                except (KeyError, ValueError, TypeError):
                    continue
                if seconds >= 0:
                    eta[key] = min(seconds, eta.get(key, seconds))
            for item in relevant:
                seconds = eta.get((item['routeId'], item['stopId'], item['direction']))
                item['officialMinutes'] = (seconds + 59) // 60 if seconds is not None else None
        answer['routes'].sort(key=lambda item: (-item['score'], item.get('officialMinutes') is None,
                                                   item.get('officialMinutes') or 0, item['routeName']))
    return answer
