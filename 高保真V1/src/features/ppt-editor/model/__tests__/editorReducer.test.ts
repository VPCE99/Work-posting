import { describe, expect, it } from "vitest";
import { buildSlideElements } from "../elements";
import {
  createInitialEditorDocument,
  editorReducer,
  selectedElementOf,
} from "../editorReducer";
import { DEFAULT_SLIDE_TITLES } from "../defaults";

describe("editorReducer", () => {
  it("selects an element by id", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 0);
    const id = buildSlideElements(0)[0]!.id;
    state = editorReducer(state, { type: "selectElement", elementId: id });
    expect(selectedElementOf(state)?.id).toBe(id);
  });

  it("keeps selection in sync after an element update", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 0);
    const id = buildSlideElements(0)[0]!.id;
    state = editorReducer(state, { type: "selectElement", elementId: id });
    state = editorReducer(state, { type: "patchElement", elementId: id, patch: { content: "新标题" } });
    expect(selectedElementOf(state)?.content).toBe("新标题");
    expect(state.saveStatus).toBe("dirty");
  });

  it("clears selection when switching slides", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 0);
    const id = buildSlideElements(0)[0]!.id;
    state = editorReducer(state, { type: "selectElement", elementId: id });
    state = editorReducer(state, { type: "setActiveSlide", slideIndex: 1 });
    expect(state.selectedElementId).toBeNull();
    expect(selectedElementOf(state)).toBeNull();
  });

  it("patches chart rows only on the target element", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 2);
    const chart = buildSlideElements(2).find((item) => item.kind === "chart")!;
    const otherId = buildSlideElements(2)[0]!.id;
    state = editorReducer(state, { type: "selectElement", elementId: chart.id });
    state = editorReducer(state, {
      type: "patchChartRow",
      elementId: chart.id,
      index: 0,
      key: "avg",
      value: "99.99",
    });
    expect(selectedElementOf(state)?.chartRows?.[0]?.avg).toBe("99.99");
    expect(state.elementsBySlide[2]?.find((item) => item.id === otherId)?.content).toBe(buildSlideElements(2)[0]?.content);
  });

  it("adds a blank slide at the end and jumps to it", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 0);
    const before = state.slides.length;
    state = editorReducer(state, { type: "addSlide" });
    expect(state.slides.length).toBe(before + 1);
    expect(state.activeSlide).toBe(before);
    expect(state.slides[before]?.title).toMatch(/^空白页/);
    expect(state.elementsBySlide[before]?.length).toBeGreaterThan(0);
  });

  it("inserts text via applyTool and supports undo", () => {
    let state = createInitialEditorDocument(DEFAULT_SLIDE_TITLES.length, 0);
    const before = state.elementsBySlide[0]?.length ?? 0;
    state = editorReducer(state, { type: "applyTool", tool: "text" });
    expect(state.elementsBySlide[0]?.length).toBe(before + 1);
    expect(selectedElementOf(state)?.kind).toBe("text");
    state = editorReducer(state, { type: "undo" });
    expect(state.elementsBySlide[0]?.length).toBe(before);
  });
});
