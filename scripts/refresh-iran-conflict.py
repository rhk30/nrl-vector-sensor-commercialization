#!/usr/bin/env python3
"""RHKEARTH Iran conflict: attributed, strategic-level headline inventory."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET
import hashlib
import json
import re
import time

ROOT = Path("experimental-data")
OUTPUTS = [ROOT / "iran-conflict.json", Path("experimental/live-data/iran-conflict.json")]
NOW = datetime.now(timezone.utc)
# Search aggregators retrieve public reporting, not verified claims. No targeting data.
TOPICS = {
    "DIPLOMACY": '"Iran" ("United States" OR "US") (diplomacy OR talks OR sanctions)',
    "CONFLICT REPORTING": '"Iran" ("US" OR "United States") (conflict OR strikes OR ceasefire)',
    "HUMANITARIAN": '"Iran" (humanitarian OR civilian OR displacement OR hospitals)',
    "ENERGY & SHIPPING": '"Iran" (oil OR shipping OR energy OR Strait of Hormuz)',
}
AGGREGATOR = "https://news.google.com/rss/search?"
MAX_AGE = timedelta(days=7)
PATTERN = re.compile(r"\b(iran|iranian|tehran|hormuz|persian gulf)\b", re.I)

def utc_string(dt):
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def get_rss(query):
    url = AGGREGATOR + urlencode({"q": query + " when:7d", "hl": "en-US", "gl": "US", "ceid": "US:en"})
    req = Request(url, headers={"User-Agent": "RHKEARTH/1.0 (public research catalog)", "Accept": "application/rss+xml,application/xml,text/xml"})
    with urlopen(req, timeout=22) as response:
        raw = response.read(1_500_001)
    if len(raw) > 1_500_000:
        raise ValueError("feed too large")
    root = ET.fromstring(raw)
    items = []
    for entry in root.findall("./channel/item")[:75]:
        def field(name):
            return (entry.findtext(name) or "").strip()
        title = re.sub(r"\s+", " ", field("title"))[:250]
        url = field("link")
        if not title or not PATTERN.search(title) or not url.startswith("https://"):
            continue
        pub = field("pubDate")
        try:
            published = parsedate_to_datetime(pub).astimezone(timezone.utc)
        except (TypeError, ValueError, OverflowError):
            continue
        if published > NOW + timedelta(minutes=30) or NOW - published > MAX_AGE:
            continue
        publisher_node = entry.find("source")
        publisher = (publisher_node.text or "").strip()[:100] if publisher_node is not None else ""
        publisher_url = publisher_node.get("url", "") if publisher_node is not None else ""
        items.append({
            "id": hashlib.sha256((title.lower() + "|" + publisher.lower()).encode()).hexdigest()[:20],
            "headline": title, "publisher": publisher or "Publisher unavailable",
            "publisherUrl": publisher_url if publisher_url.startswith("https://") else None,
            "articleUrl": url, "publishedAt": utc_string(published),
            "retrievedAt": utc_string(NOW),
            "sourceType": "news-aggregation",
            "verification": "unverified-report", "claimsIndependentlyVerified": False,
        })
    return items

def load_old():
    for path in OUTPUTS:
        try:
            obj = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(obj.get("items"), list):
                return obj
        except (OSError, ValueError, TypeError):
            pass
    return {}

def main():
    previous = load_old()
    seen = {}
    source_health = {}
    for topic, query in TOPICS.items():
        try:
            rows = get_rss(query)
            for item in rows:
                if item["id"] not in seen:
                    seen[item["id"]] = {**item, "categories": [topic]}
                elif topic not in seen[item["id"]]["categories"]:
                    seen[item["id"]]["categories"].append(topic)
            source_health[topic] = {"status": "ok", "itemsFetched": len(rows)}
        except Exception as exc:
            source_health[topic] = {"status": "unavailable", "reason": type(exc).__name__}
        time.sleep(0.5)
    if seen:
        items = sorted(seen.values(), key=lambda r: r["publishedAt"], reverse=True)[:250]
        overall = "partial" if any(h["status"] != "ok" for h in source_health.values()) else "ok"
        newest = utc_string(NOW)
    else:
        # Never replace usable data with an empty or fictional 'live' feed.
        items = [x for x in previous.get("items", []) if isinstance(x, dict)]
        overall = "stale" if items else "unavailable"
        newest = previous.get("lastSuccessfulFetchAt")
    result = {
        "schemaVersion": 1,
        "monitor": "US–Iran conflict | strategic public reporting",
        "generatedAt": utc_string(NOW),
        "lastSuccessfulFetchAt": newest,
        "status": overall,
        "dataMode": "headline-aggregation-not-independent-verification",
        "coverage": ["diplomacy", "public conflict reporting", "humanitarian", "energy and shipping"],
        "limitations": "Public news aggregation, incomplete and possibly delayed. A headline is not a verified event. No precise real-time military locations, routes, or unit tracking.",
        "sources": source_health,
        "itemCount": len(items),
        "items": items,
    }
    for path in OUTPUTS:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"status": overall, "itemCount": len(items), "sources": source_health}))
if __name__ == "__main__":
    main()
