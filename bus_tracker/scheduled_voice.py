"""Local voice session called by the user's daily cron entry."""

import fcntl
import logging
import subprocess
import tempfile
import time
from pathlib import Path
import re

from .schedule import read_schedule
from .speech_audio import render_api_wav, render_wav
from .tracker import ROUTE_ID, FeedCache

LOGGER = logging.getLogger(__name__)
LOCK_PATH = Path(__file__).with_name("scheduled_voice.lock")


def english_name(name):
    expanded = re.sub(r"\b(St|Sta|Rd)\.",
                      lambda match: {"St": "Street", "Sta": "Station", "Rd": "Road"}[match.group(1)],
                      name or "unknown stop")
    return re.sub(r"(?<!\s)\(", " (", expanded)


def bus_eta_words(bus, language):
    window = bus.get("estimatedEtaWindowSeconds")
    if window:
        low = max(0, window[0] // 60)
        high = max(1, (window[1] + 59) // 60)
        if low != high:
            return f"{low} to {high} minutes" if language == "en" else f"{low}到{high}分鐘"
        minutes = high
    else:
        minutes = max(1, (bus["estimatedEtaSeconds"] + 59) // 60)
    return f"{minutes} minutes" if language == "en" else f"{minutes}分鐘"


def spoken_route(snapshot, language):
    if language == "en":
        return snapshot.get("routeNameEn") or "Orange Five"
    return {"橘5": "橘五", "908": "九零八", "921": "九二一"}.get(snapshot.get("route"), snapshot.get("route", "橘五"))


def report_text(snapshot, language="zh", voice_format="verbose"):
    eta = snapshot["officialEtaSeconds"]
    buses = snapshot["vehicles"]
    direct = [bus for bus in buses if not bus.get("crossDirection") or bus.get("atStop")]
    next_circuit = [bus for bus in buses if bus.get("crossDirection") and not bus.get("atStop")]
    status_conflict = eta is None and snapshot.get("officialStatus") == "今日未營運" and any(
        not bus.get("crossDirection") or bus.get("atStop") for bus in buses)
    if voice_format == "short":
        if language == "en":
            status = ("The official next bus is arriving now" if eta < 60 else
                      f"The official next bus is expected in {(eta + 59) // 60} minutes") if eta is not None else (
                      "The official status and bus positions disagree" if status_conflict else
                      {"未發車": "The next bus has not departed", "末班已過": "The last bus has passed",
                       "今日未營運": "This route is not operating today", "交管不停": "Buses are skipping this stop"}.get(
                          snapshot.get("officialStatus"), "The official arrival status is unavailable"))
            sections = []
            if direct:
                sections.append("Buses for this stop: " + "; ".join(
                    f"bus {index}, " + ("at the stop" if bus.get("atStop") else f"about {bus_eta_words(bus, 'en')}")
                    for index, bus in enumerate(direct, 1)))
            if next_circuit:
                sections.append("If buses on the other direction continue service after the terminal, next-circuit estimates: " +
                                "; ".join(f"bus {index}, about {bus_eta_words(bus, 'en')}"
                                          for index, bus in enumerate(next_circuit, 1)))
            direction = snapshot.get("directionLabelEn") or (
                "toward Jingan MRT Station" if snapshot.get("direction", 0) == 0 else "toward Banqiao")
            return f"{spoken_route(snapshot, 'en')}, {direction}, " + \
                f"{english_name(snapshot['stop'].get('nameEn') or snapshot['stop'].get('name'))}. " + \
                ("" if sections else f"{status}. ") + \
                f"{'. '.join(sections) if sections else 'No approaching buses can currently be confirmed'}."
        status = ("官方預估下一班進站中" if eta < 60 else
                  f"官方預估下一班約{(eta + 59) // 60}分鐘抵達") if eta is not None else (
                  "官方狀態與沿線車輛資料不一致" if status_conflict else
                  f"官方狀態是{snapshot.get('officialStatus') or '暫無到站預估'}")
        sections = []
        if direct:
            sections.append("本方向：" + "，".join(
                f"第{index}輛" + ("已到站" if bus.get("atStop") else f"推估約{bus_eta_words(bus, 'zh')}")
                for index, bus in enumerate(direct, 1)))
        if next_circuit:
            sections.append("另一方向公車若在終點折返續行，下一輪推估：" + "，".join(
                f"第{index}輛約{bus_eta_words(bus, 'zh')}" for index, bus in enumerate(next_circuit, 1)))
        return f"{spoken_route(snapshot, 'zh')}，{snapshot['directionLabel']}，{snapshot['stop']['name']}。" + \
            ("" if sections else f"{status}。") + \
            f"{'。'.join(sections) if sections else '目前沒有可確認接近本站的車輛'}。"
    if language == "en":
        status = ("The official feed says the route is not operating today, but live bus data is present; the sources disagree"
                  if status_conflict else {"未發車": "The next bus has not departed",
                   "末班已過": "The last bus has passed",
                   "今日未營運": "This route is not operating today",
                   "交管不停": "Buses are skipping this stop"}.get(snapshot.get("officialStatus"),
                   "The official arrival status is unavailable") if eta is None else
                  "The official next bus is arriving now" if eta < 60 else
                  f"The official next bus is expected in {(eta + 59) // 60} minutes")
        count = len(buses)
        following = (f"{count} bus{'es' if count != 1 else ''} can be tracked on this route"
                     if count else "No approaching buses can currently be confirmed")
        direct_detail = ". ".join(
            f"Bus {index}, {bus['id']}, " +
            ("is at the stop" if bus.get("atStop") else
             f"is estimated in about {bus_eta_words(bus, 'en')}")
            for index, bus in enumerate(direct, 1) if bus.get("estimatedEtaSeconds") is not None)
        cross_detail = ("If buses on the other direction continue service after the terminal, "
                        "next-circuit estimates: " + "; ".join(
                            f"Bus {index}, {bus['id']}, about {bus_eta_words(bus, 'en')}"
                            for index, bus in enumerate(next_circuit, 1))) if next_circuit else ""
        individual = ". ".join(part for part in (direct_detail, cross_detail) if part)
        direction = snapshot.get("directionLabelEn") or (
            "toward Jingan MRT Station" if snapshot.get("direction", 0) == 0 else "toward Banqiao")
        stop = english_name(snapshot["stop"].get("nameEn") or snapshot["stop"].get("name"))
        route = spoken_route(snapshot, "en")
        return f"{route}, {direction}, {stop}. {status}. {following}. {individual}." if individual else \
            f"{route}, {direction}, {stop}. {status}. {following}."
    if eta is None:
        status = ("官方資料顯示今日未營運，但沿線有公車動態；兩筆資料不一致" if status_conflict else
                  f"官方狀態是{snapshot.get('officialStatus') or '暫無到站預估'}")
    elif eta < 60:
        status = "官方預估下一班即將進站"
    else:
        status = f"官方預估下一班約{(eta + 59) // 60}分鐘抵達"
    count = len(buses)
    following = f"沿線可追蹤{count}輛車" if count else "目前沒有可確認接近本站的車輛"
    direct_detail = "。".join(
        f"第{index}輛{bus['id']}" +
        ("已在本站" if bus.get("atStop") else
         f"推估約{bus_eta_words(bus, 'zh')}抵達")
        for index, bus in enumerate(direct, 1) if bus.get("estimatedEtaSeconds") is not None)
    cross_detail = ("另一方向公車若在終點折返續行，下一輪推估：" + "，".join(
        f"第{index}輛{bus['id']}約{bus_eta_words(bus, 'zh')}抵達"
        for index, bus in enumerate(next_circuit, 1))) if next_circuit else ""
    individual = "。".join(part for part in (direct_detail, cross_detail) if part)
    route = spoken_route(snapshot, "zh")
    return f"{route}，{snapshot['directionLabel']}，{snapshot['stop']['name']}。{status}。{following}。{individual}。" if individual else \
        f"{route}，{snapshot['directionLabel']}，{snapshot['stop']['name']}。{status}。{following}。"


def play_report(text, settings):
    if settings.get("voice_engine") == "api":
        audio = render_api_wav(text, settings.get("voice_model", "tts-1"), settings.get("voice_name", "alloy"))
    else:
        audio = render_wav(text, settings.get("voice_name", "cmn"))
    with tempfile.TemporaryDirectory(prefix="bus-tracker-voice-") as directory:
        path = Path(directory) / "report.wav"
        path.write_bytes(audio)
        subprocess.run(["paplay", str(path)], check=True, timeout=90)


def vehicle_alert_text(snapshot, bus, language, voice_format="verbose"):
    if voice_format == "short":
        number = next((index for index, vehicle in enumerate(
            (v for v in snapshot["vehicles"] if not v.get("crossDirection")), 1)
            if vehicle["id"] == bus["id"]), 1)
        if language == "en":
            stop = english_name(snapshot["stop"].get("nameEn") or snapshot["stop"].get("name"))
            arrival = "at the stop" if bus.get("atStop") else f"estimated in about {bus_eta_words(bus, 'en')}"
            return f"{spoken_route(snapshot, 'en')} at {stop}. Bus {number} is {arrival}."
        arrival = "已到站" if bus.get("atStop") else f"推估約{bus_eta_words(bus, 'zh')}抵達"
        return f"{spoken_route(snapshot, 'zh')}，{snapshot['stop']['name']}。第{number}輛公車{arrival}。"
    if language == "en":
        stop = english_name(snapshot["stop"].get("nameEn") or snapshot["stop"].get("name"))
        arrival = "at the stop" if bus.get("atStop") else f"estimated in about {bus_eta_words(bus, 'en')}"
        return f"{spoken_route(snapshot, 'en')} at {stop}. Bus {bus['id']} is {arrival}."
    arrival = "已在本站" if bus.get("atStop") else f"推估約{bus_eta_words(bus, 'zh')}抵達"
    return f"{spoken_route(snapshot, 'zh')}，{snapshot['stop']['name']}。{bus['id']}{arrival}。"


def official_alert_text(snapshot, language):
    eta = snapshot["officialEtaSeconds"]
    minutes = max(1, (eta + 59) // 60)
    if language == "en":
        stop = english_name(snapshot["stop"].get("nameEn") or snapshot["stop"].get("name"))
        return f"{spoken_route(snapshot, 'en')} at {stop}. The official next bus is expected in about {minutes} minutes."
    return f"{spoken_route(snapshot, 'zh')}，{snapshot['stop']['name']}。官方下一班約{minutes}分鐘抵達。"


def run_session(settings, *, cache=None, speak=None, clock=None, sleep=None, current_settings=None):
    """Poll until the configured duration ends; dependencies are injectable for tests."""
    cache = cache or FeedCache()
    speak = speak or (lambda words: play_report(words, settings))
    clock = clock or time.monotonic
    sleep = sleep or time.sleep
    current_settings = current_settings or read_schedule
    deadline = clock() + settings.get("duration_minutes", 60) * 60
    interval = settings.get("briefing_interval_minutes", 5) * 60
    threshold = settings.get("alert_threshold_minutes", 5) * 60
    language = settings.get("voice_language", "zh")
    last_briefing = None
    official_announced = False
    announced = {}
    while clock() < deadline:
        if current_settings() != settings:
            break
        try:
            snapshot = cache.snapshot(settings["stop_id"], settings["direction"], settings["closed_loop"],
                                      settings.get("route_id", ROUTE_ID))
            now = clock()
            if last_briefing is None or (settings.get("mode", "briefing") == "briefing" and now - last_briefing >= interval):
                speak(report_text(snapshot, language, settings.get("voice_format", "short")))
                last_briefing = clock()
                if settings.get("mode") == "alert":
                    official_announced = snapshot["officialEtaSeconds"] is not None and snapshot["officialEtaSeconds"] <= threshold
                    announced.update({bus["id"]: now for bus in snapshot["vehicles"] if not bus.get("crossDirection") and
                                      (bus.get("atStop") or (bus.get("estimatedEtaSeconds") is not None and
                                                               bus["estimatedEtaSeconds"] <= threshold))})
            elif settings.get("mode") == "alert":
                for plate, seen in list(announced.items()):
                    if now - seen > 600:
                        del announced[plate]
                for bus in snapshot["vehicles"]:
                    if bus["id"] in announced:
                        announced[bus["id"]] = now
                due = snapshot["officialEtaSeconds"] is not None and snapshot["officialEtaSeconds"] <= threshold
                if due and not official_announced:
                    speak(official_alert_text(snapshot, language))
                    official_announced = True
                for bus in snapshot["vehicles"]:
                    if not bus.get("crossDirection") and bus["id"] not in announced and (bus.get("atStop") or
                            (bus.get("estimatedEtaSeconds") is not None and bus["estimatedEtaSeconds"] <= threshold)):
                        speak(vehicle_alert_text(snapshot, bus, language, settings.get("voice_format", "short")))
                        announced[bus["id"]] = now
        except Exception:
            LOGGER.exception("Scheduled bus report failed; retrying at next poll")
        remaining = deadline - clock()
        if remaining > 0:
            sleep(min(30, remaining))


def main():
    logging.basicConfig(level=logging.INFO)
    with LOCK_PATH.open("a+") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            LOGGER.info("A scheduled voice session is already running")
            return
        settings = read_schedule()
        if settings["enabled"]:
            run_session(settings)


if __name__ == "__main__":
    main()
