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
import { ChapterAlbum } from "@/components/chapter/ChapterAlbum";
import { ChapterControls } from "@/components/chapter/ChapterControls";
import { ChapterPanel } from "@/components/chapter/ChapterPanel";
import { PhotoLightbox } from "@/components/chapter/PhotoLightbox";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Timeline } from "@/components/timeline/Timeline";
import { useJourney } from "@/hooks/useJourney";
import { useContentLayout } from "@/hooks/useContentLayout";
import { useViewport } from "@/hooks/useMedia";
import {
  flyPadding,
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

function IntroPanelBody({ profile }: { profile: Profile }) {
  return (
    <div className="chapter-panel min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-sm leading-[1.65] text-white/78 md:px-5 md:py-5 md:text-base">
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
  );
}

export function Experience({ chapters, profile }: ExperienceProps) {
  const router = useRouter();
  const goContact = useCallback(() => {
    router.push("/contact");
  }, [router]);
  const [albumOpen, setAlbumOpen] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const {
    index,
    playing,
    started,
    togglePlay,
    goTo,
    next,
    prev,
    goStart,
    goEnd,
    reducedMotion,
  } = useJourney(chapters.length, goContact, lightboxIndex !== null);
  const { phone, short } = useViewport();
  const frameRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overheadRef = useRef<HTMLDivElement>(null);
  const [albumEl, setAlbumEl] = useState<HTMLDivElement | null>(null);
  const [mapPadding, setMapPadding] = useState<MapPadding | null>(null);

  const chapter = chapters[index];
  const collapsed = playing || (phone && short);
  const hasPhotos = Boolean(started && chapter && chapter.photos.length > 0);
  const albumChrome = hasPhotos && !collapsed;
  const albumVisible = albumChrome && albumOpen;
  const photoCount = chapter?.photos.length ?? 0;
  const measuredLayout = useContentLayout({
    enabled: !phone && !collapsed,
    contentKey: `${started ? (chapter?.slug ?? "orbit") : "orbit"}-${index}`,
    titleRef,
    panelRef,
    timelineRef,
    contentRef,
    overheadRef,
  });
  const layoutMode =
    albumVisible && measuredLayout === "side" ? "compact" : measuredLayout;
  const sidePanel = layoutMode === "side";
  const compactTitle = layoutMode === "compact";

  const [lightboxChapter, setLightboxChapter] = useState(index);
  if (lightboxChapter !== index) {
    setLightboxChapter(index);
    setLightboxIndex(null);
  }

  const toggleAlbum = useCallback(() => {
    setAlbumOpen((open) => !open);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || photoCount === 0) return null;
      return (current + photoCount - 1) % photoCount;
    });
  }, [photoCount]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || photoCount === 0) return null;
      return (current + 1) % photoCount;
    });
  }, [photoCount]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      setMapPadding(null);
      return;
    }

    const measure = () => {
      const album = albumEl;
      if (phone) {
        const well = wellRef.current;
        if (!well) {
          setMapPadding(null);
          return;
        }
        const frameRect = frame.getBoundingClientRect();
        const padding = paddingFromRects(frameRect, well.getBoundingClientRect());
        if (albumVisible && album) {
          const albumRect = album.getBoundingClientRect();
          padding.bottom = Math.max(
            padding.bottom,
            Math.round(frameRect.bottom - albumRect.top),
          );
        }
        setMapPadding(padding);
        return;
      }

      if (albumVisible && album) {
        const base = flyPadding();
        const frameRect = frame.getBoundingClientRect();
        const albumRect = album.getBoundingClientRect();
        setMapPadding({
          ...base,
          right: Math.max(
            base.right,
            Math.round(frameRect.right - albumRect.left),
          ),
        });
        return;
      }

      setMapPadding(null);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    if (wellRef.current) observer.observe(wellRef.current);
    if (albumEl) observer.observe(albumEl);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phone, collapsed, started, albumVisible, albumEl, index]);

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
          padding={phone || albumVisible ? mapPadding : null}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(7,8,12,0.92)_0%,rgba(7,8,12,0.78)_28%,rgba(7,8,12,0.42)_38.2%,rgba(7,8,12,0.12)_52%,transparent_68%)] md:block" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,12,0.55)_0%,rgba(7,8,12,0.12)_18%,transparent_32%,rgba(7,8,12,0.35)_58%,rgba(7,8,12,0.92)_78%,rgba(7,8,12,0.97)_100%)] md:hidden" />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:p-6 lg:px-10">
          <Wordmark profile={profile} />
        </div>

        <div
          ref={wellRef}
          className={
            collapsed
              ? "relative min-h-[160px] flex-1 md:hidden"
              : "relative h-[min(38dvh,220px)] shrink-0 md:hidden"
          }
        >
          {phone && albumChrome && chapter ? (
            <ChapterAlbum
              photos={chapter.photos}
              chapterTitle={chapter.title}
              open={albumOpen}
              phone
              reducedMotion={reducedMotion}
              albumRef={setAlbumEl}
              onToggle={toggleAlbum}
              onSelect={setLightboxIndex}
            />
          ) : null}
        </div>

        <div
          ref={contentRef}
          className={`flex min-h-0 overflow-hidden px-4 md:px-8 lg:px-10 ${
            collapsed
              ? "shrink-0 max-md:max-h-[46%] flex-col"
              : sidePanel
                ? "min-h-0 flex-1 flex-col md:flex-row md:items-start md:justify-between md:gap-8"
                : "min-h-0 flex-1 flex-col"
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
              {!playing ? (
                <motion.p
                  key={started ? `${chapter.slug}-kicker` : "orbit-kicker"}
                  initial={reducedMotion ? false : { y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[11px] tracking-[0.22em] text-white/55 uppercase"
                >
                  {started
                    ? chapter.kicker || chapter.location.name
                    : profile.kicker}
                </motion.p>
              ) : null}

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
                layoutMode={layoutMode}
                panelRef={panelRef}
                onGoTo={goTo}
                onPrev={prev}
                onNext={next}
                onTogglePlay={togglePlay}
                onStart={goStart}
                onEnd={goEnd}
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
                  className="pointer-events-auto mt-3 flex min-h-0 flex-1 flex-col overflow-hidden border border-white/10 bg-[#07080c]/82 md:mt-5"
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
                layoutMode={layoutMode}
                panelRef={panelRef}
                onGoTo={goTo}
                onPrev={prev}
                onNext={next}
                onTogglePlay={togglePlay}
                onStart={goStart}
                onEnd={goEnd}
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

      {!phone && albumChrome ? (
        <ChapterAlbum
          photos={chapter.photos}
          chapterTitle={chapter.title}
          open={albumOpen}
          reducedMotion={reducedMotion}
          albumRef={setAlbumEl}
          onToggle={toggleAlbum}
          onSelect={setLightboxIndex}
        />
      ) : null}

      {lightboxIndex !== null &&
      lightboxChapter === index &&
      chapter.photos[lightboxIndex] ? (
        <PhotoLightbox
          photos={chapter.photos}
          index={lightboxIndex}
          chapterTitle={chapter.title}
          reducedMotion={reducedMotion}
          onClose={closeLightbox}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
        />
      ) : null}
    </div>
  );
}
