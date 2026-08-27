import { describe, test, expect } from "bun:test";
import { runCLI, parseJSON } from "./helpers";

interface JobCard {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  date: string | null;
  url: string;
}

interface JobDetail extends JobCard {
  description: string | null;
  employmentType: string | null;
}

// Live network smoke tests against Instahyre's public API. Keep volume low:
// one search + one detail fetch per run, matching add-portal.md's Step 4.
describe("live: search", () => {
  test("a realistic query returns real results with non-null id/title/url", async () => {
    const result = await runCLI(["search", "-q", "Senior Software Engineer", "-l", "Pune", "--limit", "5"]);
    const parsed = parseJSON<{ meta: { count: number }; results: JobCard[] }>(result);
    expect(parsed.results.length).toBeGreaterThan(0);
    for (const job of parsed.results) {
      expect(job.id).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.url).toContain("instahyre.com");
      expect(job.date).toBeNull(); // documented: list endpoint never returns a date
    }
  }, 30000);
});

describe("live: detail", () => {
  test("fetching detail for a real search result returns a readable description", async () => {
    const searchResult = await runCLI(["search", "-q", "Senior Software Engineer", "-l", "Pune", "--limit", "1"]);
    const { results } = parseJSON<{ results: JobCard[] }>(searchResult);
    expect(results.length).toBeGreaterThan(0);
    const id = results[0].id;

    const detailResult = await runCLI(["detail", id]);
    const job = parseJSON<JobDetail>(detailResult);
    expect(job.title).toBeTruthy();
    expect(job.title).not.toBe("(untitled)");
    // Description should be plain text: tags stripped, entities decoded.
    if (job.description) {
      expect(job.description).not.toMatch(/<[a-z][\s\S]*>/i);
    }
  }, 30000);
});
