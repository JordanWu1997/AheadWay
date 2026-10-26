import io
import json
import struct
import unittest
from unittest.mock import patch
import wave

from .speech_audio import render_api_wav, render_wav


class AudioTests(unittest.TestCase):
    def test_espeak_variant_and_reject_unknown_voice(self):
        audio = render_wav("橘五公車。", "cmn+f2")
        with wave.open(io.BytesIO(audio)) as wav:
            self.assertGreater(wav.getnframes(), 0)
        with self.assertRaises(ValueError):
            render_wav("橘五公車。", "not-a-voice")
        english = render_wav("Orange Five bus.", "en+f2")
        with wave.open(io.BytesIO(english)) as wav:
            self.assertGreater(wav.getnframes(), 0)

    def test_api_request_and_streaming_wav_header_are_normalized(self):
        output = io.BytesIO()
        with wave.open(output, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(24000)
            wav.writeframes(b"\x00\x00" * 24000)
        raw = bytearray(output.getvalue())
        struct.pack_into("<I", raw, 4, 0xffffffff)
        struct.pack_into("<I", raw, 40, 0xffffffff)
        requests = []

        def answer(request, timeout):
            requests.append(json.loads(request.data))
            return io.BytesIO(raw)

        with patch("bus_tracker.speech_audio.urllib.request.urlopen", side_effect=answer):
            result = render_api_wav("橘五。", "tts-1", "alloy")
        self.assertEqual(requests[0], {"model": "tts-1", "input": "橘五。",
                                       "voice": "alloy", "response_format": "wav"})
        with wave.open(io.BytesIO(result)) as wav:
            self.assertEqual(wav.getnframes(), 24000)
            self.assertEqual(wav.getframerate(), 24000)


if __name__ == "__main__":
    unittest.main()
