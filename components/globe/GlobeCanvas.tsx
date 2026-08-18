"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  angularSeparation,
  flyAnimation,
  flyPadding,
  greatCircle,
  isCompactViewport,
  isSamePin,
  MAX_ZOOM,
  MIN_ZOOM,
  ORBIT_VIEW,
  viewForChapter,
  type MapPadding,
} from "@/lib/geo";
import { globeSky, satelliteStyle } from "@/lib/mapStyle";
import type { Chapter } from "@/lib/types";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

type GlobeCanvasProps = {
  chapters: Chapter[];
  activeIndex: number;
  started: boolean;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
  padding?: MapPadding | null;
};

type PinGroup = {
  lat: number;
  lng: number;
  indices: number[];
};

const EMPTY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const ARC_COLOR = "#e85d4c";
const SPIN_DEG = 0.055;

export default function GlobeCanvas({
  chapters,
  activeIndex,
  started,
  onSelect,
  reducedMotion,
  padding = null,
}: GlobeCanvasProps) {
  const root = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const arcFrame = useRef(0);
  const spinFrame = useRef(0);
  const resumeSpin = useRef(0);
  const spinning = useRef(true);
  const spinLast = useRef(0);
  const landed = useRef(false);
  const onSelectRef = useRef(onSelect);
  const reducedRef = useRef(reducedMotion);
  const chaptersRef = useRef(chapters);
  const indexRef = useRef(activeIndex);
  const startedRef = useRef(started);
  const prevIndex = useRef(activeIndex);
  const paddingRef = useRef(padding);

  useEffect(() => {
    onSelectRef.current = onSelect;
    reducedRef.current = reducedMotion;
    chaptersRef.current = chapters;
    indexRef.current = activeIndex;
    startedRef.current = started;
    paddingRef.current = padding;
  });

  useEffect(() => {
    if (!root.current) return;

    const map = new MapLibreMap({
      container: root.current,
      style: satelliteStyle,
      center: ORBIT_VIEW.center,
      zoom: ORBIT_VIEW.zoom,
      pitch: ORBIT_VIEW.pitch,
      bearing: ORBIT_VIEW.bearing,
      roll: ORBIT_VIEW.roll,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxPitch: 52,
      rollEnabled: false,
      pixelRatio:
        window.innerWidth < 768
          ? 1
          : Math.min(1.2, window.devicePixelRatio || 1),
      attributionControl: { compact: true },
      canvasContextAttributes: {
        antialias: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      },
      fadeDuration: 0,
      refreshExpiredTiles: false,
      maxTileCacheSize: 96,
      validateStyle: false,
      pitchWithRotate: false,
      anisotropicFilterPitch: 80,
      cancelPendingTileRequestsWhileZooming: true,
    });
    mapRef.current = map;
    map.on("error", (event) => {
      console.error("maplibre", event.error);
    });

    function stopSpin() {
      spinning.current = false;
      window.cancelAnimationFrame(spinFrame.current);
      window.clearTimeout(resumeSpin.current);
    }

    function spin(now: number) {
      if (!spinning.current || startedRef.current || reducedRef.current) return;
      const current = mapRef.current;
      if (!current) return;
      const last = spinLast.current || now;
      spinLast.current = now;
      const delta = Math.min(48, now - last);
      const center = current.getCenter();
      // West-to-east rotation around the geographic poles, not the camera bearing.
      current.setCenter([
        center.lng - SPIN_DEG * (delta / 16.67),
        center.lat,
      ]);
      spinFrame.current = window.requestAnimationFrame(spin);
    }

    function onReady() {
      map.setProjection({ type: "globe" });
      map.setSky(globeSky);
      addArcLayer(map, "arcs-past", 2.1, 0.5);
      addArcLayer(map, "arcs-live", 2.6, 1);
      map.jumpTo({ ...ORBIT_VIEW, padding: flyPadding(paddingRef.current) });
      refreshPins(map, chaptersRef.current, -1, markers, (index) =>
        onSelectRef.current(index),
      );
      if (!reducedRef.current && !startedRef.current) {
        spinning.current = true;
        spinLast.current = 0;
        spinFrame.current = window.requestAnimationFrame(spin);
      }
    }

    whenStyleReady(map, onReady);

    const onMoveStart = (event: { originalEvent?: Event }) => {
      if (event.originalEvent) stopSpin();
    };
    const onMoveEnd = (event: { originalEvent?: Event }) => {
      if (
        event.originalEvent &&
        !startedRef.current &&
        !reducedRef.current
      ) {
        window.clearTimeout(resumeSpin.current);
        resumeSpin.current = window.setTimeout(() => {
          if (startedRef.current || !mapRef.current) return;
          spinning.current = true;
          spinLast.current = 0;
          spin(performance.now());
        }, 2400);
      }
    };

    map.on("movestart", onMoveStart);
    map.on("moveend", onMoveEnd);

    const onResize = () => {
      if (!map.loaded()) return;
      map.easeTo({ padding: flyPadding(paddingRef.current), duration: 0 });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(arcFrame.current);
      window.cancelAnimationFrame(spinFrame.current);
      window.clearTimeout(resumeSpin.current);
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => {
      const pinIndex = started ? activeIndex : -1;
      refreshPins(map, chapters, pinIndex, markers, (index) =>
        onSelectRef.current(index),
      );

      if (!started) {
        window.cancelAnimationFrame(arcFrame.current);
        clearArcs(map);
        return;
      }

      spinning.current = false;
      window.cancelAnimationFrame(spinFrame.current);
      window.clearTimeout(resumeSpin.current);

      refreshArcs(map, chapters, activeIndex, reducedRef.current, arcFrame);

      const chapter = chapters[activeIndex];
      if (!chapter) return;

      const previous = chapters[prevIndex.current];
      const fromOrbit = !landed.current;
      const samePin =
        !fromOrbit &&
        previous &&
        isSamePin(previous.location, chapter.location);
      const distance = fromOrbit
        ? angularSeparation(
            { lat: ORBIT_VIEW.center[1], lng: ORBIT_VIEW.center[0] },
            chapter.location,
          )
        : previous
          ? angularSeparation(previous.location, chapter.location)
          : 0;
      prevIndex.current = activeIndex;
      landed.current = true;

      if (samePin) return;

      const padding = flyPadding(paddingRef.current);
      const camera = {
        ...viewForChapter(chapter, {
          compact: isCompactViewport(),
          padding,
        }),
        padding,
      };
      if (reducedRef.current) {
        map.jumpTo(camera);
        return;
      }

      map.flyTo({ ...camera, ...flyAnimation(distance, fromOrbit) });
    };

    whenStyleReady(map, run);
  }, [activeIndex, chapters, started]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded()) return;
    map.easeTo({ padding: flyPadding(padding), duration: 280 });
  }, [padding]);

  return (
    <div
      ref={root}
      className="h-full w-full cursor-grab active:cursor-grabbing"
    />
  );
}

