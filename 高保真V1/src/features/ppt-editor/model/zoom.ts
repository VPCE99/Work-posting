export const CANVAS_WIDTH = 760;
export const CANVAS_HEIGHT = 428;
export const ZOOM_MIN = 25;
export const ZOOM_MAX = 300;
export const ZOOM_STEP = 10;
export const ZOOM_WHEEL_STEP = 5;
export const ZOOM_DEFAULT = 82;

export function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value)));
}
