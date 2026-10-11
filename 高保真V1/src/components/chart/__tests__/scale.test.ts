import { describe, expect, it } from "vitest";
import { occupancyChartSeries, occupancyValueDomain, paddedValueDomain, scaleLinear } from "../scale";

describe("shared chart scale", () => {
  it("parses occupancy series and falls back invalid numbers to 0", () => {
    expect(
      occupancyChartSeries([
        { category: "A", avg: "90.5", spot: "bad" },
        { category: "B", avg: "", spot: "10" },
      ]),
    ).toEqual([
      { category: "A", avg: 90.5, spot: 0 },
      { category: "B", avg: 0, spot: 10 },
    ]);
  });

  it("pads domains for dialog charts", () => {
    const domain = paddedValueDomain([10, 20]);
    expect(domain.min).toBeLessThanOrEqual(10);
    expect(domain.max).toBeGreaterThanOrEqual(20);
  });

  it("maps linear scales", () => {
    expect(scaleLinear(5, { min: 0, max: 10 }, { start: 100, end: 0 })).toBe(50);
  });

  it("computes occupancy domain min/max/span with a non-zero span floor", () => {
    const domain = occupancyValueDomain([
      { category: "A", avg: 10, spot: 20 },
      { category: "B", avg: 30, spot: 40 },
    ]);
    expect(domain.min).toBe(0);
    expect(domain.max).toBe(40);
    expect(domain.span).toBe(40);
  });
});
