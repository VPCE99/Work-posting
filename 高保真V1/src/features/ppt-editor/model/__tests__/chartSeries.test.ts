import { describe, expect, it } from "vitest";
import { chartSeries, chartValueDomain } from "../chartSeries";

describe("chartSeries", () => {
  it("parses numeric series and falls back invalid numbers to 0", () => {
    expect(
      chartSeries([
        { category: "A", avg: "90.5", spot: "bad" },
        { category: "B", avg: "", spot: "10" },
      ]),
    ).toEqual([
      { category: "A", avg: 90.5, spot: 0 },
      { category: "B", avg: 0, spot: 10 },
    ]);
  });
});

describe("chartValueDomain", () => {
  it("computes min/max/span with a non-zero span floor", () => {
    const domain = chartValueDomain([
      { category: "A", avg: 10, spot: 20 },
      { category: "B", avg: 30, spot: 40 },
    ]);
    expect(domain.min).toBe(0);
    expect(domain.max).toBe(40);
    expect(domain.span).toBe(40);
  });
});
