"use client";

import { useEffect } from "react";

function syncVisualViewport() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const top = vv?.offsetTop ?? 0;
  const height = vv?.height ?? window.innerHeight;
  root.style.setProperty("--app-top", `${top}px`);
  root.style.setProperty("--app-height", `${height}px`);
}

export function useVisualViewport() {
  useEffect(() => {
    syncVisualViewport();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncVisualViewport);
    vv?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);

    return () => {
      vv?.removeEventListener("resize", syncVisualViewport);
      vv?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
    };
  }, []);
}
