// Data source: Instahyre's public /api/v1/job_search JSON API (search) and each job's
// public HTML page's embedded schema.org/JobPosting JSON-LD block (detail). No
// authentication required. robots.txt places no restrictions on any user agent.

export const SEARCH_URL = "https://www.instahyre.com/api/v1/job_search"
export const RESOURCE_URL = "https://www.instahyre.com/api/v1/job_search"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA = "Mozilla/5.0 (compatible; instahyre-search-cli/1.0)"

/** Fetch with exponential backoff on 429/5xx. Returns "" on a 404. */
export async function httpFetch(url: string, accept: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: accept,
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export async function jsonFetch(url: string): Promise<string> {
  return httpFetch(url, "application/json")
}

export async function htmlFetch(url: string): Promise<string> {
  return httpFetch(url, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

export interface JobDetail extends JobCard {
  description: string | null
  employmentType: string | null
}

interface InstahyreSearchObject {
  id: number
  title?: string
  candidate_title?: string
  locations?: string
  public_url?: string
  employer?: { company_name?: string }
}

interface InstahyreSearchResponse {
  meta?: { offset: number; limit: number; total_count: number }
  objects?: InstahyreSearchObject[]
}

/** Build the search URL. `skills` is Instahyre's keyword/skill-tag query param. */
export function buildSearchUrl(opts: {
  query?: string
  location?: string
  offset: number
  limit: number
}): string {
  const params = new URLSearchParams()
  params.set("source", "opportunities")
  if (opts.query) params.set("skills", opts.query)
  if (opts.location) params.set("jobLocations", opts.location)
  params.set("offset", String(opts.offset))
  params.set("limit", String(opts.limit))
  return `${SEARCH_URL}?${params.toString()}`
}

/** Parse the /api/v1/job_search JSON response into our normalized JobCard shape. */
export function parseSearchResponse(json: string): { cards: JobCard[]; totalCount: number } {
  let data: InstahyreSearchResponse
  try {
    data = JSON.parse(json)
  } catch {
    return { cards: [], totalCount: 0 }
  }
  const objects = data.objects ?? []
  const cards: JobCard[] = objects.map((o) => ({
    id: String(o.id),
    title: o.title ?? o.candidate_title ?? "(untitled)",
    company: o.employer?.company_name ?? null,
    location: o.locations ?? null,
    date: null, // Instahyre's list endpoint never returns a posting date.
    url: o.public_url ?? `https://www.instahyre.com/job-${o.id}/`,
  }))
  return { cards, totalCount: data.meta?.total_count ?? cards.length }
}

/** Resolve a bare job ID to its public_url via the singular resource endpoint. */
export async function resolvePublicUrl(id: string): Promise<string | null> {
  const json = await jsonFetch(`${RESOURCE_URL}/${id}`)
  if (!json) return null
  try {
    const obj = JSON.parse(json) as InstahyreSearchObject
    return obj.public_url ?? null
  } catch {
    return null
  }
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

/** Strip tags but keep paragraph/list breaks as newlines (used for the description field). */
function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  return decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim()
}

interface JobPostingJsonLd {
  title?: string
  description?: string
  employmentType?: string
  datePosted?: string
  hiringOrganization?: { name?: string }
  jobLocation?: Array<{ address?: { addressLocality?: string; addressRegion?: string } }>
}

/**
 * Extract the schema.org/JobPosting JSON-LD block from a job's public HTML page.
 * Instahyre embeds two <script type="application/ld+json"> blocks on some pages
 * (breadcrumb + posting); we pick the one whose @type is JobPosting.
 */
export function parseJobDetail(html: string, id: string, fallbackUrl: string): JobDetail {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  let posting: JobPostingJsonLd | null = null
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1])
      if (parsed && parsed["@type"] === "JobPosting") {
        posting = parsed
        break
      }
    } catch {
      continue
    }
  }

  const locationParts = posting?.jobLocation?.[0]?.address
  const location = locationParts
    ? [locationParts.addressLocality, locationParts.addressRegion].filter(Boolean).join(", ") || null
    : null

  return {
    id,
    title: posting?.title ?? "(untitled)",
    company: posting?.hiringOrganization?.name ?? null,
    location,
    date: posting?.datePosted ?? null,
    url: fallbackUrl,
    description: posting?.description ? htmlToText(posting.description) : null,
    employmentType: posting?.employmentType ?? null,
  }
}
