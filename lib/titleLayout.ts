export const TITLE_MIN_PX = 28.8;
export const TITLE_MAX_PX = 76;
export const TITLE_LINES = 2;
export const TITLE_LINE_HEIGHT = 1;
export const TITLE_GAP = 20;

export type ContentLayoutMode = "default" | "side";

export function binarySearchMax(
  min: number,
  max: number,
  fits: (value: number) => boolean,
  precision = 0.5,
): number {
  if (!fits(min)) return min;
  if (fits(max)) return max;

  let lo = min;
  let hi = max;
  while (hi - lo > precision) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function wrapLineCount(
  title: string,
  width: number,
  measure: (text: string) => number,
): number {
  if (width <= 0) return TITLE_LINES + 1;

  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;

  const space = measure(" ");
  let lines = 1;
  let current = 0;

  for (const word of words) {
    const wordWidth = measure(word);
    if (wordWidth > width) return TITLE_LINES + 1;
    if (current === 0) {
      current = wordWidth;
      continue;
    }
    if (current + space + wordWidth > width) {
      lines += 1;
      current = wordWidth;
    } else {
      current += space + wordWidth;
    }
  }

  return lines;
}

export function maxFontSizeForTwoLines(
  titles: string[],
  width: number,
  lineCount: (title: string, fontSize: number, width: number) => number,
  min = TITLE_MIN_PX,
  max = TITLE_MAX_PX,
): number {
  if (width <= 0 || titles.length === 0) return min;

  return binarySearchMax(min, max, (size) =>
    titles.every((title) => lineCount(title, size, width) <= TITLE_LINES),
  );
}

export function titleBlockHeight(fontSize: number): number {
  return fontSize * TITLE_LINES * TITLE_LINE_HEIGHT;
}

export function resolveTitleLayout({
  widthFitSize,
  availableBelowOverhead,
  minPanel,
  gap = TITLE_GAP,
}: {
  widthFitSize: number;
  availableBelowOverhead: number;
  minPanel: number;
  gap?: number;
}): { fontSize: number; mode: ContentLayoutMode } {
  const budget = availableBelowOverhead - minPanel - gap;
  const stackedAtFit = titleBlockHeight(widthFitSize);

  if (stackedAtFit <= budget) {
    return { fontSize: widthFitSize, mode: "default" };
  }

  const minBlock = titleBlockHeight(TITLE_MIN_PX);
  if (minBlock <= budget) {
    return {
      fontSize: Math.min(
        widthFitSize,
        budget / (TITLE_LINES * TITLE_LINE_HEIGHT),
      ),
      mode: "default",
    };
  }

  return { fontSize: widthFitSize, mode: "side" };
}
