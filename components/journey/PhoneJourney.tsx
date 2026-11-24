"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ChapterMoments, TenureTrack } from "@/components/chapter/ChapterPanel";
import { PhotoLightbox } from "@/components/chapter/PhotoLightbox";
import { Wordmark } from "@/components/chrome/Wordmark";
import { formatRange } from "@/lib/dates";
import { tenureFor } from "@/lib/tenure";
import type { Chapter, Profile } from "@/lib/types";

/** Section ids: -1 is the intro, 0..n-1 are chapters, n is the closing card. */
const INTRO = -1;
/** How far down the story sheet a card has to reach before it becomes active. */
const PROBE_RATIO = 0.3;
/** Let a flick come to rest before the globe starts flying. */
const SETTLE_MS = 300;
/** Fallback for browsers without `scrollend`. */
const PROGRAMMATIC_SCROLL_MS = 1200;

type PhoneJourneyProps = {
  chapters: Chapter[];
  profile: Profile;
  index: number;
  started: boolean;
  playing: boolean;
  reducedMotion: boolean;
  wellRef: RefObject<HTMLDivElement | null>;
  onGoTo: (index: number) => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onStopPlay: () => void;
};

type LightboxState = { chapter: number; photo: number } | null;

export function PhoneJourney({
  chapters,
  profile,
  index,
  started,
  playing,
  reducedMotion,
  wellRef,
  onGoTo,
  onReset,
  onTogglePlay,
  onStopPlay,
}: PhoneJourneyProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLElement>());
  const committed = useRef<number | null>(null);
  const programmatic = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const count = chapters.length;
  const target = started ? index : INTRO;

  const registerSection = useCallback(
    (id: number) => (node: HTMLElement | null) => {
      if (node) sectionRefs.current.set(id, node);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  const sectionAtProbe = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return INTRO;
    const probe = scroller.scrollTop + scroller.clientHeight * PROBE_RATIO;
    let active = INTRO;
    for (let id = INTRO; id <= count; id += 1) {
      const node = sectionRefs.current.get(id);
      if (node && node.offsetTop <= probe) active = id;
    }
    // The closing card keeps the last chapter on the globe.
    return Math.min(active, count - 1);
  }, [count]);

  // Scroll drives the journey: the card crossing the probe line becomes active.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const commit = () => {
      if (programmatic.current) return;
      const next = sectionAtProbe();
      if (next === committed.current) return;
      committed.current = next;
      if (next === INTRO) onReset();
      else onGoTo(next);
    };

    const onScroll = () => {
      if (programmatic.current) return;
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(commit, SETTLE_MS);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer.current);
    };
  }, [sectionAtProbe, onGoTo, onReset]);

  // A manual swipe takes over from autoplay.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !playing) return;
    const stop = () => onStopPlay();
    scroller.addEventListener("touchstart", stop, { passive: true });
    scroller.addEventListener("wheel", stop, { passive: true });
    return () => {
      scroller.removeEventListener("touchstart", stop);
      scroller.removeEventListener("wheel", stop);
    };
  }, [playing, onStopPlay]);

  // Anything else that moves the journey (pins, deep links, autoplay, role
  // ladder) scrolls the matching card into view.
  useEffect(() => {
    if (committed.current === target) return;
    const scroller = scrollerRef.current;
    const node = sectionRefs.current.get(target);
    if (!scroller || !node) return;

    const firstPlacement = committed.current === null;
    committed.current = target;
    programmatic.current = true;
    window.clearTimeout(settleTimer.current);

    let release = 0;
    const done = () => {
      programmatic.current = false;
      window.clearTimeout(release);
      scroller.removeEventListener("scrollend", done);
    };
    scroller.addEventListener("scrollend", done);
    release = window.setTimeout(done, PROGRAMMATIC_SCROLL_MS);

    scroller.scrollTo({
      top: target === INTRO ? 0 : node.offsetTop,
      behavior: firstPlacement || reducedMotion ? "auto" : "smooth",
    });
    if (firstPlacement) done();

    return done;
  }, [target, reducedMotion]);

  const lightboxChapter = lightbox ? chapters[lightbox.chapter] : undefined;
  const lightboxCount = lightboxChapter?.photos.length ?? 0;
  const progress = started ? (index + 1) / count : 0;
  const current = started ? chapters[index] : undefined;
  const [motto, ...introRest] = profile.intro;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(7,8,12,0.6)_0%,transparent_100%)]" />

      <div className="relative shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <Wordmark profile={profile} />
      </div>

      <div ref={wellRef} className="min-h-[18dvh] flex-[0_1_30dvh]" />

      <div className="pointer-events-auto relative flex min-h-0 flex-1 flex-col border-t border-[var(--border-subtle)] bg-[#07080c]/92 backdrop-blur-md">
        <div className="shrink-0 px-4 pt-2.5 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? "Pause" : "Play the journey"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--coral)] text-white shadow-[0_6px_20px_rgba(232,93,76,0.35)] transition active:scale-95"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <p className="min-w-0 flex-1 truncate text-xs tracking-[0.14em] text-white/80 uppercase">
              {current ? current.title : "Scroll to travel"}
            </p>
            <p className="shrink-0 font-mono text-xs tabular-nums text-[var(--text-muted)]">
              {started ? index + 1 : 0} / {count}
            </p>
          </div>
          <div
            className="mt-2 h-0.5 w-full bg-white/15"
            role="progressbar"
            aria-label="Journey progress"
            aria-valuemin={0}
            aria-valuemax={count}
            aria-valuenow={started ? index + 1 : 0}
          >
            <div
              className="h-full bg-[var(--coral)] transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="chapter-panel relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <h1 className="sr-only">Journey</h1>

          <section
            ref={registerSection(INTRO)}
            className="border-b border-[var(--border-subtle)] px-4 pt-5 pb-8"
          >
            <p className="text-xs tracking-[0.22em] text-[var(--text-muted)] uppercase">
              {profile.kicker}
            </p>
            <div className="mt-3 space-y-4 text-base leading-[1.65] text-white/82">
              {motto ? <p className="text-white">{motto}</p> : null}
              {introRest.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <Link
              href="/skills"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
            >
              See how I work
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-8 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--coral)] uppercase">
              Scroll to start the journey
              <span aria-hidden="true">↓</span>
            </p>
          </section>

          {chapters.map((chapter, chapterIndex) => (
            <ChapterCard
              key={chapter.slug}
              chapters={chapters}
              chapter={chapter}
              chapterIndex={chapterIndex}
              active={started && chapterIndex === index}
              reducedMotion={reducedMotion}
              sectionRef={registerSection(chapterIndex)}
              onGoTo={onGoTo}
              onPhoto={(photo) =>
                setLightbox({ chapter: chapterIndex, photo })
              }
            />
          ))}

          <section
            ref={registerSection(count)}
            className="min-h-[70%] px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
          >
            <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
              End of the road
            </p>
            <p className="mt-2 text-base leading-[1.65] text-white/78">
              That&apos;s the story so far. If you want to work together, talk
              pictures, or just say hi.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 bg-[var(--coral)] px-5 py-3 text-sm font-medium tracking-[0.14em] text-white uppercase transition active:scale-[0.98]"
            >
              Say hello
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>

      {lightbox && lightboxChapter && lightboxChapter.photos[lightbox.photo] ? (
        <div className="pointer-events-auto">
          <PhotoLightbox
            photos={lightboxChapter.photos}
            index={lightbox.photo}
            chapterTitle={lightboxChapter.title}
            reducedMotion={reducedMotion}
            onClose={() => setLightbox(null)}
            onPrev={() =>
              setLightbox((state) =>
                state
                  ? {
                      ...state,
                      photo: (state.photo + lightboxCount - 1) % lightboxCount,
                    }
                  : null,
              )
            }
            onNext={() =>
              setLightbox((state) =>
                state
                  ? { ...state, photo: (state.photo + 1) % lightboxCount }
                  : null,
              )
            }
          />
        </div>
      ) : null}
    </div>
  );
}

