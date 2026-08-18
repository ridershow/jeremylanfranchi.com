"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ContentLayoutMode = "default" | "compact" | "side";

/** Desktop story pane plus playback chrome. Keep in step with --journey-story-min. */
const MIN_PANEL_HEIGHT = 260;
const TITLE_COMPACT_SCALE = 0.68;
const PANEL_STACK_EXTRA = 120;
const BELOW_TITLE_GAP = 20;

const MODE_RANK: Record<ContentLayoutMode, number> = {
  default: 0,
  compact: 1,
  side: 2,
};

function isPanelReadable(panel: HTMLElement, timelineTop: number): boolean {
  const { top, bottom, height } = panel.getBoundingClientRect();
  if (height < 8) return false;
  const visibleBottom = Math.min(bottom, timelineTop - 12);
  const visibleHeight = visibleBottom - top;
  return visibleHeight >= MIN_PANEL_HEIGHT && top < timelineTop - 12;
}

function projectedTitleHeights(
  title: HTMLElement,
  currentMode: ContentLayoutMode,
): { default: number; compact: number } {
  const measured = title.getBoundingClientRect().height;
  const defaultHeight =
    currentMode === "compact" ? measured / TITLE_COMPACT_SCALE : measured;
  return {
    default: defaultHeight,
    compact: defaultHeight * TITLE_COMPACT_SCALE,
  };
}

function panelStackNeeded(): number {
  return MIN_PANEL_HEIGHT + PANEL_STACK_EXTRA;
}

function resolveModeFromGeometry(
  title: HTMLElement,
  timeline: HTMLElement,
  overhead: HTMLElement | null,
  currentMode: ContentLayoutMode,
): ContentLayoutMode {
  const timelineTop = timeline.getBoundingClientRect().top;
  const titleAnchor = overhead
    ? overhead.getBoundingClientRect().bottom
    : title.getBoundingClientRect().top;
  const needed = panelStackNeeded();
  const { default: titleDefault, compact: titleCompact } =
    projectedTitleHeights(title, currentMode);

  const belowAtDefault =
    timelineTop - titleAnchor - titleDefault - BELOW_TITLE_GAP;
  const belowAtCompact =
    timelineTop - titleAnchor - titleCompact - BELOW_TITLE_GAP;

  if (belowAtDefault >= needed) return "default";
  if (belowAtCompact >= needed) return "compact";
  return "side";
}

type UseContentLayoutOptions = {
  enabled: boolean;
  contentKey: string;
  titleRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  timelineRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  overheadRef: RefObject<HTMLElement | null>;
};

export function useContentLayout({
  enabled,
  contentKey,
  titleRef,
  panelRef,
  timelineRef,
  contentRef,
  overheadRef,
}: UseContentLayoutOptions) {
  const [mode, setMode] = useState<ContentLayoutMode>("default");
  const modeRef = useRef<ContentLayoutMode>("default");

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (enabled) setMode("default");
  }, [contentKey, enabled]);

  useLayoutEffect(() => {
    if (!enabled) {
      setMode("default");
      return;
    }

    let frame = 0;
    let retryTimer = 0;
    let cancelled = false;
    let observedPanel: Element | null = null;

    const resolve = () => {
      if (cancelled) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (cancelled) return;

        requestAnimationFrame(() => {
          if (cancelled) return;

          const title = titleRef.current;
          const panel = panelRef.current;
          const timeline = timelineRef.current;

          if (!title || !timeline) {
            window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(resolve, 50);
            return;
          }

          const timelineTop = timeline.getBoundingClientRect().top;
          const current = modeRef.current;
          let next = resolveModeFromGeometry(
            title,
            timeline,
            overheadRef.current,
            current,
          );
          const deEscalating = MODE_RANK[next] < MODE_RANK[current];

          if (
            !deEscalating &&
            current !== "side" &&
            panel &&
            next !== "side" &&
            !isPanelReadable(panel, timelineTop)
          ) {
            next = next === "default" ? "compact" : "side";
          }

          setMode((prev) => (prev === next ? prev : next));
        });
      });
    };

    const observer = new ResizeObserver(() => resolve());

    const bind = () => {
      for (const ref of [titleRef, timelineRef, contentRef, overheadRef]) {
        if (ref.current) observer.observe(ref.current);
      }
      const panel = panelRef.current;
      if (panel !== observedPanel) {
        if (observedPanel) observer.unobserve(observedPanel);
        if (panel) observer.observe(panel);
        observedPanel = panel;
      }
      resolve();
    };

    bind();

    window.addEventListener("resize", resolve);
    document.fonts?.ready.then(resolve).catch(() => undefined);

    const retry = window.setInterval(bind, 150);
    window.setTimeout(() => window.clearInterval(retry), 1500);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(retryTimer);
      window.clearInterval(retry);
      observer.disconnect();
      window.removeEventListener("resize", resolve);
    };
  }, [
    enabled,
    contentKey,
    titleRef,
    panelRef,
    timelineRef,
    contentRef,
    overheadRef,
  ]);

  return mode;
}
