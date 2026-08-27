import { buildSearchUrl, jsonFetch, parseSearchResponse, writeError, type JobCard } from "../helpers.js"

export interface SearchOpts {
  query?: string
  location?: string
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

const PAGE_SIZE = 35 // Instahyre's own API default page size.

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 42).padEnd(42)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const loc = (c.location || "—").slice(0, 24).padEnd(24)
    return `${c.id.padEnd(9)} ${title} ${company} ${loc}`
  })
  const header =
    "ID".padEnd(9) + " " + "TITLE".padEnd(42) + " " + "COMPANY".padEnd(26) + " " + "LOCATION"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const offset = (opts.page - 1) * PAGE_SIZE
    const url = buildSearchUrl({
      query: opts.query,
      location: opts.location,
      offset,
      limit: PAGE_SIZE,
    })
    const json = await jsonFetch(url)
    let { cards } = parseSearchResponse(json)
    if (opts.limit !== undefined && opts.limit >= 0) cards = cards.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map((c) => `${c.title}\n  ${c.company || "—"} · ${c.location || "—"}\n  id: ${c.id}\n  ${c.url}`)
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: cards.length, page: opts.page }, results: cards }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
