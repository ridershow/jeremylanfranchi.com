"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useJourney(chapterCount: number, onBeyondEnd?: () => void) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const beyondEnd = useRef(onBeyondEnd);
  beyondEnd.current = onBeyondEnd;

  const goTo = useCallback(
    (nextIndex: number) => {
      setStarted(true);
      setIndex(Math.max(0, Math.min(chapterCount - 1, nextIndex)));
    },
    [chapterCount],
  );

  const next = useCallback(() => {
    setStarted((was) => {
      if (!was) return true;
      setIndex((current) => {
        if (current >= chapterCount - 1) {
          queueMicrotask(() => beyondEnd.current?.());
          return current;
        }
        return current + 1;
      });
      return true;
    });
  }, [chapterCount]);

  const prev = useCallback(() => {
    setStarted((was) => {
      if (!was) return false;
      setIndex((current) => Math.max(0, current - 1));
      return true;
    });
  }, []);

  const goStart = useCallback(() => {
    setPlaying(false);
    setStarted(true);
    setIndex(0);
  }, []);

  const goEnd = useCallback(() => {
    setPlaying(false);
    beyondEnd.current?.();
  }, []);

  const togglePlay = useCallback(() => {
    setStarted(true);
    setPlaying((current) => !current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const dwell = reducedMotion ? 3500 : 6200;
    const id = window.setTimeout(() => {
      setIndex((current) => {
        if (current >= chapterCount - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, dwell);
    return () => window.clearTimeout(id);
  }, [playing, index, chapterCount, reducedMotion]);

  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  const goStartRef = useRef(goStart);
  const goEndRef = useRef(goEnd);
  const togglePlayRef = useRef(togglePlay);
  nextRef.current = next;
  prevRef.current = prev;
  goStartRef.current = goStart;
  goEndRef.current = goEnd;
  togglePlayRef.current = togglePlay;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const inStoryScroll = Boolean(target?.closest(".chapter-panel"));

      if (event.code === "Space") {
        if (tag === "BUTTON" || tag === "A") return;
        event.preventDefault();
        togglePlayRef.current();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        nextRef.current();
      } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        prevRef.current();
      } else if (event.code === "KeyW" || (event.code === "ArrowUp" && !inStoryScroll)) {
        event.preventDefault();
        goStartRef.current();
      } else if (event.code === "KeyS" || (event.code === "ArrowDown" && !inStoryScroll)) {
        event.preventDefault();
        goEndRef.current();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    index,
    playing,
    started,
    setPlaying,
    togglePlay,
    goTo,
    next,
    prev,
    goStart,
    goEnd,
    reducedMotion,
  };
}
