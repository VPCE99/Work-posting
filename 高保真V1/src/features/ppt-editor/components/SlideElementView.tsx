import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { DragBind } from "../hooks/useCanvasElementDrag";
import { LucideIcon } from "../icons/LucideIcon";
import { elementBoxStyle, elementTextStyle, slideElementClass, type SlideElement } from "../model";
import { LiveSlideChart } from "./LiveSlideChart";

export function SlideElementView({
  element,
  selectedId,
  onSelect,
  bindDrag,
}: {
  element: SlideElement;
  selectedId: string | null;
  onSelect: (element: SlideElement) => void;
  bindDrag?: DragBind;
}) {
  const select = (event: ReactMouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    if ("key" in event && event.key !== "Enter" && event.key !== " ") return;
    if ("key" in event) event.preventDefault();
    onSelect(element);
  };
  const dragProps = bindDrag ? bindDrag(element) : {};

  if (element.kind === "chart") {
    return (
      <div
        role="button"
        tabIndex={0}
        className={slideElementClass("slide-canvas__live-item slide-canvas__live-chart", selectedId, element.id)}
        data-label={element.label}
        style={elementBoxStyle(element)}
        onClick={select}
        onKeyDown={select}
        {...dragProps}
      >
        <LiveSlideChart element={element} positioned={false} />
      </div>
    );
  }

  if (element.kind === "table") {
    const rows = element.content.split("\n").map((line) => line.split("|").map((cell) => cell.trim()));
    return (
      <div
        role="button"
        tabIndex={0}
        className={slideElementClass("slide-canvas__live-item slide-canvas__live-table", selectedId, element.id)}
        data-label={element.label}
        style={elementBoxStyle(element)}
        onClick={select}
        onKeyDown={select}
        {...dragProps}
      >
        <table>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${element.id}-r${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${element.id}-r${index}-c${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (element.kind === "image") {
    return (
      <div
        role="button"
        tabIndex={0}
        className={slideElementClass("slide-canvas__live-item slide-canvas__live-image", selectedId, element.id)}
        data-label={element.label}
        style={elementBoxStyle(element)}
        onClick={select}
        onKeyDown={select}
        {...dragProps}
      >
        <LucideIcon name="image" size={28} />
        <span>{element.content || "图片"}</span>
      </div>
    );
  }

  if (element.kind === "shape") {
    return (
      <div
        role="button"
        tabIndex={0}
        className={slideElementClass(
          element.shapeVariant === "ellipse" ? "slide-canvas__live-item slide-canvas__live-shape slide-canvas__live-shape--ellipse" : "slide-canvas__live-item slide-canvas__live-shape",
          selectedId,
          element.id,
        )}
        data-label={element.label}
        style={{
          ...elementBoxStyle(element),
          background: element.textColor,
        }}
        onClick={select}
        onKeyDown={select}
        {...dragProps}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={slideElementClass("slide-canvas__live-item", selectedId, element.id)}
      data-label={element.label}
      style={elementTextStyle(element)}
      onClick={select}
      onKeyDown={select}
      {...dragProps}
    >
      {element.content}
    </div>
  );
}
