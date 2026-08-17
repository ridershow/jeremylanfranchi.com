"use client";

import { useCallback, useEffect, useState } from "react";

export function useReadingMode({
  phone,
  playing,
  onOpen,
}: {
  phone: boolean;
  playing: boolean;
  onOpen?: () => void;
}) {
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (playing || !phone) setReading(false);
  }, [playing, phone]);

  const toggleReading = useCallback(() => {
    setReading((open) => {
      const next = !open;
      if (next) onOpen?.();
      return next;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!reading) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReading(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reading]);

  return { reading, toggleReading };
}
