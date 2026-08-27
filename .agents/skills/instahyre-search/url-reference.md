# Instahyre Job Search API Reference

Public, unauthenticated JSON API backing Instahyre's `/search-jobs/` page (an AngularJS
SPA — the search results are not present in the initial server-rendered HTML, they are
fetched client-side from this endpoint, extracted from the app's minified JS bundle
`opportunitiesListCtrl` / `jobSearchService`).

> `robots.txt` (`https://www.instahyre.com/robots.txt`) is `User-agent: *` with **no
> Disallow lines at all** — no named AI-crawler exclusions, no restricted paths.

## Search

```
GET https://www.instahyre.com/api/v1/job_search
```

Query params:

| Param | Meaning | Example |
|-------|---------|---------|
| `source` | Constant required by the endpoint | `opportunities` |
| `skills` | Keyword/skill query (title, skill, or role) | `Senior Software Engineer` |
| `jobLocations` | Indian city/region, or `Work From Home` | `Pune` |
| `offset` | Pagination offset (35/page, the API's own default) | `0`, `35`, `70`, … |
| `limit` | Page size (optional; defaults to 35 server-side) | `35` |

Returns JSON:

```json
{
  "meta": { "offset": 0, "limit": 35, "total_count": 533, "next": "/api/v1/job_search?...&offset=35", "previous": null },
  "objects": [
    {
      "id": 435235,
      "title": "Senior Software Engineer",
      "locations": "Pune",
      "public_url": "https://www.instahyre.com/job-435235-senior-software-engineer-at-tarana-wireless-pune/",
      "employer": { "company_name": "Tarana Wireless", "company_tagline": "...", "id": 12345 },
      "keywords": ["React", "Node.js", "..."]
    }
  ]
}
```

Notes:
- `objects[].id` maps to our `id`, `title` to `title`, `employer.company_name` to `company`, `locations` to `location`, `public_url` to `url`. There is **no date field** in this response — `date` is always `null` in the CLI's search output.
- `GET /api/v1/job_search/<id>` (singular resource) returns the **same summary object**, not a richer detail — it does not include the description. Full detail lives only on the public HTML page.

## Detail

The full job description is not available via any JSON endpoint. It's embedded in the
public job page (`public_url` from a search result, e.g.
`https://www.instahyre.com/job-<id>-<slug>/`) as a `schema.org/JobPosting` JSON-LD block:

```
GET https://www.instahyre.com/job-<id>-<slug>/
```

```html
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "JobPosting", "employmentType": "FULL_TIME",
 "title": "React Developer", "description": "<html>...</html>",
 "jobLocation": [{"@type": "Place", "address": {"addressLocality": "Bangalore", "addressRegion": "Karnataka", "addressCountry": "India"}}],
 "hiringOrganization": {"name": "Bloom Value Corporation", "sameAs": "https://bloomvalue.com/"},
 "datePosted": "2026-05-13"}
</script>
```

If the CLI is given a bare numeric ID rather than a full URL, it first calls
`GET /api/v1/job_search/<id>` to resolve `public_url`, then fetches that page and parses
the JSON-LD block above. `description` is HTML (`<p>`, `<ul>`, `<li>` etc.) — the CLI
strips tags and decodes entities the same way the other portal skills in this repo do.

## Notes

- No authentication required for either endpoint.
- Respect rate limits — the CLI backs off on 429/5xx with exponential backoff + jitter, same convention as every other shipped portal skill.
- The search endpoint's `skills` param is tag/keyword based (it matches against title and tagged skills), not a literal substring search across the full posting text.
- If Instahyre changes its AngularJS bundle hashes (`static.instahyre.com/js/output.<hash>.js`) or the JSON-LD schema on job pages, re-derive the endpoint/parsing from a fresh fetch — the bundle URLs are not stable across deploys.
