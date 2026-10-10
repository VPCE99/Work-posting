import { describe, expect, it } from "vitest";
import { clampZoom, ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN } from "../zoom";

describe("clampZoom", () => {
  it("keeps values inside the zoom range", () => {
    expect(clampZoom(ZOOM_DEFAULT)).toBe(ZOOM_DEFAULT);
    expect(clampZoom(ZOOM_MIN - 10)).toBe(ZOOM_MIN);
    expect(clampZoom(ZOOM_MAX + 10)).toBe(ZOOM_MAX);
  });

  it("rounds fractional zoom values", () => {
    expect(clampZoom(82.4)).toBe(82);
    expect(clampZoom(82.6)).toBe(83);
  });
});
