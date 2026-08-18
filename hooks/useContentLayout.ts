"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  TITLE_MAX_PX,
  TITLE_MIN_PX,
  maxFontSizeForTwoLines,
  resolveTitleLayout,
  wrapLineCount,
  type ContentLayoutMode,
} from "@/lib/titleLayout";

export type { ContentLayoutMode };

/** Desktop story pane plus playback chrome. Keep in step with --journey-story-min. */
const MIN_PANEL_HEIGHT = 260;

type UseContentLayoutOptions = {
  enabled: boolean;
  titles: string[];
  titleRef: RefObject<HTMLElement | null>;
  timelineRef: RefObject<HTMLElement | null>;
  overheadRef: RefObject<HTMLElement | null>;
};

type TitleLayoutState = {
  mode: ContentLayoutMode;
  fontSize: number | null;
};

let measureCanvas: HTMLCanvasElement | null = null;

function canvasLineCount(
  title: string,
  fontSize: number,
  width: number,
  fontFamily: string,
): number {
  if (typeof document === "undefined") return 1;
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return 3;

  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.letterSpacing = `${fontSize * -0.025}px`;
  return wrapLineCount(title, width, (text) => ctx.measureText(text).width);
}

function readFontFamily(title: HTMLElement): string {
  const fromTitle = getComputedStyle(title).fontFamily;
  if (fromTitle && fromTitle !== "serif") return fromTitle;
  return getComputedStyle(document.documentElement).getPropertyValue(
    "--font-syne",
  ) || "Syne, sans-serif";
}

function titleColumnWidth(): number {
  const rem =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Math.min(36 * rem, window.innerWidth * 0.382 - 3.5 * rem);
}

export function useContentLayout({
  enabled,
  titles,
  titleRef,
  timelineRef,
  overheadRef,
}: UseContentLayoutOptions) {
  const [layout, setLayout] = useState<TitleLayoutState>({
    mode: "default",
    fontSize: null,
  });
  const titlesKey = titles.join("\0");
  const titlesRef = useRef(titles);
  titlesRef.current = titles;

  useLayoutEffect(() => {
    if (!enabled) {
      setLayout({ mode: "default", fontSize: null });
      return;
    }

    let frame = 0;
    let retryTimer = 0;
    let cancelled = false;

    const resolve = () => {
      if (cancelled) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (cancelled) return;

        const title = titleRef.current;
        const timeline = timelineRef.current;
        if (!title || !timeline) {
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(resolve, 50);
          return;
        }

        const width = titleColumnWidth();
        if (width < 8) {
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(resolve, 50);
          return;
        }

        const fontFamily = readFontFamily(title);
        const widthFitSize = maxFontSizeForTwoLines(
          titlesRef.current,
          width,
          (text, size, column) =>
            canvasLineCount(text, size, column, fontFamily),
          TITLE_MIN_PX,
          TITLE_MAX_PX,
        );

        const overhead = overheadRef.current;
        const availableBelowOverhead =
          timeline.getBoundingClientRect().top -
          (overhead
            ? overhead.getBoundingClientRect().bottom
            : title.getBoundingClientRect().top);

        const next = resolveTitleLayout({
          widthFitSize,
          availableBelowOverhead,
          minPanel: MIN_PANEL_HEIGHT,
        });

        const fontSize = Math.round(next.fontSize * 2) / 2;
        setLayout((prev) =>
          prev.mode === next.mode && prev.fontSize === fontSize
            ? prev
            : { mode: next.mode, fontSize },
        );
      });
    };

    resolve();
    window.addEventListener("resize", resolve);
    document.fonts?.ready.then(resolve).catch(() => undefined);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(retryTimer);
      window.removeEventListener("resize", resolve);
    };
  }, [enabled, titlesKey, titleRef, timelineRef, overheadRef]);

  return layout;
}
