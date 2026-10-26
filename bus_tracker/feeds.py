"""Official municipal feeds sharing the Greater Taipei BusInfo schema."""

import gzip
import json
from urllib.request import Request, urlopen

FEED_BASES = {
    "new-taipei": "https://tcgbusfs.blob.core.windows.net/ntpcbus/Get%s.gz",
    "taipei": "https://tcgbusfs.blob.core.windows.net/blobbus/Get%s.gz",
}
FEED_NAMES = frozenset({"Route", "Stop", "BusData", "BusEvent", "EstimateTime"})


def fetch_feed(name: str, feed: str = "new-taipei") -> dict:
    if name not in FEED_NAMES:
        raise ValueError("Unknown feed")
    if feed not in FEED_BASES:
        raise ValueError("Unknown bus feed")
    request = Request(FEED_BASES[feed] % name, headers={"User-Agent": "BusTracker/0.2"})
    with urlopen(request, timeout=15) as response:
        return json.loads(gzip.decompress(response.read()))
