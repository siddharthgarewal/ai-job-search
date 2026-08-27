import { htmlFetch, parseJobDetail, resolvePublicUrl, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** A bare numeric ID, or a job ID embedded in a public_url like /job-424487-.../  */
function extractId(input: string): string | null {
  const bare = input.match(/^\d+$/)
  if (bare) return input
  const fromUrl = input.match(/\/job-(\d+)-/)
  if (fromUrl) return fromUrl[1]
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = extractId(opts.id)
  if (!id) {
    writeError(`Could not parse a job ID from "${opts.id}"`, "BAD_ID")
    return 1
  }

  try {
    // A full public_url was passed directly; fetch it as-is. Otherwise resolve
    // the bare ID to its public_url via the singular resource endpoint first -
    // Instahyre's JSON API never returns the full description, only the HTML
    // job page does (see url-reference.md).
    const isUrl = /^https?:\/\//.test(opts.id)
    const publicUrl = isUrl ? opts.id : await resolvePublicUrl(id)
    if (!publicUrl) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }

    const html = await htmlFetch(publicUrl)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, id, publicUrl)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.date ? `Posted: ${job.date}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
