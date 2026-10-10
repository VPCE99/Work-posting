import { describe, expect, it } from "vitest";
import { occupancyChartSeries, occupancyValueDomain, paddedValueDomain, scaleLinear } from "../scale";

describe("shared chart scale", () => {
  it("parses occupancy series", () => {
    expect(occupancyChartSeries([{ category: "A", avg: "10", spot: "x" }])).toEqual([
      { category: "A", avg: 10, spot: 0 },
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

  it("computes occupancy domain span", () => {
    expect(occupancyValueDomain([{ category: "A", avg: 10, spot: 20 }]).span).toBe(20);
  });
});
