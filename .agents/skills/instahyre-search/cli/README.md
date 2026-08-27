# instahyre-cli

CLI for searching jobs on Instahyre's public JSON API — a curated hiring platform for
India's tech/product/design/sales roles at startups and growth companies.

**Data source**: Instahyre's `/api/v1/job_search` JSON endpoint (search) and each job's
public HTML page's embedded `schema.org/JobPosting` JSON-LD block (detail).
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

> Instahyre's `robots.txt` places no restrictions on any user agent (no disallowed paths,
> no named AI-crawler exclusions).

## Installation

```bash
cd .agents/skills/instahyre-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings (`--query` required) |
| `detail` | Fetch full detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# Senior Software Engineer roles in Pune
bun run src/cli.ts search -q "Senior Software Engineer" -l "Pune" --format table

# React roles in Bangalore
bun run src/cli.ts search -q "React" -l "Bangalore" --format table

# Full detail for one job
bun run src/cli.ts detail 424487 --format plain
```

See `../SKILL.md` for the full flag reference and portal notes.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | **Required.** Keyword search (job title, skill, or role). |
| `--location` | `-l` | Indian city/region, or `"Work From Home"`. Optional. |
| `--jobage` | | Accepted but has no effect — Instahyre's list endpoint never returns a posting date. |
| `--page` | | 1-indexed page (35 results/page — Instahyre's own API default). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |
