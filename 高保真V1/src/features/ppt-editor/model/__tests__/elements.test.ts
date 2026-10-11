import { describe, expect, it } from "vitest";
import { buildSlideElements, elementId, elementLabel } from "../elements";
import { DEFAULT_SLIDE_TITLES } from "../defaults";

describe("buildSlideElements", () => {
  it("builds title and body for a normal slide", () => {
    const elements = buildSlideElements(0);
    expect(elements).toHaveLength(2);
    expect(elements[0]?.id).toBe(elementId(0, "title"));
    expect(elements[0]?.content).toBe(DEFAULT_SLIDE_TITLES[0]);
    expect(elements[1]?.id).toBe(elementId(0, "body"));
    expect(elements[0]?.label).toBe(elementLabel(0, 1));
  });

  it("builds market slide with a chart element", () => {
    const elements = buildSlideElements(2);
    expect(elements).toHaveLength(9);
    const chart = elements.find((item) => item.kind === "chart");
    expect(chart?.chartType).toBe("line");
    expect(chart?.chartRows).toHaveLength(5);
    expect(chart?.id).toBe("s3-chart");
    expect(elements.some((item) => item.id === "s3-metricValue")).toBe(true);
    expect(elements.some((item) => item.id === "s3-source")).toBe(true);
    expect(elements.some((item) => item.id === "s3-brand")).toBe(true);
  });
});
