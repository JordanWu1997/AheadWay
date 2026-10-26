"""Public Funnel view must not expose owner controls."""

import unittest
import io
import json
from types import SimpleNamespace
from unittest.mock import Mock, patch

from . import server as server_module
from .server import Handler, PublicSpeechGate


class PublicServerTests(unittest.TestCase):
    def handler(self, path, public=True):
        handler = object.__new__(Handler)
        handler.path = path
        handler.server = SimpleNamespace(public_mode=public, public_host="pop-os.tail443eb6.ts.net")
        handler.reply = Mock()
        handler.headers = {"Content-Type": "application/json"}
        return handler

    def speech_request(self, data, origin="https://pop-os.tail443eb6.ts.net"):
        handler = self.handler("/bus/api/voice")
        body = json.dumps(data).encode()
        handler.headers.update({"Content-Length": str(len(body)), "Origin": origin})
        handler.rfile = io.BytesIO(body)
        return handler

    def test_public_page_works_at_bus_prefix(self):
        for path in ("/bus", "/bus/", "/"):
            with self.subTest(path=path):
                handler = self.handler(path)
                handler.do_GET()
                status, body, content_type = handler.reply.call_args.args
                self.assertEqual(status, 200)
                self.assertIn(b"BUS_TRACKER_PUBLIC = true", body)
                self.assertIn(b'<base href="/bus/">', body)
                self.assertIn(b'href="style.css"', body)
                self.assertIn(b'src="app.js"', body)
                self.assertIn("text/html", content_type)

    def test_route_catalog_and_route_specific_arrivals(self):
        handler = self.handler("/bus/api/routes")
        handler.do_GET()
        self.assertEqual([row["name"] for row in handler.reply.call_args.args[1]],
                         ["橘5", "908", "921"])
        with patch.object(server_module.CACHE, "snapshot", return_value={"routeId": 16585}) as snapshot:
            handler = self.handler("/bus/api/arrivals?route_id=16585&direction=0&stop_id=138594&closed_loop=1")
            handler.do_GET()
            self.assertEqual(handler.reply.call_args.args, (200, {"routeId": 16585}))
            snapshot.assert_called_once_with(138594, 0, True, 16585)
        with patch.object(server_module.CACHE, "snapshot", return_value={"routeId": 16585}) as snapshot:
            handler = self.handler("/bus/api/arrivals?route_id=16585&direction=0&stop_id=138594&closed_loop=1&fresh=1")
            handler.do_GET()
            self.assertEqual(handler.reply.call_args.args, (200, {"routeId": 16585}))
            snapshot.assert_called_once_with(138594, 0, True, 16585, refresh=True)

    def test_route_stops_mark_virtual_stops_unselectable(self):
        fake = [{"Id": 1, "routeId": 16585, "goBack": "0", "seqNo": 0,
                 "nameZh": "虛擬站不停靠", "latitude": "25", "longitude": "121"},
                {"Id": 2, "routeId": 16585, "goBack": "0", "seqNo": 1,
                 "nameZh": "捷運景安站(景平路)", "latitude": "25", "longitude": "121"}]
        with patch.object(server_module.CACHE, "stops", return_value=fake):
            handler = self.handler("/api/stops?route_id=16585")
            handler.do_GET()
            rows = handler.reply.call_args.args[1]
            self.assertFalse(rows[0]["selectable"])
            self.assertTrue(rows[1]["selectable"])

    def test_public_endpoints_are_read_only(self):
        handler = self.handler("/bus/api/schedule")
        handler.do_GET()
        self.assertEqual(handler.reply.call_args.args[0], 404)
        handler = self.handler("/bus/api/schedule")
        handler.do_POST()
        self.assertEqual(handler.reply.call_args.args[0], 403)
        handler = self.handler("/bus/api/voice")
        handler.do_POST()
        self.assertEqual(handler.reply.call_args.args[0], 403)

    def test_public_voice_can_use_api_or_espeak(self):
        with patch.object(server_module, "render_api_wav", return_value=b"api-wav") as api:
            handler = self.speech_request({"text": "橘五公車", "engine": "api",
                                           "model": "tts-1", "voice": "alloy"})
            handler.do_POST()
            self.assertEqual(handler.reply.call_args.args, (200, b"api-wav", "audio/wav"))
            api.assert_called_once_with("橘五公車", "tts-1", "alloy")
        with patch.object(server_module, "render_wav", return_value=b"espeak-wav") as espeak:
            handler = self.speech_request({"text": "Orange Five", "engine": "espeak", "voice": "en+f2"})
            handler.do_POST()
            self.assertEqual(handler.reply.call_args.args, (200, b"espeak-wav", "audio/wav"))
            espeak.assert_called_once_with("Orange Five", "en+f2")

    def test_public_voice_rejects_other_origins_models_and_long_text(self):
        bad_requests = [
            self.speech_request({"text": "橘五", "engine": "api"}, "https://other.example"),
            self.speech_request({"text": "橘五", "engine": "api", "model": "other"}),
            self.speech_request({"text": "橘五", "engine": "api", "voice": "other"}),
            self.speech_request({"text": "x" * 1001, "engine": "api"}),
        ]
        for handler in bad_requests:
            with self.subTest(path=handler.path, body=handler.rfile.getvalue()[:40]):
                handler.do_POST()
                self.assertIn(handler.reply.call_args.args[0], (400, 403))

    def test_public_voice_capacity_is_bounded(self):
        now = [0]
        gate = PublicSpeechGate(limit=2, period=60, concurrency=1, clock=lambda: now[0])
        self.assertTrue(gate.acquire())
        self.assertFalse(gate.acquire(), "only one synthesis may run at once")
        gate.release()
        self.assertTrue(gate.acquire())
        gate.release()
        self.assertFalse(gate.acquire(), "limit reached")
        now[0] = 61
        self.assertTrue(gate.acquire(), "window expired")
        gate.release()
        handler = self.speech_request({"text": "橘五", "engine": "api"})
        with patch.object(server_module.PUBLIC_SPEECH_GATE, "acquire", return_value=False), \
                patch.object(server_module, "render_api_wav") as synth:
            handler.do_POST()
            self.assertEqual(handler.reply.call_args.args[0], 429)
            synth.assert_not_called()

    def test_owner_page_keeps_schedule_controls(self):
        handler = self.handler("/", public=False)
        handler.do_GET()
        self.assertNotIn(b"BUS_TRACKER_PUBLIC = true", handler.reply.call_args.args[1])


if __name__ == "__main__":
    unittest.main()
