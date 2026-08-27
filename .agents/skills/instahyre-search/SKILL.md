---
name: instahyre-search
version: 1.0.0
description: >
  Use this skill to search live tech job listings on Instahyre, a curated
  hiring platform for India's tech/product/design/sales roles at startups and
  growth companies. Invoke for open positions, vacancies, and hiring in Indian
  cities (Bangalore, Pune, Hyderabad, Mumbai, Delhi NCR, etc.) or remote-in-India
  roles. Trigger phrases: find a job on Instahyre, Instahyre job search,
  Instahyre openings, tech jobs in India, "are there any <role> jobs in
  <Indian city>", look up this Instahyre job posting, इंस्टाहायर पर नौकरी खोजें.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/instahyre-search/cli/src/cli.ts *)
---

# Instahyre Search Skill

Search live job listings from Instahyre's public, unauthenticated JSON API. Instahyre is
a curated hiring platform focused on tech, product, design, and sales roles at Indian
startups and growth-stage companies. No authentication, no API key, and **zero runtime
dependencies** — it runs with just `bun`.

> Instahyre's `robots.txt` places no restrictions on any user agent (no disallowed paths,
> no named AI-crawler exclusions), so this skill does not carry a personal-use warning.
> Still keep request volume reasonable — the CLI backs off automatically on 429/5xx.

## When to use this skill

- Search for job openings on Instahyre by keyword/skill and Indian city (or "Work From Home")
- Get the full description of a specific job listing, including responsibilities,
  qualifications, employment type, and posting date

## Commands

### Search job listings

```bash
bun run .agents/skills/instahyre-search/cli/src/cli.ts search --query "<term>" [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — **required.** Keyword search (job title, skill, or role), e.g. `"Senior Software Engineer"`, `"React"`, `"Product Manager"`. Matched against Instahyre's skill/title tagging, not a literal substring search.
- `--location <text>` / `-l <text>` — Indian city or region, e.g. `"Pune"`, `"Bangalore"`, `"Work From Home"`. Optional; omit to search all locations.
- `--jobage <days>` — **not supported.** Instahyre's search API does not return a posting date on list results (only on individual `detail` pages), so results cannot be filtered or sorted by age server-side. Passing this flag is accepted but has no effect; use `detail` on individual results if posting date matters.
- `--page <n>` — page number (1-indexed, 35 results per page — Instahyre's API page size).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/instahyre-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the numeric job ID from `search` results (e.g. `424487`). You may also pass a full
`public_url` from a search result (e.g. `https://www.instahyre.com/job-424487-react-developer-at-...-bangalore/`).
Returns the full description, employment type, and posting date, parsed from the page's
embedded `schema.org/JobPosting` JSON-LD block.

## Usage examples

```bash
# Senior Software Engineer roles in Pune
bun run .agents/skills/instahyre-search/cli/src/cli.ts search -q "Senior Software Engineer" -l "Pune" --format table

# React roles in Bangalore
bun run .agents/skills/instahyre-search/cli/src/cli.ts search -q "React" -l "Bangalore" --format table

# Product Manager roles, any location
bun run .agents/skills/instahyre-search/cli/src/cli.ts search -q "Product Manager" --format table

# Fully remote-in-India roles
bun run .agents/skills/instahyre-search/cli/src/cli.ts search -q "backend engineer" -l "Work From Home" --format table

# Full details for a specific job
bun run .agents/skills/instahyre-search/cli/src/cli.ts detail 424487 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from Instahyre's public `/api/v1/job_search` JSON endpoint (search) and each job's public HTML page's embedded JSON-LD (`detail`) — no credentials required.
- Page size is fixed at 35 results per page (the API's own default).
- Search results do **not** include a posting date; `date` is always `null` in `search` output. Posting date (`datePosted`) is only available via `detail`.
- Instahyre's search is skill/keyword-tag based rather than a literal full-text search — multi-word queries like `"Senior Software Engineer"` work well for common titles, but very specific or unusual phrasing may return fewer/no matches.
- `jobLocations`-style filtering accepts one location string per request (comma-separated multi-city queries are not supported by this CLI).