function whenStyleReady(map: MapLibreMap, fn: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  if (map.isStyleLoaded()) {
    run();
    return;
  }
  map.once("style.load", run);
  map.once("load", run);
  window.setTimeout(run, 600);
}

function addArcLayer(
  map: MapLibreMap,
  id: "arcs-past" | "arcs-live",
  width: number,
  opacity: number,
) {
  if (map.getSource(id)) return;
  map.addSource(id, { type: "geojson", data: EMPTY });
  map.addLayer({
    id,
    type: "line",
    source: id,
    paint: {
      "line-color": ARC_COLOR,
      "line-width": width,
      "line-opacity": opacity,
    },
  });
}

function clearArcs(map: MapLibreMap) {
  const past = map.getSource("arcs-past") as GeoJSONSource | undefined;
  const live = map.getSource("arcs-live") as GeoJSONSource | undefined;
  past?.setData(EMPTY);
  live?.setData(EMPTY);
}

function pinGroups(chapters: Chapter[]): PinGroup[] {
  const groups = new Map<string, PinGroup>();
  for (const [index, chapter] of chapters.entries()) {
    const key = `${chapter.location.lat.toFixed(3)}:${chapter.location.lng.toFixed(3)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.indices.push(index);
      continue;
    }
    groups.set(key, {
      lat: chapter.location.lat,
      lng: chapter.location.lng,
      indices: [index],
    });
  }
  return [...groups.values()];
}

function nextIndexForPin(indices: number[], activeIndex: number): number {
  const position = indices.indexOf(activeIndex);
  if (position >= 0) {
    return indices[(position + 1) % indices.length];
  }
  return indices.find((index) => index > activeIndex) ?? indices[0];
}

function refreshPins(
  map: MapLibreMap,
  chapters: Chapter[],
  activeIndex: number,
  markers: { current: Marker[] },
  onSelect: (index: number) => void,
) {
  markers.current.forEach((marker) => marker.remove());
  markers.current = pinGroups(chapters).map((group) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "journey-pin";
    el.dataset.active = String(
      activeIndex >= 0 && group.indices.includes(activeIndex),
    );
    el.dataset.visited = String(
      activeIndex >= 0 && group.indices.some((index) => index < activeIndex),
    );
    el.setAttribute(
      "aria-label",
      chapters[group.indices[0]]?.location.name ?? "Place",
    );
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect(nextIndexForPin(group.indices, activeIndex));
    });
    return new Marker({ element: el, anchor: "center" })
      .setLngLat([group.lng, group.lat])
      .addTo(map);
  });
}

function lineFeature(coordinates: [number, number][]): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

function featureCollection(
  features: GeoJSON.Feature[],
): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features };
}

function refreshArcs(
  map: MapLibreMap,
  chapters: Chapter[],
  activeIndex: number,
  reducedMotion: boolean,
  arcFrame: { current: number },
) {
  window.cancelAnimationFrame(arcFrame.current);

  const past: GeoJSON.Feature[] = [];
  let live: [number, number][] | null = null;
  const last = Math.min(activeIndex, chapters.length - 1);
  for (let index = 0; index < last; index++) {
    const from = chapters[index];
    const to = chapters[index + 1];
    if (isSamePin(from.location, to.location)) continue;
    const points = greatCircle(from.location, to.location);
    if (index === activeIndex - 1) live = points;
    else past.push(lineFeature(points));
  }

  const pastSource = map.getSource("arcs-past") as GeoJSONSource | undefined;
  const liveSource = map.getSource("arcs-live") as GeoJSONSource | undefined;
  pastSource?.setData(featureCollection(past));

  if (!live || !liveSource) {
    liveSource?.setData(EMPTY);
    return;
  }

  if (reducedMotion) {
    liveSource.setData(featureCollection([lineFeature(live)]));
    return;
  }

  const points = live;
  const began = performance.now();
  const duration = 1150;

  const tick = (now: number) => {
    const t = Math.min(1, (now - began) / duration);
    const count = Math.max(2, Math.floor(t * points.length));
    liveSource.setData(
      featureCollection([lineFeature(points.slice(0, count))]),
    );
    if (t < 1) arcFrame.current = window.requestAnimationFrame(tick);
  };
  arcFrame.current = window.requestAnimationFrame(tick);
}