type ChapterCardProps = {
  chapters: Chapter[];
  chapter: Chapter;
  chapterIndex: number;
  active: boolean;
  reducedMotion: boolean;
  sectionRef: (node: HTMLElement | null) => void;
  onGoTo: (index: number) => void;
  onPhoto: (photo: number) => void;
};

function ChapterCard({
  chapters,
  chapter,
  chapterIndex,
  active,
  reducedMotion,
  sectionRef,
  onGoTo,
  onPhoto,
}: ChapterCardProps) {
  const paragraphs = chapter.body.split(/\n\n+/).filter(Boolean);
  const range = formatRange(
    chapter.start,
    chapter.end,
    chapter.dateLabel,
    chapter.ongoing,
  );
  const meta = [range, chapter.location.name].filter(Boolean).join(" · ");
  const tenure = tenureFor(chapters, chapterIndex);

  return (
    <section
      ref={sectionRef}
      id={`chapter-${chapter.slug}`}
      aria-current={active ? "step" : undefined}
      aria-labelledby={`chapter-${chapter.slug}-title`}
      className={`border-b border-[var(--border-subtle)] px-4 pt-6 pb-8 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-60"
      }`}
    >
      <p className="flex items-center gap-2 text-xs tracking-[0.22em] text-[var(--text-muted)] uppercase">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rotate-45 ${
            active ? "bg-[var(--coral)]" : "bg-white/30"
          }`}
        />
        <span className="truncate">
          {chapter.kicker || chapter.location.name}
        </span>
      </p>
      <h2
        id={`chapter-${chapter.slug}-title`}
        className="font-display mt-2 text-[clamp(1.6rem,7vw,2.1rem)] leading-[0.95] font-semibold tracking-tight text-balance"
      >
        {chapter.title}
      </h2>
      {meta ? (
        <p className="mt-2 text-[13px] text-[var(--text-muted)]">{meta}</p>
      ) : null}

      {tenure ? (
        <div className="mt-5">
          <TenureTrack
            tenure={tenure}
            activeIndex={chapterIndex}
            onGoTo={onGoTo}
          />
        </div>
      ) : null}

      <div className={`space-y-4 text-base leading-[1.65] text-white/82 ${tenure ? "" : "mt-4"}`}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      {chapter.photos.length > 0 ? (
        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto overscroll-x-contain px-4">
          {chapter.photos.map((photo, photoIndex) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => onPhoto(photoIndex)}
              className="relative h-24 w-36 shrink-0 overflow-hidden"
              aria-label={photo.caption || `${chapter.title} photo ${photoIndex + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <ChapterMoments moments={chapter.moments} reducedMotion={reducedMotion} />
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4 2.5v11l10-5.5L4 2.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="2" y="2" width="3.5" height="10" />
      <rect x="8.5" y="2" width="3.5" height="10" />
    </svg>
  );
}
