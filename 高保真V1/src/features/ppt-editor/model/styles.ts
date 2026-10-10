import type { CSSProperties } from "react";
import type { SlideElement } from "./types";

export function elementBoxStyle(element: SlideElement): CSSProperties {
  return {
    left: `calc(${element.x}px * var(--slide-scale))`,
    top: `calc(${element.y}px * var(--slide-scale))`,
    width: `calc(${element.w}px * var(--slide-scale))`,
    minHeight: `calc(${element.h}px * var(--slide-scale))`,
  };
}

export function elementTextStyle(element: SlideElement): CSSProperties {
  return {
    ...elementBoxStyle(element),
    color: element.textColor,
    fontSize: `calc(${Number(element.fontSize) || 14}px * var(--slide-scale))`,
    lineHeight: element.lineHeight,
    fontWeight: element.bold ? 700 : 400,
    fontStyle: element.italic ? "italic" : "normal",
    textDecoration: element.underline ? "underline" : "none",
    textAlign: element.align,
    background: element.bgTransparent ? "transparent" : "rgb(255 255 255 / 8%)",
  };
}
