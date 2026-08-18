import {
  CHAPTER_PITCH,
  CHAPTER_ZOOM,
  PHONE_CHAPTER_ZOOM,
  chapterBearing,
  compactWellHeight,
  lookAheadCenter,
  viewForChapter,
} from "./geo";

const paris = { location: { lat: 48.8566, lng: 2.3522 } };

test("desktop chapter camera centers on the pin at zoom 5", () => {
  const view = viewForChapter(paris, { compact: false });
  expect(view.zoom).toBe(CHAPTER_ZOOM);
  expect(view.pitch).toBe(CHAPTER_PITCH);
  expect(view.center).toEqual([paris.location.lng, paris.location.lat]);
});

test("compact chapter camera keeps pitch, pulls back, and looks north of the pin", () => {
  const padding = { top: 147, bottom: 320, left: 16, right: 16 };
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 667,
  });

  const view = viewForChapter(paris, { compact: true, padding });
  const north = view.center[1] - paris.location.lat;

  expect(view.zoom).toBe(PHONE_CHAPTER_ZOOM);
  expect(view.pitch).toBe(CHAPTER_PITCH);
  expect(view.bearing).toBe(chapterBearing(paris.location.lng));
  expect(north).toBeGreaterThan(0.4);
  expect(north).toBeLessThan(2);
});

test("look-ahead in a short well is about a degree along bearing", () => {
  const well = compactWellHeight(
    { top: 147, bottom: 320, left: 16, right: 16 },
    667,
  );
  expect(well).toBe(200);

  const [lng, lat] = lookAheadCenter(
    paris.location,
    chapterBearing(paris.location.lng),
    PHONE_CHAPTER_ZOOM,
    well,
  );
  expect(lat - paris.location.lat).toBeCloseTo(1.15, 1);
  expect(lng).toBeLessThan(paris.location.lng);
});
