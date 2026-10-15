import importlib.util
import pathlib
import unittest
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("rhkiran", ROOT / "scripts" / "refresh-iran-conflict.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def example(id="a", category="DIPLOMACY"):
    now = mod.iso(mod.NOW)
    return {
        "id": id, "headline": "Iran talks", "publisher": "Test Source",
        "sourceDomain": "example.org", "articleUrl": "https://example.org/report",
        "publishedAt": now, "observedAt": now, "sourceType": "google-news-rss",
        "timestampBasis": "publisher-date", "verification": "unverified-report",
        "categories": [category]
    }

class CollectTests(unittest.TestCase):
    def test_data_and_provenance(self):
        def rss(topic, query):
            return [example("duplicate", topic)]
        def gdelt():
            return [example("another", "REGIONAL COVERAGE")]
        data = mod.collect(rss, gdelt, {})
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["itemCount"], 2)
        self.assertEqual(data["schemaVersion"], 2)
        self.assertEqual(data["publisherCount"], 1)
        self.assertEqual(len(data["reportingByDayUtc"]), 7)
        duplicate = next(i for i in data["items"] if i["id"] == "duplicate")
        self.assertEqual(len(duplicate["categories"]), 4)
        self.assertTrue(all(i["verification"] == "unverified-report" for i in data["items"]))

    def test_optional_index_failure_does_not_kill_ingestion(self):
        def broken():
            raise ValueError("gdelt-non-json-response")
        result = mod.collect(lambda t,q:[example(t,t)], broken, {})
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["sources"]["GDELT DOC"]["status"], "unavailable")
        self.assertEqual(result["itemCount"], 4)

    def test_total_outage_preserves_last_known_data_with_stale_label(self):
        def broken(*args):
            raise TimeoutError()
        prior = {"items": [example()], "lastSuccessfulFetchAt": "2026-10-14T12:00:00Z"}
        data = mod.collect(broken, broken, prior)
        self.assertEqual(data["status"], "stale")
        self.assertEqual(data["lastSuccessfulFetchAt"], prior["lastSuccessfulFetchAt"])

    def test_gdelt_non_json_raises(self):
        original_get = mod.get
        try:
            mod.get = lambda *args: b"Your query was rate limited"
            with self.assertRaisesRegex(ValueError,"gdelt-non-json-response"):
                mod.gdelt_reports()
        finally:
            mod.get = original_get

if __name__ == "__main__":
    unittest.main()
