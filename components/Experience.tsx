"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChapterControls } from "@/components/chapter/ChapterControls";
import { ChapterPanel, ReadToggle } from "@/components/chapter/ChapterPanel";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Timeline } from "@/components/timeline/Timeline";
import { useJourney } from "@/hooks/useJourney";
import { useContentLayout } from "@/hooks/useContentLayout";
import { useViewport } from "@/hooks/useMedia";
import {
  isSamePin,
  paddingFromRects,
  type MapPadding,
} from "@/lib/geo";
import { tenureFor } from "@/lib/tenure";
import type { Chapter, Profile } from "@/lib/types";

const GlobeCanvas = dynamic(() => import("@/components/globe/GlobeCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#07080c]" />,
});

type ExperienceProps = {
  chapters: Chapter[];
  profile: Profile;
};

function IntroPanelBody({
  profile,
  reading = false,
  onToggleReading,
}: {
  profile: Profile;
  reading?: boolean;
  onToggleReading?: () => void;
}) {
  const [motto, ...rest] = profile.intro;

  return (
    <>
      {!reading ? (
        <div className="px-4 py-3 md:hidden">
          {motto ? (
            <p className="text-sm leading-[1.65] text-[var(--coral)]">{motto}</p>
          ) : null}
          {rest[0] ? (
            <p className="mt-2 line-clamp-3 text-sm leading-[1.65] text-white/78">
              {rest[0]}
            </p>
          ) : null}
          <ReadToggle expanded={false} onClick={onToggleReading} />
        </div>
      ) : null}
      <div
        className={`chapter-panel min-h-0 overflow-y-auto overscroll-contain px-4 py-4 text-sm leading-[1.7] text-white/82 md:px-5 md:py-5 md:text-base md:leading-[1.65] md:text-white/78 ${
          reading ? "flex-1" : "hidden flex-1 md:block"
        }`}
      >
        {reading ? <ReadToggle expanded onClick={onToggleReading} /> : null}
        {profile.intro.map((paragraph, introIndex) => (
          <p
            key={paragraph.slice(0, 24)}
            className={introIndex === 0 ? "text-[var(--coral)]" : "mt-4"}
          >
            {paragraph}
          </p>
        ))}
        <p className="mt-4 hidden text-white/60 md:block">
          Drag the globe, tap a pin, or step through chapters with A and D or
          keyboard arrows.
        </p>
        <p className="mt-4 text-white/60 md:hidden">
          Drag the globe, tap a pin, or step with the controls.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
          >
            See skills
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export function Experience({ chapters, profile }: ExperienceProps) {
  const router = useRouter();
  const goContact = useCallback(() => {
    router.push("/contact");
  }, [router]);
  const {
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
  } = useJourney(chapters.length, goContact);
  const { phone } = useViewport();
  const frameRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overheadRef = useRef<HTMLDivElement>(null);
  const [mapPadding, setMapPadding] = useState<MapPadding | null>(null);
  const [reading, setReading] = useState(false);

  const chapter = chapters[index];
  const collapsed = playing;
  const textFirst = phone && reading && !playing;
  const layoutMode = useContentLayout({
    enabled: !phone && !collapsed,
    contentKey: `${started ? chapter.slug : "orbit"}-${index}`,
    titleRef,
    panelRef,
    timelineRef,
    contentRef,
    overheadRef,
  });
  const sidePanel = layoutMode === "side";
  const compactTitle = layoutMode === "compact";

  const toggleReading = useCallback(() => {
    setReading((open) => {
      if (!open) setPlaying(false);
      return !open;
    });
  }, [setPlaying]);

  useEffect(() => {
    if (playing || !phone) setReading(false);
  }, [playing, phone]);

  useEffect(() => {
    if (!reading) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReading(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reading]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index, reading]);

  useEffect(() => {
    const frame = frameRef.current;
    const well = wellRef.current;
    if (!frame || !well || !phone || textFirst) {
      setMapPadding(null);
      return;
    }

    const measure = () => {
      setMapPadding(paddingFromRects(
        frame.getBoundingClientRect(),
        well.getBoundingClientRect(),
      ));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(well);
    return () => observer.disconnect();
  }, [phone, collapsed, started, textFirst]);

  if (!chapter) return null;

  const previous = index > 0 ? chapters[index - 1] : undefined;
  const relocating =
    playing &&
    (index === 0 || !previous || !isSamePin(previous.location, chapter.location));
  const tenure = tenureFor(chapters, index);
  const previousTenure = previous
    ? tenureFor(chapters, index - 1)
    : undefined;
  const sameCompanyMove = Boolean(
    tenure && previousTenure && tenure.company === previousTenure.company,
  );
  const attribBottom = phone && mapPadding ? mapPadding.bottom + 8 : 96;

  return (
    <div
      ref={frameRef}
      className="relative h-dvh w-full overflow-hidden bg-[#07080c] text-white"
      style={{ "--map-chrome-bottom": `${attribBottom}px` } as CSSProperties}
    >
      <div className="absolute inset-0">
        <GlobeCanvas
          chapters={chapters}
          activeIndex={index}
          started={started}
          onSelect={goTo}
          reducedMotion={reducedMotion}
          padding={phone ? mapPadding : null}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(7,8,12,0.92)_0%,rgba(7,8,12,0.78)_28%,rgba(7,8,12,0.42)_38.2%,rgba(7,8,12,0.12)_52%,transparent_68%)] md:block" />
      <div
        className={`pointer-events-none absolute inset-0 md:hidden ${
          textFirst
            ? "bg-[linear-gradient(180deg,rgba(7,8,12,0.42)_0%,rgba(7,8,12,0.18)_22%,rgba(7,8,12,0.28)_48%,rgba(7,8,12,0.62)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(7,8,12,0.55)_0%,rgba(7,8,12,0.12)_18%,transparent_32%,rgba(7,8,12,0.35)_58%,rgba(7,8,12,0.92)_78%,rgba(7,8,12,0.97)_100%)]"
        }`}
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:p-6 lg:px-10">
          <Wordmark profile={profile} />
        </div>

        <div
          ref={wellRef}
          className={
            textFirst
              ? "h-0 shrink-0 overflow-hidden md:hidden"
              : "min-h-[160px] flex-1 md:hidden"
          }
        />

        <div
          ref={contentRef}
          className={`flex min-h-0 overflow-hidden px-4 md:px-8 lg:px-10 ${
            textFirst
              ? "min-h-0 flex-1 flex-col"
              : collapsed
                ? "shrink-0 max-md:max-h-[46%] flex-col md:min-h-0 md:flex-1"
                : sidePanel
                  ? "shrink-0 flex-col md:min-h-0 md:flex-1 md:flex-row md:items-start md:justify-between md:gap-8"
                  : "shrink-0 flex-col md:min-h-0 md:flex-1"
          }`}
        >
          <div
            className={`flex min-h-0 flex-col ${
              sidePanel
                ? "md:max-w-[min(36rem,calc(38.2vw-3.5rem))] md:shrink-0"
                : "min-h-0 w-full flex-1 overflow-hidden md:max-w-[min(36rem,calc(38.2vw-3.5rem))]"
            }`}
          >
            <div ref={overheadRef} className="shrink-0">
              <motion.p
                key={started ? "tagline" : "orbit-kicker"}
                initial={reducedMotion ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`text-[11px] tracking-[0.22em] text-white/55 uppercase ${
                  textFirst ? "max-md:hidden" : ""
                }`}
              >
                {started ? (
                  profile.tagline
                ) : (
                  <>
                    <span className="md:hidden">{profile.tagline}</span>
                    <span className="hidden md:inline">{profile.kicker}</span>
                  </>
                )}
              </motion.p>

              {relocating ? (
                <div className="mt-2 md:mt-5">
                  <p className="text-[11px] tracking-[0.2em] text-[var(--coral)] uppercase">
                    Now flying
                  </p>
                  <p className="mt-1 text-base text-white md:text-lg">
                    {chapter.location.name}
                  </p>
                </div>
              ) : playing ? (
                <div className="mt-2 md:mt-5">
                  <p className="text-[11px] tracking-[0.2em] text-[var(--coral)] uppercase">
                    {sameCompanyMove
                      ? "Same pin · new title"
                      : chapter.company
                        ? "Same pin · new brief"
                        : "Same pin"}
                  </p>
                  <p className="mt-1 text-base text-white md:text-lg">
                    {chapter.company ?? chapter.location.name}
                  </p>
                </div>
              ) : null}
            </div>

            <motion.h1
              ref={titleRef}
              key={started ? chapter.slug : "orbit-title"}
              initial={reducedMotion ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 260, damping: 24 }
              }
              className={`font-display mt-1 shrink-0 leading-[0.9] font-semibold tracking-tight text-balance md:mt-3 ${
                compactTitle
                  ? "text-[clamp(1.7rem,7.2vw,2.35rem)] md:text-[clamp(1.8rem,4vw,3.25rem)]"
                  : "text-[clamp(1.7rem,7.2vw,2.35rem)] md:text-[clamp(2.4rem,5.4vw,4.75rem)]"
              } ${chapter.company ? "max-w-[16ch]" : "max-w-[12ch]"}`}
            >
              {started ? chapter.title : "Earth"}
            </motion.h1>

            {started && !sidePanel ? (
              <ChapterPanel
                chapters={chapters}
                chapter={chapter}
                activeIndex={index}
                reducedMotion={reducedMotion}
                collapsed={collapsed}
                playing={playing}
                reading={reading}
                layoutMode={layoutMode}
                panelRef={panelRef}
                onGoTo={goTo}
                onPrev={prev}
                onNext={next}
                onTogglePlay={togglePlay}
                onStart={goStart}
                onEnd={goEnd}
                onToggleReading={toggleReading}
              />
            ) : !started ? (
              collapsed ? (
                <div className="pointer-events-auto mt-3 overflow-hidden border border-white/10 bg-[#07080c]/82">
                  <ChapterControls
                    attached={false}
                    playing={playing}
                    started={started}
                    activeIndex={index}
                    chapterCount={chapters.length}
                    onPrev={prev}
                    onNext={next}
                    onTogglePlay={togglePlay}
                    onStart={goStart}
                    onEnd={goEnd}
                  />
                </div>
              ) : !sidePanel ? (
                <div
                  ref={panelRef}
                  className={`pointer-events-auto mt-3 flex min-h-0 flex-col overflow-hidden border border-white/10 md:mt-5 ${
                    textFirst
                      ? "flex-1 bg-[#07080c]/58"
                      : "bg-[#07080c]/72 md:flex-1 md:bg-[#07080c]/82"
                  }`}
                >
                  <IntroPanelBody
                    profile={profile}
                    reading={reading}
                    onToggleReading={toggleReading}
                  />
                  <ChapterControls
                    attached
                    playing={playing}
                    started={started}
                    activeIndex={index}
                    chapterCount={chapters.length}
                    onPrev={prev}
                    onNext={next}
                    onTogglePlay={togglePlay}
                    onStart={goStart}
                    onEnd={goEnd}
                  />
                </div>
              ) : null
            ) : null}
          </div>

          {sidePanel && started ? (
            <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden md:max-w-[min(26rem,36vw)]">
              <ChapterPanel
                chapters={chapters}
                chapter={chapter}
                activeIndex={index}
                reducedMotion={reducedMotion}
                collapsed={collapsed}
                playing={playing}
                reading={reading}
                layoutMode={layoutMode}
                panelRef={panelRef}
                onGoTo={goTo}
                onPrev={prev}
                onNext={next}
                onTogglePlay={togglePlay}
                onStart={goStart}
                onEnd={goEnd}
                onToggleReading={toggleReading}
              />
            </div>
          ) : sidePanel && !started && !collapsed ? (
            <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden md:max-w-[min(26rem,36vw)]">
              <div
                ref={panelRef}
                className="flex min-h-0 flex-1 flex-col overflow-hidden border border-white/10 bg-[#07080c]/82"
              >
              <IntroPanelBody profile={profile} />
              <ChapterControls
                attached
                playing={playing}
                started={started}
                activeIndex={index}
                chapterCount={chapters.length}
                onPrev={prev}
                onNext={next}
                onTogglePlay={togglePlay}
                onStart={goStart}
                onEnd={goEnd}
              />
              </div>
            </div>
          ) : null}
        </div>

        <div
          ref={timelineRef}
          className="pointer-events-auto z-20 shrink-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-5"
        >
          <Timeline
            chapters={chapters}
            activeIndex={index}
            started={started}
            onGoTo={goTo}
            onContact={goContact}
          />
        </div>
      </div>
    </div>
  );
}
