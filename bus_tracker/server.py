"""Local owner dashboard and public multi-route bus viewer."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import argparse
from collections import deque
import json
import threading
import time

from .tracker import ROUTE_ID, FeedCache, ordered_stops, route_info
from .catalog import search_routes, selected_routes
from .speech_audio import ESPEAK_VOICES, render_wav, render_api_wav
from .schedule import read_schedule, save_schedule

STATIC = Path(__file__).parent / "static"
CACHE = FeedCache()
PUBLIC_TTS_MODELS = {"tts-1"}
PUBLIC_TTS_VOICES = {"anne", "alloy"}


class PublicSpeechGate:
    """Bound global speech work when an anonymous Funnel is enabled."""

    def __init__(self, limit=60, period=600, concurrency=2, clock=time.monotonic):
        self.limit = limit
        self.period = period
        self.clock = clock
        self.recent = deque()
        self.lock = threading.Lock()
        self.slots = threading.BoundedSemaphore(concurrency)

    def acquire(self):
        with self.lock:
            now = self.clock()
            while self.recent and self.recent[0] <= now - self.period:
                self.recent.popleft()
            if len(self.recent) >= self.limit or not self.slots.acquire(blocking=False):
                return False
            self.recent.append(now)
            return True

    def release(self):
        self.slots.release()


PUBLIC_SPEECH_GATE = PublicSpeechGate()
PUBLIC_PUSH_GATE = PublicSpeechGate(limit=40, period=600, concurrency=4)


class Handler(BaseHTTPRequestHandler):
    @property
    def public_mode(self):
        return getattr(self.server, "public_mode", False)

    def local_path(self):
        """Accept either Funnel's stripped path or a preserved /bus prefix."""
        path = urlparse(self.path).path
        if path == "/bus":
            return "/"
        return path[4:] or "/" if path.startswith("/bus/") else path

    def reply(self, status, payload, content_type="application/json; charset=utf-8", cache_control="no-store"):
        body = json.dumps(payload, ensure_ascii=False).encode() if isinstance(payload, (dict, list)) else payload
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", cache_control)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        path = self.local_path()
        try:
            if path == "/api/routes":
                args = parse_qs(url.query)
                raw_ids = args.get("ids", [])
                if raw_ids:
                    parts = raw_ids[0].split(",")
                    if len(parts) > 40 or any(not part.isdecimal() for part in parts):
                        raise ValueError("Invalid route IDs")
                    return self.reply(200, selected_routes([int(part) for part in parts]))
                return self.reply(200, selected_routes())
            if path == "/api/catalog":
                args = parse_qs(url.query)
                return self.reply(200, search_routes(args.get("q", [""])[0]))
            if path == "/api/stops":
                args = parse_qs(url.query)
                route_id = int(args.get("route_id", [ROUTE_ID])[0])
                route_info(route_id)
                stops = [{"id": s["Id"], "name": s["nameZh"], "nameEn": s.get("nameEn"),
                          "direction": direction,
                          "sequence": int(s["seqNo"]),
                          "selectable": not any(tag in s["nameZh"] for tag in ("虛擬站不停靠", "暫時裁撤")),
                          "lat": float(s["latitude"]), "lon": float(s["longitude"])}
                         for direction in (0, 1)
                         for s in ordered_stops(CACHE.stops(route_id), direction, route_id)]
                return self.reply(200, stops)
            if path == "/api/schedule" and not self.public_mode:
                return self.reply(200, read_schedule())
            if path == "/api/push-key":
                service = getattr(self.server, "push_service", None)
                return self.reply(200, {"key": service.public_key()} if service else {"key": None})
            if path == "/api/arrivals":
                args = parse_qs(url.query)
                route_id = int(args.get("route_id", [ROUTE_ID])[0])
                route_info(route_id)
                stop_id = int(args["stop_id"][0])
                direction = int(args["direction"][0])
                if direction not in (0, 1):
                    raise ValueError("Direction must be 0 or 1")
                loop_value = args.get("closed_loop", ["1"])[0]
                if loop_value not in ("0", "1"):
                    raise ValueError("closed_loop must be 0 or 1")
                fresh_value = args.get("fresh", ["0"])[0]
                if fresh_value not in ("0", "1"):
                    raise ValueError("fresh must be 0 or 1")
                if fresh_value == "1":
                    return self.reply(200, CACHE.snapshot(stop_id, direction, loop_value == "1",
                                                          route_id, refresh=True))
                return self.reply(200, CACHE.snapshot(stop_id, direction, loop_value == "1", route_id))
            if path in ("/", "/app.js", "/style.css", "/sw.js", "/manifest.webmanifest", "/icon.svg",
                        "/LOGO.jpeg", "/BANNER.jpeg",
                        "/technical-report.html", "/technical-report.md", "/technical-report.pdf", "/technical-report.css"):
                file = STATIC / ("index.html" if path == "/" else path.lstrip("/"))
                content_type = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
                                ".css": "text/css; charset=utf-8", ".md": "text/markdown; charset=utf-8",
                                ".webmanifest": "application/manifest+json; charset=utf-8",
                                ".svg": "image/svg+xml; charset=utf-8", ".pdf": "application/pdf",
                                ".jpeg": "image/jpeg"}[file.suffix]
                body = file.read_bytes()
                if path == "/" and self.public_mode:
                    body = body.replace(b'<head>', b'<head>\n  <base href="/bus/">')
                    body = body.replace(b'<script src="app.js"></script>',
                                        b'<script>window.BUS_TRACKER_PUBLIC = true;</script>\n'
                                        b'  <script src="app.js"></script>')
                if file.suffix == ".jpeg":
                    return self.reply(200, body, content_type, cache_control="public, max-age=86400")
                return self.reply(200, body, content_type)
            self.reply(404, {"error": "Not found"})
        except (KeyError, IndexError, ValueError) as exc:
            self.reply(400, {"error": str(exc)})
        except Exception as exc:
            self.log_error("feed error: %s", exc)
            self.reply(503, {"error": "Bus data is temporarily unavailable. Please retry."})

    def do_POST(self):
        path = self.local_path()
        if self.public_mode and path not in ("/api/voice", "/api/push-subscription"):
            return self.reply(403, {"error": "This action is unavailable in the public view"})
        if path not in ("/api/voice", "/api/schedule", "/api/push-subscription"):
            return self.reply(404, {"error": "Not found"})
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json":
            return self.reply(415, {"error": "JSON request required"})
        origin = self.headers.get("Origin")
        if self.public_mode:
            if origin != f"https://{self.server.public_host}":
                return self.reply(403, {"error": "Public actions require the HTTPS bus page"})
        elif origin and origin != f"http://{self.headers.get('Host')}":
            return self.reply(403, {"error": "Same-origin request required"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 7000:
                raise ValueError("Speech request is too large or empty")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("JSON object required")
            if path == "/api/push-subscription":
                service = getattr(self.server, "push_service", None)
                if not service:
                    return self.reply(503, {"error": "Phone notifications are unavailable"})
                if self.public_mode and not PUBLIC_PUSH_GATE.acquire():
                    return self.reply(429, {"error": "Notification requests are busy; retry later"})
                try:
                    if data.get("action") == "remove":
                        endpoint = (data.get("subscription") or {}).get("endpoint")
                        if not isinstance(endpoint, str) or len(endpoint) > 2048:
                            raise ValueError("Invalid subscription")
                        applied = service.remove(endpoint, data.get("revision", 0))
                    elif data.get("action") == "save":
                        route_id = int(data["route_id"])
                        direction = int(data["direction"])
                        stop_id = int(data["stop_id"])
                        route_info(route_id)
                        if direction not in (0, 1) or stop_id not in {int(s["Id"]) for s in
                                ordered_stops(CACHE.stops(route_id), direction, route_id)
                                if not any(tag in s["nameZh"] for tag in ("虛擬站不停靠", "暫時裁撤"))}:
                            raise ValueError("Selected stop is not a boarding stop")
                        applied = service.save(data)
                    else:
                        raise ValueError("Unknown subscription action")
                    return self.reply(200, {"ok": True, "applied": applied})
                finally:
                    if self.public_mode:
                        PUBLIC_PUSH_GATE.release()
            if path == "/api/schedule":
                route_id = data.get("route_id", ROUTE_ID)
                route_info(route_id)
                stop_ids = {int(s["Id"]) for s in ordered_stops(
                    CACHE.stops(route_id), int(data["direction"]), route_id)
                    if not any(tag in s["nameZh"] for tag in ("虛擬站不停靠", "暫時裁撤"))}
                if int(data["stop_id"]) not in stop_ids:
                    raise ValueError("Selected stop is not a boarding stop on this route")
                return self.reply(200, save_schedule(data))
            engine = data.get("engine", "espeak")
            if self.public_mode:
                speech_text = data.get("text")
                if not isinstance(speech_text, str) or not speech_text.strip() or len(speech_text) > 1000:
                    raise ValueError("Public speech text must contain 1–1000 characters")
                if engine == "api" and (data.get("model", "tts-1") not in PUBLIC_TTS_MODELS or
                                        data.get("voice", "anne") not in PUBLIC_TTS_VOICES):
                    raise ValueError("Public TTS supports only tts-1 / anne or alloy")
                if engine == "espeak" and data.get("voice", "cmn") not in ESPEAK_VOICES:
                    raise ValueError("Unknown eSpeak voice")
                if engine not in ("api", "espeak"):
                    raise ValueError("Unknown voice engine")
                if not PUBLIC_SPEECH_GATE.acquire():
                    return self.reply(429, {"error": "Speech service is busy; retry later"})
            try:
                if engine == "api":
                    audio = render_api_wav(data["text"], data.get("model", "tts-1"), data.get("voice", "anne"))
                elif engine == "espeak":
                    audio = render_wav(data["text"], data.get("voice", "cmn"))
                else:
                    raise ValueError("Unknown voice engine")
            finally:
                if self.public_mode:
                    PUBLIC_SPEECH_GATE.release()
            return self.reply(200, audio, "audio/wav")
        except (KeyError, ValueError, TypeError, json.JSONDecodeError) as exc:
            self.reply(400, {"error": str(exc)})
        except Exception as exc:
            self.log_error("post error: %s", exc)
            self.reply(503, {"error": "Could not save cron schedule." if path == "/api/schedule" else str(exc)})


def main():
    parser = argparse.ArgumentParser(description="Local bus tracker")
    parser.add_argument("port", nargs="?", type=int, default=8000)
    parser.add_argument("--public", action="store_true", help="read-only viewer for a public tunnel")
    parser.add_argument("--public-host", help="expected Funnel HTTPS hostname for public speech")
    args = parser.parse_args()
    if args.public and not args.public_host:
        parser.error("--public requires --public-host for speech origin checks")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    server.public_mode = args.public
    server.public_host = args.public_host
    server.push_service = None
    if args.public:
        from .push import PushService, push_loop
        server.push_service = PushService(args.public_host)
        threading.Thread(target=push_loop, args=(server.push_service,
            lambda route_id, direction, stop_id, closed_loop:
                CACHE.snapshot(stop_id, direction, bool(closed_loop), route_id)), daemon=True).start()
    print(f"Open http://127.0.0.1:{args.port} ({'public viewer' if args.public else 'local owner'})")
    server.serve_forever()


if __name__ == "__main__":
    main()
