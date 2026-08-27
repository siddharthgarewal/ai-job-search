import { describe, expect, test } from "bun:test";
import { parseSearchResponse, parseJobDetail, buildSearchUrl } from "../src/helpers";

const SAMPLE_SEARCH_RESPONSE = JSON.stringify({
  meta: { offset: 0, limit: 35, total_count: 2 },
  objects: [
    {
      id: 424487,
      title: "React Developer",
      locations: "Bangalore",
      public_url: "https://www.instahyre.com/job-424487-react-developer-at-bloom-value-corporation-bangalore/",
      employer: { company_name: "Bloom Value Corporation" },
    },
    {
      id: 435235,
      candidate_title: "Senior Software Engineer",
      locations: "Pune",
      employer: { company_name: "Tarana Wireless" },
    },
  ],
});

describe("buildSearchUrl", () => {
  test("includes source=opportunities, skills, jobLocations, offset, limit", () => {
    const url = buildSearchUrl({ query: "React", location: "Pune", offset: 35, limit: 35 });
    expect(url).toContain("source=opportunities");
    expect(url).toContain("skills=React");
    expect(url).toContain("jobLocations=Pune");
    expect(url).toContain("offset=35");
    expect(url).toContain("limit=35");
  });

  test("omits skills/jobLocations params when not provided", () => {
    const url = buildSearchUrl({ offset: 0, limit: 35 });
    expect(url).not.toContain("skills=");
    expect(url).not.toContain("jobLocations=");
  });
});

describe("parseSearchResponse", () => {
  test("maps objects to the normalized JobCard shape, date always null", () => {
    const { cards, totalCount } = parseSearchResponse(SAMPLE_SEARCH_RESPONSE);
    expect(totalCount).toBe(2);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toEqual({
      id: "424487",
      title: "React Developer",
      company: "Bloom Value Corporation",
      location: "Bangalore",
      date: null,
      url: "https://www.instahyre.com/job-424487-react-developer-at-bloom-value-corporation-bangalore/",
    });
  });

  test("falls back to candidate_title and a constructed URL when fields are missing", () => {
    const { cards } = parseSearchResponse(SAMPLE_SEARCH_RESPONSE);
    expect(cards[1].title).toBe("Senior Software Engineer");
    expect(cards[1].url).toBe("https://www.instahyre.com/job-435235/");
  });

  test("malformed JSON returns an empty result instead of throwing", () => {
    const { cards, totalCount } = parseSearchResponse("not json");
    expect(cards).toEqual([]);
    expect(totalCount).toBe(0);
  });
});

const SAMPLE_JOB_PAGE_HTML = `
<html><body>
<script type="application/ld+json">{"@type": "BreadcrumbList", "itemListElement": []}</script>
<script type="application/ld+json">${JSON.stringify({
  "@type": "JobPosting",
  title: "React Developer",
  description: "<p>Build things.</p><ul><li>React</li><li>TypeScript</li></ul>",
  employmentType: "FULL_TIME",
  datePosted: "2026-05-13",
  hiringOrganization: { name: "Bloom Value Corporation" },
  jobLocation: [{ address: { addressLocality: "Bangalore", addressRegion: "Karnataka" } }],
})}</script>
</body></html>
`;

describe("parseJobDetail", () => {
  test("picks the JobPosting JSON-LD block (skipping BreadcrumbList) and strips description HTML", () => {
    const job = parseJobDetail(SAMPLE_JOB_PAGE_HTML, "424487", "https://www.instahyre.com/job-424487-x/");
    expect(job.title).toBe("React Developer");
    expect(job.company).toBe("Bloom Value Corporation");
    expect(job.location).toBe("Bangalore, Karnataka");
    expect(job.date).toBe("2026-05-13");
    expect(job.employmentType).toBe("FULL_TIME");
    expect(job.description).toContain("Build things.");
    expect(job.description).not.toContain("<p>");
  });

  test("missing JSON-LD block returns nulls instead of throwing", () => {
    const job = parseJobDetail("<html><body>no jsonld here</body></html>", "1", "https://www.instahyre.com/job-1/");
    expect(job.title).toBe("(untitled)");
    expect(job.company).toBeNull();
    expect(job.description).toBeNull();
  });
});
