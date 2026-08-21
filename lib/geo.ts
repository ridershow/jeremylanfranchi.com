type GeoPoint = { lat: number; lng: number };
type Located = { location: GeoPoint };

export type CameraView = {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  roll: number;
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
export const CHAPTER_PITCH = 48;

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

export function viewForChapter(chapter: Located): CameraView {
  return {
    center: [chapter.location.lng, chapter.location.lat],
    zoom: CHAPTER_ZOOM,
    pitch: CHAPTER_PITCH,
    bearing: -16 - (Math.abs(chapter.location.lng) % 5),
    roll: 0,
  };
}

export const TYPE_STAGE = 0.382;
export const COMPACT_MAX = 768;

export function isCompactViewport() {
  return typeof window !== "undefined" && window.innerWidth < COMPACT_MAX;
}

function easeOut(exponent: number) {
  return (t: number) => 1 - (1 - t) ** exponent;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function flyAnimation(distance: number, fromOrbit: boolean) {
  if (fromOrbit) {
    return {
      duration: 920 + Math.min(680, distance * 9),
      curve: 1.12,
      speed: 1.22,
      easing: easeOut(2.35),
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
    easing: easeOut(2.85),
  };
}

export type FlightLeg = {
  view: CameraView;
  method: "easeTo" | "flyTo";
  duration: number;
  curve?: number;
  speed?: number;
  easing: (t: number) => number;
};

/** Pull up until Earth fills the frame, then dive into the chapter. */
function earthPeakView(from: GeoPoint, destination: CameraView, distance: number): CameraView {
  let zoom = 3.05;
  let pitch = 26;
  if (distance > 40) {
    zoom = 0.98;
    pitch = 10;
  } else if (distance > 12) {
    zoom = 1.35;
    pitch = 14;
  } else if (distance > 1.2) {
    zoom = 2.15;
    pitch = 20;
  }

  return {
    center: [from.lng, from.lat],
    zoom,
    pitch,
    bearing: destination.bearing,
    roll: 0,
  };
}

export function flightLegs(
  from: GeoPoint,
  destination: CameraView,
  distance: number,
  fromOrbit: boolean,
  cinematic: boolean,
): FlightLeg[] {
  if (!cinematic) {
    return [
      {
        view: destination,
        method: "flyTo",
        ...flyAnimation(distance, fromOrbit),
      },
    ];
  }

  if (fromOrbit) {
    return [
      {
        view: destination,
        method: "flyTo",
        duration: 2400 + Math.min(1100, distance * 10),
        curve: 1.55,
        speed: 0.42,
        easing: easeOut(2.4),
      },
    ];
  }

  const ascent = 1700 + Math.min(500, distance * 3);
  const descent = 2800 + Math.min(1600, distance * 10);

  return [
    {
      view: earthPeakView(from, destination, distance),
      method: "easeTo",
      duration: ascent,
      easing: easeInOutCubic,
    },
    {
      view: destination,
      method: "flyTo",
      duration: descent,
      curve: 1.08,
      speed: 0.38,
      easing: easeOut(2.55),
    },
  ];
}

export function flightDuration(legs: FlightLeg[]) {
  return legs.reduce((sum, leg) => sum + leg.duration, 0);
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

export type MapPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function paddingFromRects(frame: DOMRect, well: DOMRect): MapPadding {
  return {
    top: Math.max(0, Math.round(well.top - frame.top)),
    left: Math.max(0, Math.round(well.left - frame.left)),
    right: Math.max(0, Math.round(frame.right - well.right)),
    bottom: Math.max(0, Math.round(frame.bottom - well.bottom)),
  };
}
