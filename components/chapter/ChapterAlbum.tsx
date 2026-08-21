"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Ref } from "react";
import type { Photo } from "@/lib/types";

type ChapterAlbumProps = {
  photos: Photo[];
  chapterTitle: string;
  open: boolean;
  phone?: boolean;
  reducedMotion: boolean;
  albumRef?: Ref<HTMLDivElement | null>;
  onToggle: () => void;
  onSelect: (index: number) => void;
};

export function ChapterAlbum({
  photos,
  chapterTitle,
  open,
  phone = false,
  reducedMotion,
  albumRef,
  onToggle,
  onSelect,
}: ChapterAlbumProps) {
  if (photos.length === 0) return null;

  const count = photos.length;
  const enter = reducedMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, stiffness: 280, damping: 30 };

  if (phone) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="filmstrip"
            ref={albumRef}
            initial={reducedMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
            transition={enter}
            className="pointer-events-auto absolute inset-x-2 bottom-2 max-h-full overflow-hidden border border-white/10 bg-[#07080c]/82"
            aria-label={`Album, ${count} photos`}
          >
            <AlbumHeader count={count} onHide={onToggle} compact />
            <div className="flex gap-2 overflow-x-auto overscroll-contain px-2 pb-2">
              {photos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => onSelect(index)}
                  className="relative h-16 w-24 shrink-0 overflow-hidden"
                  aria-label={photo.caption || `${chapterTitle} photo ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="reopen"
            type="button"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.2 }}
            onClick={onToggle}
            className="pointer-events-auto absolute right-2 bottom-2 border border-white/10 bg-[#07080c]/82 px-3 py-2 text-[11px] tracking-[0.18em] text-white/70 uppercase transition hover:text-[var(--coral)]"
            aria-expanded={false}
            aria-label={`Show album, ${count} photos`}
          >
            Photos · {count}
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="album"
          ref={albumRef}
          initial={reducedMotion ? false : { x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { x: 16, opacity: 0 }}
          transition={enter}
          className="pointer-events-auto absolute inset-y-0 right-4 z-10 flex w-[min(18rem,26vw)] min-h-0 flex-col overflow-hidden border border-white/10 bg-[#07080c]/82 md:right-8 lg:right-10"
          aria-label={`Album, ${count} photos`}
        >
          <AlbumHeader count={count} onHide={onToggle} />
          <div className="chapter-panel min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3">
            {photos.map((photo, index) => (
              <motion.figure
                key={photo.src}
                initial={reducedMotion ? false : { y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: reducedMotion ? 0 : 0.04 * index,
                  duration: reducedMotion ? 0.12 : 0.4,
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="block w-full overflow-hidden"
                  aria-label={
                    photo.caption || `${chapterTitle} photo ${index + 1}`
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
                {photo.caption ? (
                  <figcaption className="mt-1.5 text-[11px] tracking-wide text-white/40">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </motion.figure>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="reopen"
          type="button"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.2 }}
          onClick={onToggle}
          className="pointer-events-auto absolute top-1/2 right-0 z-20 -translate-y-1/2 border border-r-0 border-white/10 bg-[#07080c]/82 px-2.5 py-3 text-[11px] tracking-[0.18em] text-white/70 uppercase transition hover:text-[var(--coral)]"
          aria-expanded={false}
          aria-label={`Show album, ${count} photos`}
        >
          Photos · {count}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function AlbumHeader({
  count,
  onHide,
  compact = false,
}: {
  count: number;
  onHide: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 ${
        compact ? "px-2 py-1.5" : "px-3 py-2.5"
      }`}
    >
      <p className="text-[11px] tracking-[0.18em] text-white/50 uppercase">
        Album · {count}
      </p>
      <button
        type="button"
        onClick={onHide}
        className="text-[11px] tracking-[0.16em] text-white/55 uppercase transition hover:text-[var(--coral)]"
        aria-expanded
        aria-label="Hide album"
      >
        Hide
      </button>
    </div>
  );
}
