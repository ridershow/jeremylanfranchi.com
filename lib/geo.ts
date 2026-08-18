type GeoPoint = { lat: number; lng: number };
type Located = { location: GeoPoint };

export type CameraView = {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  roll: number;
};

export type MapPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** Obliquity of the ecliptic — Earth's axis leans this many degrees from vertical. */
export const AXIAL_TILT = 23.44;

export const ORBIT_VIEW: CameraView = {
  center: [12, 0],
  zoom: 0.95,
  pitch: 0,
  bearing: 0,
  roll: -AXIAL_TILT,
};

/** Floor so the planet can still sit in space. Manual zoom-in is unrestricted. */
export const MIN_ZOOM = 0.45;
export const MAX_ZOOM = 17;

/** Camera target during chapter fly/jump only — not a zoom lock. */
export const CHAPTER_ZOOM = 5;
export const PHONE_CHAPTER_ZOOM = 4.4;
export const CHAPTER_PITCH = 48;
export const COMPACT_MAX = 768;
/** Share of the well height to look ahead so the pin sits in the lower third. */
export const LOOK_AHEAD_WELL_FRACTION = 0.18;

export function angularSeparation(a: GeoPoint, b: GeoPoint): number {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

export function isSamePin(a: GeoPoint, b: GeoPoint): boolean {
  return angularSeparation(a, b) < 0.012;
}

function toCartesian(point: GeoPoint) {
  const φ = (point.lat * Math.PI) / 180;
  const λ = (point.lng * Math.PI) / 180;
  return {
    x: Math.cos(φ) * Math.cos(λ),
    y: Math.cos(φ) * Math.sin(λ),
    z: Math.sin(φ),
  };
}

function fromCartesian(x: number, y: number, z: number): [number, number] {
  return [
    (Math.atan2(y, x) * 180) / Math.PI,
    (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI,
  ];
}

export function greatCircle(
  from: GeoPoint,
  to: GeoPoint,
  segments = 72,
): [number, number][] {
  const start = toCartesian(from);
  const end = toCartesian(to);
  const d = Math.acos(
    Math.min(1, Math.max(-1, start.x * end.x + start.y * end.y + start.z * end.z)),
  );
  if (d < 1e-8) return [[from.lng, from.lat], [to.lng, to.lat]];

  const sinD = Math.sin(d);
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const w0 = Math.sin((1 - t) * d) / sinD;
    const w1 = Math.sin(t * d) / sinD;
    points.push(
      fromCartesian(
        w0 * start.x + w1 * end.x,
        w0 * start.y + w1 * end.y,
        w0 * start.z + w1 * end.z,
      ),
    );
  }
  return points;
}

export function isCompactViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < COMPACT_MAX;
}

export function chapterBearing(lng: number): number {
  return -16 - (Math.abs(lng) % 5);
}

export function compactWellHeight(
  padding?: MapPadding | null,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 667,
): number {
  if (padding) {
    return Math.max(0, viewportHeight - padding.top - padding.bottom);
  }
  return Math.max(0, Math.round(viewportHeight * (1 - 0.22 - 0.48)));
}

/** Move the camera target along bearing so the pin falls toward the bottom of the well. */
export function lookAheadCenter(
  pin: GeoPoint,
  bearing: number,
  zoom: number,
  wellHeight: number,
): [number, number] {
  const degrees =
    wellHeight * LOOK_AHEAD_WELL_FRACTION * (360 / (512 * 2 ** zoom));
  const rad = (bearing * Math.PI) / 180;
  const cosLat = Math.max(0.2, Math.cos((pin.lat * Math.PI) / 180));
  return [
    pin.lng + (degrees * Math.sin(rad)) / cosLat,
    pin.lat + degrees * Math.cos(rad),
  ];
}

export type ChapterViewOptions = {
  compact?: boolean;
  padding?: MapPadding | null;
};

export function viewForChapter(
  chapter: Located,
  options: ChapterViewOptions = {},
): CameraView {
  const compact = options.compact ?? isCompactViewport();
  const bearing = chapterBearing(chapter.location.lng);
  const zoom = compact ? PHONE_CHAPTER_ZOOM : CHAPTER_ZOOM;
  const center = compact
    ? lookAheadCenter(
        chapter.location,
        bearing,
        zoom,
        compactWellHeight(options.padding),
      )
    : ([chapter.location.lng, chapter.location.lat] as [number, number]);

  return {
    center,
    zoom,
    pitch: CHAPTER_PITCH,
    bearing,
    roll: 0,
  };
}

export const TYPE_STAGE = 0.382;

export function flyAnimation(distance: number, fromOrbit: boolean) {
  if (fromOrbit) {
    return {
      duration: 920 + Math.min(680, distance * 9),
      curve: 1.12,
      speed: 1.22,
      easing: (t: number) => 1 - (1 - t) ** 2.35,
    };
  }

  let curve = 1.06;
  let speed = 0.92;
  if (distance > 12) {
    curve = 1.48;
    speed = 0.82;
  } else if (distance > 1.2) {
    curve = 1.28;
  }

  return {
    duration: 1180 + Math.min(2100, distance * 20),
    curve,
    speed,
    easing: (t: number) => 1 - (1 - t) ** 2.85,
  };
}

export function flyPadding(measured?: MapPadding | null): MapPadding {
  if (measured) return measured;
  if (typeof window === "undefined") {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width >= COMPACT_MAX) {
    return {
      top: Math.round(height * 0.08),
      bottom: Math.round(height * 0.155),
      left: Math.round(width * TYPE_STAGE),
      right: Math.round(width * 0.045),
    };
  }
  return {
    top: Math.round(height * 0.22),
    bottom: Math.round(height * 0.48),
    left: 16,
    right: 16,
  };
}

export function paddingFromRects(frame: DOMRect, well: DOMRect): MapPadding {
  return {
    top: Math.max(0, Math.round(well.top - frame.top)),
    left: Math.max(0, Math.round(well.left - frame.left)),
    right: Math.max(0, Math.round(frame.right - well.right)),
    bottom: Math.max(0, Math.round(frame.bottom - well.bottom)),
  };
}
