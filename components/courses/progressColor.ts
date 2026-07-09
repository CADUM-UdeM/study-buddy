const PROGRESS_STOPS = [
  { at: 0, color: "#F2A8A0" },
  { at: 0.35, color: "#F5D078" },
  { at: 0.65, color: "#C8E06C" },
  { at: 1, color: "#4BAE4F" },
] as const;

function parseHex(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function toHex(r: number, g: number, b: number) {
  const clamp = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

function lerpChannel(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Warm coral → amber → lime → green as progress goes 0 → 1. */
export function getProgressFillColor(progress: number): string {
  const t = Math.max(0, Math.min(1, progress));

  for (let i = 0; i < PROGRESS_STOPS.length - 1; i += 1) {
    const start = PROGRESS_STOPS[i];
    const end = PROGRESS_STOPS[i + 1];
    if (t <= end.at) {
      const localT = (t - start.at) / (end.at - start.at);
      const from = parseHex(start.color);
      const to = parseHex(end.color);
      return toHex(
        lerpChannel(from.r, to.r, localT),
        lerpChannel(from.g, to.g, localT),
        lerpChannel(from.b, to.b, localT),
      );
    }
  }

  return PROGRESS_STOPS[PROGRESS_STOPS.length - 1].color;
}
