"""Render eSpeak or local OpenAI-compatible TTS speech as WAV."""

import ctypes
import ctypes.util
import io
import threading
import urllib.error
import urllib.request
import wave
import json

_lock = threading.Lock()
_library = None
_sample_rate = None

ESPEAK_VOICES = {
    "cmn": "Mandarin · standard",
    "cmn+f1": "Mandarin · female 1",
    "cmn+f2": "Mandarin · female 2",
    "cmn+f3": "Mandarin · female 3",
    "cmn+m1": "Mandarin · male 1",
    "cmn+m2": "Mandarin · male 2",
    "cmn+m3": "Mandarin · male 3",
    "cmn+whisper": "Mandarin · whisper",
    "en": "English · standard",
    "en+f1": "English · female 1",
    "en+f2": "English · female 2",
    "en+f3": "English · female 3",
    "en+m1": "English · male 1",
    "en+m2": "English · male 2",
    "en+m3": "English · male 3",
    "en+whisper": "English · whisper",
}
TTS_URL = "http://127.0.0.1:8001/v1/audio/speech"


def _engine():
    global _library, _sample_rate
    if _library is None:
        name = ctypes.util.find_library("espeak-ng")
        if not name:
            raise RuntimeError("Local Mandarin speech engine is unavailable (libespeak-ng)")
        library = ctypes.CDLL(name)
        library.espeak_Initialize.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
        library.espeak_Initialize.restype = ctypes.c_int
        library.espeak_SetVoiceByName.argtypes = [ctypes.c_char_p]
        library.espeak_SetVoiceByName.restype = ctypes.c_int
        library.espeak_SetSynthCallback.argtypes = [ctypes.c_void_p]
        library.espeak_Synth.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint,
                                       ctypes.c_int, ctypes.c_uint, ctypes.c_uint,
                                       ctypes.c_void_p, ctypes.c_void_p]
        library.espeak_Synth.restype = ctypes.c_int
        sample_rate = library.espeak_Initialize(2, 0, None, 0)  # synchronous PCM callback
        if sample_rate <= 0 or library.espeak_SetVoiceByName(b"cmn") != 0:
            raise RuntimeError("Mandarin speech voice could not be initialized")
        _library, _sample_rate = library, sample_rate
    return _library, _sample_rate


def render_wav(text, voice="cmn"):
    if not isinstance(text, str) or not text.strip() or len(text) > 1500:
        raise ValueError("Speech text must contain 1–1500 characters")
    if voice not in ESPEAK_VOICES:
        raise ValueError("Unknown eSpeak voice")
    with _lock:  # eSpeak uses process-wide voice and callback state
        library, sample_rate = _engine()
        if library.espeak_SetVoiceByName(voice.encode("ascii")) != 0:
            raise RuntimeError("Selected eSpeak voice is unavailable")
        chunks = []
        callback_type = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p)

        def collect(samples, count, _events):
            if samples and count > 0:
                chunks.append(ctypes.string_at(samples, count * 2))
            return 0

        callback = callback_type(collect)
        library.espeak_SetSynthCallback(callback)
        encoded = text.encode("utf-8") + b"\0"
        buffer = ctypes.create_string_buffer(encoded)
        result = library.espeak_Synth(buffer, len(encoded), 0, 1, 0, 1, None, None)
        if result != 0 or not chunks:
            raise RuntimeError("Mandarin speech rendering failed")
        output = io.BytesIO()
        with wave.open(output, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(sample_rate)
            wav.writeframes(b"".join(chunks))
        return output.getvalue()


def render_api_wav(text, model="tts-1", voice="alloy"):
    if not isinstance(text, str) or not text.strip() or len(text) > 1500:
        raise ValueError("Speech text must contain 1–1500 characters")
    for value, name in ((model, "model"), (voice, "voice")):
        if not isinstance(value, str) or not value.strip() or len(value) > 80:
            raise ValueError(f"Invalid TTS {name}")
    body = json.dumps({"model": model, "input": text, "voice": voice,
                       "response_format": "wav"}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(TTS_URL, body, {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            raw = response.read(20_000_001)
            if len(raw) > 20_000_000:
                raise RuntimeError("TTS audio is too large")
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError("Local TTS server on port 8001 is unavailable") from exc
    # Some streaming servers use RIFF/data lengths of 0xffffffff. Rebuild the
    # WAV header from the bytes actually returned so HTML audio and paplay agree.
    try:
        source = wave.open(io.BytesIO(raw), "rb")
        with source:
            if source.getnchannels() not in (1, 2) or source.getsampwidth() not in (1, 2, 4):
                raise ValueError("Unsupported WAV format")
            frames = source.readframes(10_000_000)
            if not frames:
                raise ValueError("Empty WAV response")
            output = io.BytesIO()
            with wave.open(output, "wb") as target:
                target.setnchannels(source.getnchannels())
                target.setsampwidth(source.getsampwidth())
                target.setframerate(source.getframerate())
                target.writeframes(frames)
            return output.getvalue()
    except (wave.Error, EOFError) as exc:
        raise RuntimeError("Local TTS server did not return valid WAV audio") from exc
