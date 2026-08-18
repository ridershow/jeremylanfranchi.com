"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/types";
import { CLOSE_LABEL } from "@/components/chapter/ReadToggle";

export const PREV_PHOTO_LABEL = "Previous photo";
export const NEXT_PHOTO_LABEL = "Next photo";

type PhotoLightboxProps = {
  photos: Photo[];
  chapterTitle: string;
  openIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function PhotoLightbox({
  photos,
  chapterTitle,
  openIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = openIndex !== null;
  const photo = openIndex === null ? null : photos[openIndex];
  const gallery = photos.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || !gallery) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "ArrowLeft") onPrev();
      else onNext();
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, gallery, onPrev, onNext]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={photo?.caption || chapterTitle}
      className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-[#07080c]/80"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {photo ? (
        <div
          className="relative flex h-dvh w-dvw flex-col items-center justify-center bg-[#07080c]/92 px-12 py-16"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
          >
            {CLOSE_LABEL}
            <span aria-hidden="true">×</span>
          </button>

          {gallery ? (
            <button
              type="button"
              onClick={onPrev}
              aria-label={PREV_PHOTO_LABEL}
              className="absolute top-1/2 left-[max(0.75rem,env(safe-area-inset-left))] -translate-y-1/2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
            >
              ← Prev
            </button>
          ) : null}

          {gallery ? (
            <button
              type="button"
              onClick={onNext}
              aria-label={NEXT_PHOTO_LABEL}
              className="absolute top-1/2 right-[max(0.75rem,env(safe-area-inset-right))] -translate-y-1/2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
            >
              Next →
            </button>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.caption || chapterTitle}
            className="max-h-[100dvh] max-w-[100dvw] object-contain"
          />
          {photo.caption ? (
            <p className="mt-3 text-center text-[11px] tracking-wide text-white/40">
              {photo.caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
