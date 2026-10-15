# RHKEARTH — U.S.–Iran public reporting evidence desk

## Architecture
A static GitHub Pages panel backed by hourly Python ingestion. No LLM summaries or
unsupported predictions. Both discovery indexes are optional; one failing index
must not empty the other. A fully failed refresh retains last-good reports with
an explicit `stale` status and preserved last-successful-fetch timestamp.

## Discovery indexes
- **Google News RSS search**: Four explicit reporting areas: conflict reporting,
  diplomacy, humanitarian, and energy/shipping. Publisher name and publication
  timestamp come from the RSS item. The article URL may be a Google News redirect.
- **GDELT DOC 2.0**: A broad U.S.–Iran article-discovery query; direct source URLs,
  source domains and the GDELT `seendate` index timestamp. The index timestamp is
  **not** represented as the article's publication timestamp.
- GDELT may return a rate-limit error string as HTTP 200. Parsing and schema
  validation treat these as degraded source status, never as empty success.

## Data contract
`experimental-data/iran-conflict.json` (schema v2) includes:
`generatedAt`, `lastSuccessfulFetchAt`, per-source health,
`reportingByDayUtc`, `publisherCount`, and an attributed list of reports.
Every report has a source URL, its index provider, an explicit timestamp basis,
and `verification=unverified-report`. These are search/index results, not
human-verified conflict events. Provider diversity is **not** factual corroboration.

## UI
- Rolling 24-hour, 72-hour, and 7-day reporting windows
- Reporting-frequency histogram (report counts, not event counts)
- Search, discovery-index, and subject filters
- Per-index health and staleness
- Local-only watch terms and watch-only filtering; no push alerts or background monitoring
- Browser CSV export and copyable source digest with hyperlinks and provenance
- Mobile layout and no live unit/asset tracking

## Validation
`python -m unittest discover -s tests -p 'test_iran_conflict.py' -v` is run
before scheduled ingestion. The action validates v2 fields and both committed
copies of the snapshot before publishing.

## Upstream documentation
- https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- https://github.com/alex9smith/gdelt-doc-api

This is an open-source reporting aid, not a Palantir product, a source-verified
war incident database, or military intelligence with authenticated sensors.
