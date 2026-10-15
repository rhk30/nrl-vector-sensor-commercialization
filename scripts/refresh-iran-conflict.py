#!/usr/bin/env python3
"""RHKEARTH public U.S.–Iran reporting index. No inferred events or asset locations."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET
import hashlib
import json
import re

ROOT = Path("experimental-data")
OUTPUTS = [ROOT / "iran-conflict.json", Path("experimental/live-data/iran-conflict.json")]
NOW = datetime.now(timezone.utc)
WINDOW = timedelta(days=7)
TOPICS = {
    "DIPLOMACY": '"Iran" ("United States" OR "US") (diplomacy OR talks OR sanctions)',
    "CONFLICT REPORTING": '"Iran" ("US" OR "United States") (conflict OR strikes OR ceasefire)',
    "HUMANITARIAN": '"Iran" (humanitarian OR civilian OR displacement OR hospitals)',
    "ENERGY & SHIPPING": '"Iran" (oil OR shipping OR energy OR Strait of Hormuz)',
}
IRAN = re.compile(r"\b(iran|iranian|tehran|hormuz|persian gulf)\b", re.I)
GOOGLE = "https://news.google.com/rss/search?"
GDELT = "https://api.gdeltproject.org/api/v2/doc/doc?"
USER_AGENT = "RHKEARTH/2.0 (public research catalog; no asset tracking)"

def iso(dt):
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def get(url, accept):
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with urlopen(req, timeout=25) as res:
        payload = res.read(1_500_001)
    if len(payload) > 1_500_000:
        raise ValueError("response-too-large")
    return payload

def valid_time(dt):
    return NOW - WINDOW <= dt <= NOW + timedelta(minutes=30)

def source_domain(url):
    try:
        host = urlparse(url).hostname or ""
        return host.lower().removeprefix("www.")[:120]
    except ValueError:
        return ""

def item_id(title, publisher, link):
    # Do not collapse unrelated incidents merely because headlines share words.
    key = re.sub(r"\s+", " ", title.lower()).strip() + "|" + publisher.lower().strip()
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:20]

def rss_reports(topic, query):
    url = GOOGLE + urlencode({"q": query + " when:7d", "hl": "en-US", "gl": "US", "ceid": "US:en"})
    root = ET.fromstring(get(url, "application/rss+xml,application/xml,text/xml"))
    output = []
    for node in root.findall("./channel/item")[:75]:
        def field(k):
            return (node.findtext(k) or "").strip()
        headline = re.sub(r"\s+", " ", field("title"))[:250]
        link = field("link")
        if not headline or not IRAN.search(headline) or not link.startswith("https://"):
            continue
        try:
            published = parsedate_to_datetime(field("pubDate")).astimezone(timezone.utc)
        except (TypeError, ValueError, OverflowError):
            continue
        if not valid_time(published):
            continue
        source_node = node.find("source")
        publisher = ((source_node.text or "").strip() if source_node is not None else "")[:100] or "Unknown publisher"
        publisher_url = (source_node.get("url") or "") if source_node is not None else ""
        output.append({
            "id": item_id(headline, publisher, link),
            "headline": headline, "publisher": publisher, "publisherUrl": publisher_url if publisher_url.startswith("https://") else None,
            "sourceDomain": source_domain(publisher_url), "articleUrl": link,
            "publishedAt": iso(published), "indexedAt": None, "observedAt": iso(published),
            "timestampBasis": "publisher-date", "retrievedAt": iso(NOW),
            "sourceType": "google-news-rss", "verification": "unverified-report",
            "claimsIndependentlyVerified": False, "categories": [topic],
        })
    return output

def gdelt_reports():
    # GDELT DOC is an independent discovery INDEX, not independent verification.
    params = {
        "query": '"Iran" "United States"',
        "mode": "artlist", "format": "json", "maxrecords": "75",
        "timespan": "1w", "sort": "datedesc",
    }
    raw = get(GDELT + urlencode(params), "application/json")
    # GDELT may return an English error with HTTP 200; reject it explicitly.
    try:
        data = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as ex:
        raise ValueError("gdelt-non-json-response") from ex
    if not isinstance(data, dict) or not isinstance(data.get("articles"), list):
        raise ValueError("gdelt-invalid-schema")
    output = []
    for row in data["articles"][:75]:
        if not isinstance(row, dict):
            continue
        title = re.sub(r"\s+", " ", str(row.get("title") or "")).strip()[:250]
        url = str(row.get("url") or "")
        if not title or not IRAN.search(title) or not url.startswith("https://"):
            continue
        stamp = str(row.get("seendate") or "")
        try:
            seen = datetime.strptime(stamp, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        except ValueError:
            try:
                seen = datetime.strptime(stamp, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        if not valid_time(seen):
            continue
        domain = source_domain(url)
        output.append({
            "id": item_id(title, domain, url),
            "headline": title, "publisher": domain or "Unknown domain",
            "publisherUrl": None, "sourceDomain": domain, "articleUrl": url,
            "publishedAt": None, "indexedAt": iso(seen), "observedAt": iso(seen),
            "timestampBasis": "gdelt-first-seen-not-publication", "retrievedAt": iso(NOW),
            "sourceType": "gdelt-doc-index", "verification": "unverified-report",
            "claimsIndependentlyVerified": False, "categories": ["REGIONAL COVERAGE"],
        })
    return output

def old_snapshot():
    for path in OUTPUTS:
        try:
            val = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(val.get("items"), list):
                return val
        except (OSError, ValueError, TypeError):
            continue
    return {}

def collect(rss_fetch=rss_reports, gdelt_fetch=gdelt_reports, previous=None):
    previous = old_snapshot() if previous is None else previous
    results = {}
    status = {}
    for topic, query in TOPICS.items():
        key = "Google News / " + topic
        try:
            rows = rss_fetch(topic, query)
            status[key] = {"status": "ok", "itemsFetched": len(rows), "provider": "Google News RSS"}
        except Exception as e:
            rows = []
            status[key] = {"status": "unavailable", "reason": type(e).__name__, "provider": "Google News RSS"}
        for row in rows:
            key2 = row["id"]
            if key2 in results:
                results[key2]["categories"] = sorted(set(results[key2]["categories"] + row["categories"]))
            else:
                results[key2] = row
    try:
        rows = gdelt_fetch()
        status["GDELT DOC"] = {"status": "ok", "itemsFetched": len(rows), "provider": "GDELT"}
    except Exception as e:
        rows = []
        status["GDELT DOC"] = {"status": "unavailable", "reason": type(e).__name__, "provider": "GDELT"}
    for row in rows:
        # Exact IDs only. Similar headlines do not establish shared events.
        if row["id"] in results:
            results[row["id"]]["categories"] = sorted(set(results[row["id"]]["categories"] + row["categories"]))
        else:
            results[row["id"]] = row
    if results:
        items = sorted(results.values(), key=lambda r: r.get("observedAt") or r.get("publishedAt") or "", reverse=True)[:300]
        health = "partial" if any(x["status"] != "ok" for x in status.values()) else "ok"
        last = iso(NOW)
    else:
        items = [x for x in previous.get("items", []) if isinstance(x, dict)]
        health = "stale" if items else "unavailable"
        last = previous.get("lastSuccessfulFetchAt")
    publishers = sorted({str(x.get("publisher") or "").strip() for x in items if x.get("publisher")})
    utc_days = [(NOW.date() - timedelta(days=d)).isoformat() for d in range(6, -1, -1)]
    day_counts = {d: 0 for d in utc_days}
    for row in items:
        day = str(row.get("observedAt") or row.get("publishedAt") or "")[:10]
        if day in day_counts:
            day_counts[day] += 1
    return {
        "schemaVersion": 2, "monitor": "US–Iran public conflict reporting",
        "generatedAt": iso(NOW), "lastSuccessfulFetchAt": last, "status": health,
        "dataMode": "multi-index-reporting-not-independent-corroboration",
        "coverage": list(TOPICS.keys()) + ["REGIONAL COVERAGE"],
        "limitations": "Reporting indices are incomplete and delayed. Publication time and index first-seen time are not interchangeable. A headline is not a verified event. Source count is not confidence. No tactical unit/asset tracking.",
        "sources": status, "itemCount": len(items), "publisherCount": len(publishers),
        "reportingByDayUtc": [{"date": d, "reports": n} for d, n in day_counts.items()],
        "items": items,
    }

def main():
    result = collect()
    text = json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n"
    for path in OUTPUTS:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    print(json.dumps({"status": result["status"], "reports": result["itemCount"],
                      "publishers": result["publisherCount"], "sources": result["sources"]}))
if __name__ == "__main__":
    main()
