"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import type { Photo } from "@/lib/types";

type PhotoLightboxProps = {
  photos: Photo[];
  index: number;
  chapterTitle: string;
  reducedMotion: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function PhotoLightbox({
  photos,
  index,
  chapterTitle,
  reducedMotion,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const photo = photos[index];
  const many = photos.length > 1;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.code === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        onPrev();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  const label = photo.caption || `${chapterTitle} photo ${index + 1}`;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.2 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#07080c]/92 px-4 py-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 text-[11px] tracking-[0.18em] text-white/70 uppercase transition hover:text-[var(--coral)] md:right-8"
        aria-label="Close photo"
      >
        Close
      </button>

      {many ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            className="absolute top-1/2 left-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/40 md:left-8"
            aria-label="Previous photo"
          >
            <Chevron flipped />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            className="absolute top-1/2 right-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/40 md:right-8"
            aria-label="Next photo"
          >
            <Chevron />
          </button>
        </>
      ) : null}

      <figure
        className="flex max-h-full min-h-0 max-w-[min(92vw,72rem)] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={label}
          className="min-h-0 max-h-[min(78svh,calc(var(--app-height,100svh)-10rem))] max-w-full object-contain"
        />
        {photo.caption ? (
          <figcaption className="mt-3 max-w-[65ch] shrink-0 text-center text-[11px] tracking-wide text-white/55">
            {photo.caption}
          </figcaption>
        ) : null}
        {many ? (
          <p className="mt-2 font-mono text-[11px] tabular-nums text-white/35">
            {index + 1} / {photos.length}
          </p>
        ) : null}
      </figure>
    </motion.div>
  );
}

function Chevron({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden
      className={flipped ? "-scale-x-100" : undefined}
    >
      <path d="M4.2 2.4 9.8 7 4.2 11.6V2.4Z" />
    </svg>
  );
}
