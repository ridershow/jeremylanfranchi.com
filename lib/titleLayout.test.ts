import {
  TITLE_MAX_PX,
  TITLE_MIN_PX,
  binarySearchMax,
  maxFontSizeForTwoLines,
  resolveTitleLayout,
  wrapLineCount,
} from "./titleLayout";

test("binary search returns the largest value that still fits", () => {
  expect(binarySearchMax(10, 40, (size) => size <= 25, 0.25)).toBeCloseTo(
    25,
    0,
  );
});

test("a long title wraps to two lines while a short one stays on one", () => {
  const measure = (text: string) => text.length * 10;
  expect(wrapLineCount("Founder", 400, measure)).toBe(1);
  expect(
    wrapLineCount("Senior Growth Marketing Manager", 200, measure),
  ).toBe(2);
});

test("font size is chosen so every title fits in two lines at this width", () => {
  const titles = [
    "Earth",
    "Founder",
    "Senior Growth Marketing Manager",
    "Head of Global Field Marketing",
    "Industrial & mechanical engineering",
    "WordPress Developer & Marketer",
    "Founding partner & Team Manager",
  ];
  const width = 520;
  const lineCount = (title: string, fontSize: number, column: number) =>
    wrapLineCount(title, column, (text) => text.length * fontSize * 0.55);

  const size = maxFontSizeForTwoLines(titles, width, lineCount);
  for (const title of titles) {
    expect(lineCount(title, size, width)).toBeLessThanOrEqual(2);
  }
  const tooBig = titles.some(
    (title) => lineCount(title, TITLE_MAX_PX, width) > 2,
  );
  if (tooBig) {
    expect(size).toBeLessThan(TITLE_MAX_PX);
  }
});

test("a wide column allows a larger title than a narrow one", () => {
  const titles = ["Senior Growth Marketing Manager"];
  const lineCount = (title: string, fontSize: number, column: number) =>
    wrapLineCount(title, column, (text) => text.length * fontSize * 0.55);

  const wide = maxFontSizeForTwoLines(titles, 720, lineCount);
  const narrow = maxFontSizeForTwoLines(titles, 360, lineCount);
  expect(wide).toBeGreaterThan(narrow);
});

test("stacked layout stays on the left when two-line titles leave room for the story", () => {
  const layout = resolveTitleLayout({
    widthFitSize: 56,
    availableBelowOverhead: 640,
    minPanel: 260,
  });
  expect(layout.mode).toBe("default");
  expect(layout.fontSize).toBe(56);
});

test("a short viewport shrinks the title before moving the story", () => {
  const layout = resolveTitleLayout({
    widthFitSize: 76,
    availableBelowOverhead: 420,
    minPanel: 260,
  });
  expect(layout.mode).toBe("default");
  expect(layout.fontSize).toBeLessThan(76);
  expect(layout.fontSize).toBeGreaterThanOrEqual(TITLE_MIN_PX);
});

test("only a viewport that cannot fit the minimum title plus story moves the panel", () => {
  const layout = resolveTitleLayout({
    widthFitSize: 56,
    availableBelowOverhead: 200,
    minPanel: 260,
  });
  expect(layout.mode).toBe("side");
  expect(layout.fontSize).toBe(56);
});
