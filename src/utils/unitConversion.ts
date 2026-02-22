export const PIXELS_PER_CM = 5; // 1cm = 5px

export function cmToPx(cm: number): number {
  return cm * PIXELS_PER_CM;
}

export function pxToCm(px: number): number {
  return px / PIXELS_PER_CM;
}

export function getPixelsPerCm(): number {
  return PIXELS_PER_CM;
}
