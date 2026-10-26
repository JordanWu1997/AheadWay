import unittest
from unittest.mock import patch
from types import SimpleNamespace
from tempfile import TemporaryDirectory
from pathlib import Path

from . import schedule as schedule_module
from .schedule import MARKER, cron_text, validate
from .scheduled_voice import report_text
from . import scheduled_voice


class ScheduleTests(unittest.TestCase):
    def test_existing_schedule_keeps_verbose_format_until_saved_again(self):
        with TemporaryDirectory() as directory:
            config = Path(directory) / "schedule.json"
            config.write_text('{"enabled": true, "time": "07:30"}', encoding="utf-8")
            with patch.object(schedule_module, "CONFIG", config):
                self.assertEqual(schedule_module.read_schedule()["voice_format"], "verbose")
                config.write_text('{"enabled": true, "voice_format": "short"}', encoding="utf-8")
                self.assertEqual(schedule_module.read_schedule()["voice_format"], "short")

    def test_cron_preserves_other_jobs_and_replaces_only_ours(self):
        settings = validate({"enabled": True, "time": "07:45", "direction": 0,
                             "stop_id": 122402, "closed_loop": True})
        existing = "# existing jobs\n*/30 * * * * some-other-job\n5 6 * * * old-command " + MARKER + "\n"
        text = cron_text(existing, settings)
        self.assertIn("*/30 * * * * some-other-job", text)
        self.assertNotIn("old-command", text)
        self.assertIn("45 7 * * *", text)
        self.assertEqual(text.count(MARKER), 1)
        settings["enabled"] = False
        removed = cron_text(text, settings)
        self.assertNotIn(MARKER, removed)
        self.assertIn("some-other-job", removed)

    def test_rejects_invalid_time_and_stop(self):
        data = {"enabled": True, "time": "25:00", "direction": 0,
                "stop_id": 122402, "closed_loop": True}
        with self.assertRaises(ValueError):
            validate(data)
        data["time"] = "07:30"
        data["stop_id"] = True
        with self.assertRaises(ValueError):
            validate(data)
        data["stop_id"] = 122402
        data["duration_minutes"] = 0
        with self.assertRaises(ValueError):
            validate(data)

    def test_scheduled_report_uses_official_eta(self):
        snapshot = {"officialEtaSeconds": 360,
                    "vehicles": [{"id": "bus-one", "estimatedEtaSeconds": 420},
                                 {"id": "bus-two", "estimatedEtaSeconds": 840}],
                    "directionLabel": "往捷運景安站", "stop": {"name": "捷運景安站",
                    "nameEn": "MRT Jingan Sta.(Jingping Rd.)"}}
        text = report_text(snapshot)
        self.assertIn("約6分鐘", text)
        self.assertIn("2輛車", text)
        self.assertIn("bus-one推估約7分鐘", text)
        self.assertIn("bus-two推估約14分鐘", text)
        english = report_text(snapshot, "en")
        self.assertIn("Jingan Station", english)
        self.assertIn("6 minutes", english)
        self.assertIn("bus-one, is estimated in about 7 minutes", english)
        self.assertIn("bus-two, is estimated in about 14 minutes", english)
        self.assertNotIn("捷運", english)
        snapshot["vehicles"][1]["estimatedEtaWindowSeconds"] = [720, 960]
        self.assertIn("bus-two推估約12到16分鐘", report_text(snapshot))
        self.assertIn("bus-two, is estimated in about 12 to 16 minutes", report_text(snapshot, "en"))

    def test_scheduled_report_flags_conflicting_official_status(self):
        snapshot = {"officialEtaSeconds": None, "officialStatus": "今日未營運",
                    "vehicles": [{"id": "bus-one", "estimatedEtaSeconds": 420}],
                    "directionLabel": "往捷運景安站", "stop": {"name": "捷運景安站", "nameEn": "Jingan Station"}}
        self.assertIn("資料不一致", report_text(snapshot))
        self.assertIn("sources disagree", report_text(snapshot, "en"))

    def test_scheduled_report_marks_next_circuit_as_conditional(self):
        snapshot = {"officialEtaSeconds": None, "officialStatus": "今日未營運",
                    "vehicles": [{"id": "returning", "estimatedEtaSeconds": 3600,
                                  "crossDirection": True}],
                    "directionLabel": "往捷運景安站", "stop": {"name": "中途站", "nameEn": "Middle Stop"}}
        chinese = report_text(snapshot)
        self.assertIn("若在終點折返續行，下一輪推估", chinese)
        self.assertNotIn("資料不一致", chinese)
        english = report_text(snapshot, "en")
        self.assertIn("If buses on the other direction continue service after the terminal", english)
        self.assertNotIn("sources disagree", english)

    def test_short_scheduled_report_groups_next_circuit_without_plates(self):
        snapshot = {"officialEtaSeconds": 360, "route": "橘5",
                    "vehicles": [{"id": "direct-plate", "estimatedEtaSeconds": 420,
                                  "estimatedEtaWindowSeconds": [330, 540], "nextStop": "前一站"},
                                 {"id": "loop-one", "estimatedEtaSeconds": 3000,
                                  "crossDirection": True, "nextStop": "返程站一"},
                                 {"id": "loop-two", "estimatedEtaSeconds": 4200,
                                  "crossDirection": True, "nextStop": "返程站二"}],
                    "directionLabel": "往捷運景安站", "directionLabelEn": "toward Jingan MRT Station",
                    "stop": {"name": "捷運景安站", "nameEn": "Jingan Station"}}
        chinese = report_text(snapshot, "zh", "short")
        self.assertIn("第1輛推估約5到9分鐘", chinese)
        self.assertNotIn("官方預估下一班", chinese)
        self.assertEqual(chinese.count("若在終點折返續行"), 1)
        for omitted in ("direct-plate", "loop-one", "loop-two", "前一站", "返程站"):
            self.assertNotIn(omitted, chinese)
        english = report_text(snapshot, "en", "short")
        self.assertNotIn("official next bus", english)
        self.assertEqual(english.count("continue service after the terminal"), 1)
        self.assertNotIn("direct-plate", english)
        self.assertNotIn("loop-one", english)
        self.assertNotIn("返程", english)

    def test_custom_alert_threshold_is_saved_and_bounded(self):
        data = {"enabled": True, "time": "07:45", "direction": 0,
                "stop_id": 122402, "closed_loop": True, "mode": "alert",
                "alert_threshold_minutes": 12}
        self.assertEqual(validate(data)["alert_threshold_minutes"], 12)
        data["alert_threshold_minutes"] = 10
        self.assertEqual(validate(data)["alert_threshold_minutes"], 10)
        for invalid in (0, 61, 2.5, True):
            with self.subTest(invalid=invalid):
                data["alert_threshold_minutes"] = invalid
                with self.assertRaises(ValueError):
                    validate(data)

    def test_language_matches_espeak_voice(self):
        data = {"enabled": True, "time": "07:45", "direction": 0,
                "stop_id": 122402, "closed_loop": True, "voice_language": "en",
                "voice_engine": "espeak", "voice_name": "en+f2"}
        self.assertEqual(validate(data)["voice_language"], "en")
        data["voice_name"] = "cmn+f2"
        with self.assertRaises(ValueError):
            validate(data)

    def test_save_installs_cron_and_persists_matching_settings(self):
        data = {"enabled": True, "time": "07:45", "direction": 0,
                "stop_id": 122402, "closed_loop": True}
        calls = []

        def run(args, **kwargs):
            calls.append((args, kwargs))
            return SimpleNamespace(returncode=0, stdout="10 * * * * other-job\n", stderr="")

        with TemporaryDirectory() as directory, patch.object(schedule_module, "CONFIG", Path(directory) / "schedule.json"), \
                patch.object(schedule_module.subprocess, "run", side_effect=run):
            saved = schedule_module.save_schedule(data)
            self.assertEqual(schedule_module.read_schedule(), saved)
        self.assertEqual(calls[0][0], ["crontab", "-l"])
        self.assertEqual(calls[1][0], ["crontab", "-"])
        self.assertIn("other-job", calls[1][1]["input"])
        self.assertIn("45 7 * * *", calls[1][1]["input"])

    def test_cron_uses_selected_api_voice(self):
        settings = {"enabled": True, "direction": 0, "stop_id": 122402,
                    "closed_loop": True, "voice_engine": "api",
                    "voice_model": "tts-1", "voice_name": "alloy", "voice_language": "en"}
        snapshot = {"officialEtaSeconds": 360, "vehicles": [],
                    "directionLabel": "往捷運景安站", "stop": {"name": "捷運景安站",
                    "nameEn": "MRT Jingan Sta.(Jingping Rd.)"}}
        played = []

        def playback(args, **kwargs):
            played.append(Path(args[1]).read_bytes())
            return SimpleNamespace(returncode=0)

        with patch.object(scheduled_voice, "render_api_wav", return_value=b"wave") as synth, \
                patch.object(scheduled_voice.subprocess, "run", side_effect=playback):
            scheduled_voice.play_report(report_text(snapshot, "en"), settings)
        self.assertEqual(synth.call_args.args[1:], ("tts-1", "alloy"))
        self.assertIn("Orange Five", synth.call_args.args[0])
        self.assertEqual(played, [b"wave"])

    def test_briefing_session_repeats_until_duration(self):
        settings = validate({"enabled": True, "time": "07:30", "direction": 0,
                             "stop_id": 122402, "closed_loop": True,
                             "duration_minutes": 3, "briefing_interval_minutes": 1})
        now = [0]
        snapshot = {"officialEtaSeconds": 360, "vehicles": [],
                    "directionLabel": "往捷運景安站", "stop": {"name": "捷運景安站"}}
        spoken = []
        cache = SimpleNamespace(snapshot=lambda *args: snapshot)
        scheduled_voice.run_session(settings, cache=cache, speak=lambda text: spoken.append((now[0], text)),
                                    clock=lambda: now[0], sleep=lambda seconds: now.__setitem__(0, now[0] + seconds),
                                    current_settings=lambda: settings)
        self.assertEqual([item[0] for item in spoken], [0, 60, 120])

    def test_alert_session_announces_each_bus_once(self):
        settings = validate({"enabled": True, "time": "07:30", "direction": 0,
                             "stop_id": 122402, "closed_loop": True,
                             "duration_minutes": 2, "mode": "alert", "voice_format": "verbose"})
        now = [0]
        snapshot = {"officialEtaSeconds": 600, "vehicles": [],
                    "directionLabel": "往捷運景安站", "stop": {"name": "捷運景安站"}}
        def fetch(*args):
            snapshot["vehicles"] = ([{"id": "first", "estimatedEtaSeconds": 240}] if now[0] >= 30 else []) + \
                                   ([{"id": "second", "estimatedEtaSeconds": 180}] if now[0] >= 90 else [])
            return snapshot
        spoken = []
        scheduled_voice.run_session(settings, cache=SimpleNamespace(snapshot=fetch), speak=spoken.append,
                                    clock=lambda: now[0], sleep=lambda seconds: now.__setitem__(0, now[0] + seconds),
                                    current_settings=lambda: settings)
        self.assertEqual(sum("first" in text for text in spoken), 1)
        self.assertEqual(sum("second" in text for text in spoken), 1)


if __name__ == "__main__":
    unittest.main()
