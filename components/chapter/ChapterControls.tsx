"use client";

type ChapterControlsProps = {
  attached?: boolean;
  playing: boolean;
  started: boolean;
  activeIndex: number;
  chapterCount: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
};

export function ChapterControls({
  attached = false,
  playing,
  started,
  activeIndex,
  chapterCount,
  onPrev,
  onNext,
  onTogglePlay,
}: ChapterControlsProps) {
  const atEnd = started && activeIndex === chapterCount - 1;
  const position = started
    ? `${activeIndex + 1} / ${chapterCount}`
    : `0 / ${chapterCount}`;
  const playLabel = playing ? "Pause" : started ? "Play" : "Start";
  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/40 disabled:opacity-30 md:h-10 md:w-10";

  return (
    <div
      role="toolbar"
      aria-label="Chapter playback"
      className={`flex shrink-0 items-center justify-between gap-2 overflow-x-clip px-3 py-2 md:gap-3 md:px-4 md:py-3 ${attached ? "border-t border-[var(--border-subtle)]" : ""}`}
    >
      <div className="flex items-center gap-1 md:gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={!started || activeIndex === 0}
          aria-label="Previous chapter"
          title="Previous chapter (A or left arrow)"
          className={`${btn} max-md:hidden`}
        >
          <SkipIcon flipped />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playLabel}
          title={`${playLabel} (Space)`}
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--coral)] text-white shadow-[0_8px_30px_rgba(232,93,76,0.35)] transition hover:scale-105 active:scale-95 md:h-10 md:w-10"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={atEnd ? "Contact" : "Next chapter"}
          title={atEnd ? "Contact (D)" : "Next chapter (D or right arrow)"}
          className={btn}
        >
          <SkipIcon />
        </button>
      </div>

      <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
        {position}
      </p>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4 2.5v11l10-5.5L4 2.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="2" y="2" width="3.5" height="10" />
      <rect x="8.5" y="2" width="3.5" height="10" />
    </svg>
  );
}

function SkipIcon({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden
      className={flipped ? "-scale-x-100" : undefined}
    >
      <path d="M2 2.5v9l6.5-4.5L2 2.5Z" />
      <rect x="10" y="2.5" width="1.8" height="9" />
    </svg>
  );
}
