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
  onStart: () => void;
  onEnd: () => void;
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
  onStart,
  onEnd,
}: ChapterControlsProps) {
  const atStart = started && activeIndex === 0;
  const atEnd = started && activeIndex === chapterCount - 1;
  const position = started ? `${activeIndex + 1} / ${chapterCount}` : `0 / ${chapterCount}`;
  const btn =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/40 disabled:opacity-30 min-[360px]:h-11 min-[360px]:w-11 md:h-10 md:w-10";

  return (
    <div
      role="toolbar"
      aria-label="Chapter playback"
      className={`flex shrink-0 items-center justify-between gap-1.5 overflow-x-clip px-2 py-1.5 min-[360px]:gap-2 md:gap-3 md:px-4 md:py-3 ${attached ? "border-t border-white/10" : ""}`}
    >
      <div className="flex items-center gap-0.5 min-[360px]:gap-1 md:gap-1.5">
        <button
          type="button"
          onClick={onStart}
          disabled={atStart}
          aria-label="Jump to the first chapter"
          title="First chapter (W or arrow up)"
          className={btn}
        >
          <FirstIcon />
        </button>
        <button
          type="button"
          onClick={onPrev}
          disabled={!started || activeIndex === 0}
          aria-label="Previous chapter"
          title="Previous chapter (A or left arrow)"
          className={btn}
        >
          <SkipIcon flipped />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause (Space)" : "Play (Space)"}
          className="grid h-10 w-10 place-items-center rounded-full bg-[var(--coral)] text-white shadow-[0_8px_30px_rgba(232,93,76,0.35)] transition hover:scale-105 active:scale-95 min-[360px]:h-11 min-[360px]:w-11 md:h-10 md:w-10"
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
        <button
          type="button"
          onClick={onEnd}
          aria-label="Jump to contact"
          title="Contact (S or bottom arrow)"
          className={btn}
        >
          <LastIcon />
        </button>
      </div>

      <div className="min-w-0 shrink-0 text-right">
        <p className="font-mono text-[11px] tabular-nums text-white/55">{position}</p>
        <p className="mt-0.5 hidden text-[10px] tracking-[0.16em] text-white/35 uppercase md:block">
          A D step · W S jump
        </p>
      </div>
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

function FirstIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="1.4" y="2.5" width="1.6" height="9" />
      <path d="M13 2.5v9L8.4 7 13 2.5Z" />
      <path d="M8.8 2.5v9L4.2 7 8.8 2.5Z" />
    </svg>
  );
}

function LastIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M1 2.5v9L5.6 7 1 2.5Z" />
      <path d="M5.2 2.5v9L9.8 7 5.2 2.5Z" />
      <rect x="11" y="2.5" width="1.6" height="9" />
    </svg>
  );
}
