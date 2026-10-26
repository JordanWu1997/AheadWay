"""Small Web Push sender and subscription store (RFC 8291 / RFC 8292)."""

import base64
import hashlib
import hmac
import json
import os
import sqlite3
import threading
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


ROOT = Path(__file__).parent
DB_PATH = ROOT / "push_subscriptions.sqlite3"
KEY_PATH = ROOT / "push_vapid.pem"


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def unb64(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def public_bytes(key):
    return key.public_key().public_bytes(serialization.Encoding.X962,
                                         serialization.PublicFormat.UncompressedPoint)


def hkdf(salt, ikm, info, length):
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    return hmac.new(prk, info + b"\x01", hashlib.sha256).digest()[:length]


def valid_endpoint(endpoint):
    if not isinstance(endpoint, str) or len(endpoint) > 2048:
        return False
    url = urlparse(endpoint)
    host = (url.hostname or "").lower()
    allowed = host in {"fcm.googleapis.com", "fcm-xm.googleapis.com",
                       "updates.push.services.mozilla.com", "web.push.apple.com"}
    allowed |= host.endswith(".push.apple.com") and host.count(".") >= 3
    return (url.scheme == "https" and allowed and url.port in (None, 443) and
            not url.username and not url.password and bool(url.path) and
            not url.fragment)


class PushService:
    def __init__(self, host, db_path=DB_PATH, key_path=KEY_PATH):
        self.host = host
        self.db_path = db_path
        self.key_path = key_path
        self._tokens = {}
        self._token_lock = threading.Lock()
        if not key_path.exists():
            key = ec.generate_private_key(ec.SECP256R1())
            pem = key.private_bytes(serialization.Encoding.PEM,
                                    serialization.PrivateFormat.PKCS8,
                                    serialization.NoEncryption())
            try:
                fd = os.open(key_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
                with os.fdopen(fd, "wb") as file:
                    file.write(pem)
            except FileExistsError:
                pass
        self.key = serialization.load_pem_private_key(key_path.read_bytes(), password=None)
        with self.connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS subscriptions (
                endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
                route_id INTEGER NOT NULL, direction INTEGER NOT NULL, stop_id INTEGER NOT NULL,
                closed_loop INTEGER NOT NULL, walk_minutes INTEGER NOT NULL,
                last_key TEXT NOT NULL DEFAULT '', last_sent INTEGER NOT NULL DEFAULT 0)""")
        os.chmod(self.db_path, 0o600)

    def connect(self):
        db = sqlite3.connect(self.db_path, timeout=5)
        db.row_factory = sqlite3.Row
        return db

    def public_key(self):
        return b64(public_bytes(self.key))

    def save(self, data):
        sub = data.get("subscription")
        if not isinstance(sub, dict):
            raise ValueError("Subscription required")
        endpoint = sub.get("endpoint")
        if not valid_endpoint(endpoint):
            raise ValueError("Unsupported push endpoint")
        keys = sub.get("keys") or {}
        p256dh, auth = keys.get("p256dh"), keys.get("auth")
        try:
            client_key = unb64(p256dh)
            ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), client_key)
            if len(unb64(auth)) != 16:
                raise ValueError("Invalid push authentication key")
        except (TypeError, ValueError) as exc:
            raise ValueError("Invalid push subscription keys") from exc
        route_id = int(data["route_id"])
        direction = int(data["direction"])
        stop_id = int(data["stop_id"])
        walk = int(data["walk_minutes"])
        if direction not in (0, 1) or not 0 <= walk <= 60:
            raise ValueError("Invalid push settings")
        with self.connect() as db:
            count = db.execute("SELECT COUNT(*) FROM subscriptions").fetchone()[0]
            exists = db.execute("SELECT * FROM subscriptions WHERE endpoint=?", (endpoint,)).fetchone()
            if count >= 64 and not exists:
                raise ValueError("Notification capacity reached")
            same = exists and (exists["route_id"], exists["direction"], exists["stop_id"],
                               exists["closed_loop"], exists["walk_minutes"]) == (
                                   route_id, direction, stop_id, int(bool(data.get("closed_loop", True))), walk)
            last_key = exists["last_key"] if same else ""
            last_sent = exists["last_sent"] if same else 0
            db.execute("""INSERT INTO subscriptions
                (endpoint,p256dh,auth,route_id,direction,stop_id,closed_loop,walk_minutes,last_key,last_sent)
                VALUES (?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth,
                route_id=excluded.route_id,direction=excluded.direction,stop_id=excluded.stop_id,
                closed_loop=excluded.closed_loop,walk_minutes=excluded.walk_minutes,
                last_key=excluded.last_key,last_sent=excluded.last_sent""",
                (endpoint, p256dh, auth, route_id, direction, stop_id,
                 int(bool(data.get("closed_loop", True))), walk, last_key, last_sent))

    def remove(self, endpoint):
        with self.connect() as db:
            db.execute("DELETE FROM subscriptions WHERE endpoint=?", (endpoint,))

    def rows(self):
        with self.connect() as db:
            return [dict(row) for row in db.execute("SELECT * FROM subscriptions")]

    def state(self, endpoint, key, sent=None):
        with self.connect() as db:
            if sent is None:
                db.execute("UPDATE subscriptions SET last_key=? WHERE endpoint=?", (key, endpoint))
            else:
                db.execute("UPDATE subscriptions SET last_key=?,last_sent=? WHERE endpoint=?",
                           (key, sent, endpoint))

    def token_for(self, audience):
        with self._token_lock:
            cached = self._tokens.get(audience)
            if cached and cached[1] > time.time() + 300:
                return cached[0]
            expiry = int(time.time()) + 3600
            header = b64(b'{"typ":"JWT","alg":"ES256"}')
            claims = b64(json.dumps({"aud": audience, "exp": expiry,
                                     "sub": f"https://{self.host}/bus/"}, separators=(",", ":")).encode())
            signing = f"{header}.{claims}".encode()
            der = self.key.sign(signing, ec.ECDSA(hashes.SHA256()))
            r, s = utils.decode_dss_signature(der)
            token = f"{header}.{claims}.{b64(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))}"
            self._tokens[audience] = (token, expiry)
            return token

    def send(self, row, title, body):
        endpoint = row["endpoint"]
        if not valid_endpoint(endpoint):
            raise ValueError("Unsupported push endpoint")
        url = urlparse(endpoint)
        audience = f"{url.scheme}://{url.netloc}"
        token = self.token_for(audience)
        client_public = unb64(row["p256dh"])
        client_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), client_public)
        ephemeral = ec.generate_private_key(ec.SECP256R1())
        server_public = public_bytes(ephemeral)
        shared = ephemeral.exchange(ec.ECDH(), client_key)
        ikm = hkdf(unb64(row["auth"]), shared,
                   b"WebPush: info\x00" + client_public + server_public, 32)
        salt = os.urandom(16)
        cek = hkdf(salt, ikm, b"Content-Encoding: aes128gcm\x00", 16)
        nonce = hkdf(salt, ikm, b"Content-Encoding: nonce\x00", 12)
        payload = json.dumps({"title": title, "body": body}, ensure_ascii=False).encode() + b"\x02"
        encrypted = AESGCM(cek).encrypt(nonce, payload, None)
        content = salt + (4096).to_bytes(4, "big") + bytes([len(server_public)]) + server_public + encrypted
        response = requests.post(endpoint, data=content, timeout=8, allow_redirects=False,
                                 headers={"Authorization": f"vapid t={token}, k={self.public_key()}",
                                          "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream",
                                          "TTL": "120", "Urgency": "high"})
        if response.status_code in (404, 410):
            self.remove(endpoint)
            return False
        response.raise_for_status()
        return True


def alert_candidate(snapshot, walk):
    """Return the approaching bus to notify for, or None when there is time."""
    now = time.time()
    fetched = snapshot.get("feedFetchedAt") or {}
    if any(not fetched.get(name) for name in ("BusData", "EstimateTime", "BusEvent")) or \
            any(now - datetime.fromisoformat(stamp).timestamp() > 90 for stamp in fetched.values() if stamp):
        return None
    needed = walk * 60 + 120
    eta = snapshot.get("officialEtaSeconds")
    candidates = [v for v in snapshot.get("vehicles", []) if not v.get("atStop") and
                  not v.get("crossDirection") and
                  v.get("dataAgeSeconds", 999) <= 90 and v.get("confidence") != "low" and
                  walk * 60 < v.get("estimatedEtaWindowSeconds", [0])[0] <= needed]
    if candidates:
        bus = min(candidates, key=lambda v: v["estimatedEtaSeconds"])
        return bus["id"], f"{bus['id']} 推估接近 {snapshot['stop']['name']}，建議現在出發。"
    if eta is not None and walk * 60 < eta <= needed:
        return "official", f"{snapshot['stop']['name']} 官方預估約 {max(1, eta // 60)} 分鐘後到站，建議現在出發。"
    return None


def push_loop(service, snapshot_for):
    while True:
        time.sleep(30)
        snapshots = {}
        for row in service.rows():
            key = (row["route_id"], row["direction"], row["stop_id"], row["closed_loop"])
            try:
                if key not in snapshots:
                    snapshots[key] = snapshot_for(*key)
                snapshot = snapshots[key]
                candidate = alert_candidate(snapshot, row["walk_minutes"])
                if not candidate:
                    continue
                bus_key, body = candidate
                if bus_key == row["last_key"] and time.time() - row["last_sent"] < 900:
                    continue
                if service.send(row, f"{snapshot['route']} · 該出發了", body):
                    service.state(row["endpoint"], bus_key, int(time.time()))
            except Exception as exc:
                print(f"Push update failed: {exc}", flush=True)
