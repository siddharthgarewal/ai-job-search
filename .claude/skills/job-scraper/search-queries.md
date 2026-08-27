# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

Primary (your market's job boards - scaffold one with `/add-portal`):
- **Naukri.com** - India's largest general job board (not yet scaffolded - run `/add-portal` to add a CLI skill for it)
- **linkedin.com/jobs** - LinkedIn job listings (filter: India / Pune, Hyderabad, Bangalore); also covered by `linkedin-search` CLI
- **Instahyre / Cutshort** - niche tech-focused Indian job boards (optional)

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for known target companies (Amazon, Atlassian, Salesforce)

## Query Categories

Queries are grouped by priority. Write **each category in every language from your Languages table** (see Language scope above). Combine each query with your location terms (e.g. your city, region, or metro area) where the site supports it.

**Note on language:** although Hindi is a declared working language, the Indian tech job market posts virtually all software engineering roles in English, so queries below are in English only. Revisit this if you start targeting roles that explicitly work in Hindi.

**Organize by function, not job title.** The same underlying work carries different titles across companies and markets (a "Data Scientist" role at one employer may be posted as "Insights Analyst" or "Data Consultant" at another). Name each priority category after the function it covers, and list several plausible job titles as query variants within that category rather than betting an entire priority tier on one exact title string.

### Priority 1: Full-Stack / Senior Software Engineering

These match your strongest and most desired career direction (moving from frontend-focused toward full-stack).

```
site:naukri.com "Senior Software Engineer" Pune OR Hyderabad OR Bangalore
site:naukri.com "Full-Stack Engineer" React Pune OR Hyderabad OR Bangalore
site:naukri.com "Frontend Developer" React TypeScript Pune OR Hyderabad OR Bangalore
site:linkedin.com/jobs "Senior Software Engineer" React TypeScript India
site:linkedin.com/jobs "Full-Stack Engineer" India
```

### Priority 2: AI-Assisted / Agentic Software Engineering

These match your growth direction into AI-assisted and agentic development, backed by your Claude/Microsoft agentic-AI certifications.

```
site:naukri.com "AI-Assisted Software Engineer" India
site:naukri.com "GenAI Engineer" Pune OR Hyderabad OR Bangalore
site:naukri.com "Software Engineer" "Agentic AI" India
site:linkedin.com/jobs "GenAI" OR "Agentic AI" Software Engineer India
```

### Priority 3: Adjacent Roles (Tech Lead / Solutions Engineering)

Adjacent roles you could pivot into, given your senior-level scope and client-facing project delivery experience.

```
site:naukri.com "Technical Lead" React Node.js Pune OR Hyderabad OR Bangalore
site:naukri.com "Solutions Engineer" React OR TypeScript India
site:linkedin.com/jobs "Technical Lead" React TypeScript India
```

### Priority 4: Broader Technical / Consulting

Wider net for general technical roles, including your existing energy-sector domain experience.

```
site:naukri.com React developer Pune OR Hyderabad OR Bangalore
site:linkedin.com/jobs "React developer" OR "Node.js developer" India
site:naukri.com "technical consultant" energy OR SaaS Pune OR Hyderabad OR Bangalore
```

### Target Companies to Monitor

```
site:amazon.jobs "Software Engineer" India
site:atlassian.com/company/careers "Software Engineer" India
site:salesforce.com/company/careers "Software Engineer" India
```

## Location Filter

When evaluating results, verify the job location is within reasonable commute distance from your home. Define acceptable areas:
- Pune and surrounding areas (home base)
- Hyderabad (acceptable - open to working here)
- Bangalore (acceptable - open to working here)
- Other major Indian tech hubs (borderline - discuss with user before proceeding)
- Outside India, non-remote (too far)

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
