"""Persist one daily bus report and install its user cron entry."""

import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import threading
from .speech_audio import ESPEAK_VOICES
from .tracker import ROUTE_ID, route_info

CONFIG = Path(__file__).with_name("schedule.json")
MARKER = "# bus-tracker-orange5-daily"
TIME = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
LOCK = threading.Lock()


def read_schedule():
    if CONFIG.exists():
        stored = json.loads(CONFIG.read_text(encoding="utf-8"))
        # Keep an existing daily report's detailed wording until its owner
        # explicitly saves a new speech format from the dashboard.
        return {**default_schedule(), "voice_format": "verbose", **stored}
    return default_schedule()


def default_schedule():
    return {"enabled": False, "time": "07:30", "route_id": ROUTE_ID, "direction": 0,
            "stop_id": 122402, "closed_loop": True, "voice_engine": "espeak",
            "voice_model": "tts-1", "voice_name": "cmn", "voice_language": "zh",
            "voice_format": "short",
            "mode": "briefing", "duration_minutes": 60,
            "briefing_interval_minutes": 5, "alert_threshold_minutes": 5}


def validate(data):
    if not isinstance(data, dict) or not isinstance(data.get("enabled"), bool):
        raise ValueError("Invalid schedule")
    route_id = data.get("route_id", ROUTE_ID)
    route_info(route_id)
    match = TIME.fullmatch(str(data.get("time", "")))
    if not match:
        raise ValueError("Time must be HH:MM")
    direction = data.get("direction")
    stop_id = data.get("stop_id")
    if type(direction) is not int or direction not in (0, 1):
        raise ValueError("Direction must be 0 or 1")
    if type(stop_id) is not int or stop_id < 1:
        raise ValueError("Invalid stop")
    if not isinstance(data.get("closed_loop"), bool):
        raise ValueError("Invalid closed-loop value")
    engine = data.get("voice_engine", "espeak")
    if engine not in ("espeak", "api"):
        raise ValueError("Invalid scheduled voice engine")
    language = data.get("voice_language", "zh")
    if language not in ("zh", "en"):
        raise ValueError("Voice language must be zh or en")
    voice_format = data.get("voice_format", "short")
    if voice_format not in ("short", "verbose", "track"):
        raise ValueError("Voice format must be short, verbose, or track")
    tracked_bus_id = data.get("tracked_bus_id", "")
    if not isinstance(tracked_bus_id, str) or len(tracked_bus_id) > 40 or (voice_format == "track" and data["enabled"] and not tracked_bus_id.strip()):
        raise ValueError("Choose a bus before saving tracking voice mode")
    model = data.get("voice_model", "tts-1")
    name = data.get("voice_name", "anne" if engine == "api" else "en" if language == "en" else "cmn")
    if engine == "espeak" and name not in ESPEAK_VOICES:
        raise ValueError("Unknown eSpeak voice")
    if engine == "espeak" and not name.startswith("cmn" if language == "zh" else "en"):
        raise ValueError("eSpeak voice does not match report language")
    if not isinstance(model, str) or not model.strip() or len(model) > 80 or \
            not isinstance(name, str) or not name.strip() or len(name) > 80:
        raise ValueError("Invalid scheduled TTS model or voice")
    mode = data.get("mode", "briefing")
    duration = data.get("duration_minutes", 60)
    interval = data.get("briefing_interval_minutes", 5)
    threshold = data.get("alert_threshold_minutes", 5)
    if mode not in ("briefing", "alert"):
        raise ValueError("Invalid scheduled voice mode")
    if type(duration) is not int or not 1 <= duration <= 720:
        raise ValueError("Duration must be 1 to 720 minutes")
    if type(interval) is not int or not 1 <= interval <= 60:
        raise ValueError("Briefing interval must be 1 to 60 minutes")
    if type(threshold) is not int or not 1 <= threshold <= 60:
        raise ValueError("Alert threshold must be 1 to 60 minutes")
    return {"enabled": data["enabled"], "time": data["time"], "route_id": route_id,
            "direction": direction, "stop_id": stop_id,
            "closed_loop": data["closed_loop"], "voice_engine": engine,
            "voice_model": model, "voice_name": name, "voice_language": language,
            "voice_format": voice_format, "tracked_bus_id": tracked_bus_id.strip(),
            "mode": mode, "duration_minutes": duration,
            "briefing_interval_minutes": interval, "alert_threshold_minutes": threshold}


def cron_text(existing, schedule):
    lines = [line for line in existing.splitlines() if MARKER not in line]
    if schedule["enabled"]:
        hour, minute = map(int, schedule["time"].split(":"))
        directory = shlex.quote(str(Path(__file__).resolve().parent.parent))
        python = shlex.quote(sys.executable)
        runtime = f"/run/user/{os.getuid()}"
        command = (f"cd {directory} && XDG_RUNTIME_DIR={runtime} "
                   f"DBUS_SESSION_BUS_ADDRESS=unix:path={runtime}/bus "
                   f"{python} -m bus_tracker.scheduled_voice {MARKER}")
        lines.append(f"{minute} {hour} * * * {command}")
    return "\n".join(lines).rstrip("\n") + "\n"


def save_schedule(data):
    schedule = validate(data)
    with LOCK:
        listed = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
        if listed.returncode and "no crontab for" not in listed.stderr.lower():
            raise RuntimeError(listed.stderr.strip() or "Could not read crontab")
        updated = cron_text(listed.stdout, schedule)
        installed = subprocess.run(["crontab", "-"], input=updated, capture_output=True, text=True)
        if installed.returncode:
            raise RuntimeError(installed.stderr.strip() or "Could not install cron job")
        temporary = CONFIG.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(schedule, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(CONFIG)
    return schedule
