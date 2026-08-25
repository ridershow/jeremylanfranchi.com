"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { RefObject } from "react";
import { ChapterControls } from "@/components/chapter/ChapterControls";
import { formatRange } from "@/lib/dates";
import { tenureDuration, tenureFor, type TenureGroup } from "@/lib/tenure";
import { trackTheme } from "@/lib/tracks";
import type { ContentLayoutMode } from "@/hooks/useContentLayout";
import type { Chapter, Moment } from "@/lib/types";

type ChapterPanelProps = {
  chapters: Chapter[];
  chapter: Chapter;
  activeIndex: number;
  reducedMotion: boolean;
  collapsed: boolean;
  playing: boolean;
  reading?: boolean;
  layoutMode?: ContentLayoutMode;
  panelRef?: RefObject<HTMLDivElement | null>;
  onGoTo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onStart: () => void;
  onEnd: () => void;
  onToggleReading?: () => void;
};

export function ChapterPanel({
  chapters,
  chapter,
  activeIndex,
  reducedMotion,
  collapsed,
  playing,
  reading = false,
  layoutMode = "default",
  panelRef,
  onGoTo,
  onPrev,
  onNext,
  onTogglePlay,
  onStart,
  onEnd,
  onToggleReading,
}: ChapterPanelProps) {
  const paragraphs = chapter.body.split(/\n\n+/).filter(Boolean);
  const range = formatRange(
    chapter.start,
    chapter.end,
    chapter.dateLabel,
    chapter.ongoing,
  );
  const meta = [range, chapter.location.name].filter(Boolean);
  const tenure = tenureFor(chapters, activeIndex);

  const controls = (
    <ChapterControls
      attached={!collapsed}
      playing={playing}
      started
      activeIndex={activeIndex}
      chapterCount={chapters.length}
      onPrev={onPrev}
      onNext={onNext}
      onTogglePlay={onTogglePlay}
      onStart={onStart}
      onEnd={onEnd}
    />
  );

  const side = layoutMode === "side";

  const renderStory = () => (
    <>
      {tenure ? (
        <TenureTrack
          tenure={tenure}
          activeIndex={activeIndex}
          onGoTo={onGoTo}
        />
      ) : null}

      <div className="max-w-[65ch] space-y-4 text-sm leading-[1.7] text-white/82 md:text-base md:leading-[1.65] md:text-white/78">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <ChapterMoments
        moments={chapter.moments}
        reducedMotion={reducedMotion}
      />

      {activeIndex === chapters.length - 1 ? (
        <div className="mt-7 border-t border-white/10 pt-5">
          <p className="text-[11px] tracking-[0.2em] text-[var(--coral)] uppercase">
            End of the road
          </p>
          <p className="mt-2 text-base leading-[1.65] text-white/78">
            That&apos;s the story so far. If you want to work together,
            talk pictures, or just say hi —
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)]"
          >
            Say hello
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={`pointer-events-auto flex min-h-0 flex-col ${
        side
          ? "flex-1"
          : reading
            ? "mt-3 flex-1 md:mt-5"
            : "mt-3 md:mt-5 md:flex-1"
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!collapsed ? (
          <p
            className={`shrink-0 text-[11px] tracking-[0.18em] text-white/50 uppercase ${
              reading
                ? "line-clamp-2 md:hidden"
                : `hidden md:block ${side ? "md:text-right" : ""}`
            }`}
          >
            {meta.join(" · ")}
          </p>
        ) : null}

        <div
          ref={panelRef}
          className={`mt-3 flex min-h-0 flex-col overflow-hidden border border-white/10 md:mt-4 ${
            reading
              ? "flex-1 bg-[#07080c]/58 md:bg-[#07080c]/82"
              : "bg-[#07080c]/72 md:flex-1 md:bg-[#07080c]/82"
          }`}
        >
          {!collapsed && !reading ? (
            <div className="px-4 py-3 md:hidden">
              <p className="line-clamp-3 text-sm leading-[1.65] text-white/78">
                {paragraphs[0]}
              </p>
              <ReadToggle expanded={false} onClick={onToggleReading} />
            </div>
          ) : null}

          {!collapsed ? (
            <motion.div
              key={chapter.slug}
              initial={reducedMotion ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`chapter-panel min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5 md:py-5 ${
                reading ? "md:hidden" : "hidden md:block"
              }`}
            >
              {reading ? (
                <ReadToggle expanded onClick={onToggleReading} />
              ) : null}
              {renderStory()}
            </motion.div>
          ) : null}
          {controls}
        </div>
      </div>
    </div>
  );
}

export function ReadToggle({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick?: () => void;
}) {
  if (!onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)] ${
        expanded ? "mb-4" : "mt-3"
      }`}
    >
      {expanded ? "Fermer" : "Lire plus"}
      <span aria-hidden="true">{expanded ? "×" : "→"}</span>
    </button>
  );
}

type TenureTrackProps = {
  tenure: TenureGroup;
  activeIndex: number;
  onGoTo: (index: number) => void;
};

function CompanyName({
  tenure,
  color,
}: {
  tenure: TenureGroup;
  color: string;
}) {
  if (tenure.href) {
    return (
      <a
        href={tenure.href}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4"
        style={{ color, textDecorationColor: color }}
      >
        {tenure.company}
      </a>
    );
  }

  return (
    <p
      className="text-[11px] tracking-[0.2em] uppercase"
      style={{ color }}
    >
      {tenure.company}
    </p>
  );
}

function TenureTrack({ tenure, activeIndex, onGoTo }: TenureTrackProps) {
  const current = tenure.roles.findIndex((role) => role.index === activeIndex);
  const step = current >= 0 ? current + 1 : 1;
  const ladder = tenure.roles.length > 1;
  const duration = tenureDuration(tenure);
  const first = tenure.roles[0];
  const weights = tenure.roles.map((role) => roleWeight(role));
  const theme = trackTheme(tenure.track);
  const repeatTitle = first && first.chapter.title !== tenure.company;

  return (
    <div
      className="mb-6 border px-4 py-4"
      style={{
        borderColor: theme.fillActive,
        background: theme.fillMuted,
      }}
    >
      <div
        className="flex h-2 overflow-hidden"
        style={{ background: theme.fillMuted }}
        title={`${tenure.company} · ${theme.label} · ${duration}`}
      >
        {tenure.roles.map((role, index) => {
          const isActive = role.index === activeIndex;
          const isPast = role.index < activeIndex;
          return (
            <button
              key={role.chapter.slug}
              type="button"
              onClick={() => onGoTo(role.index)}
              title={`${role.chapter.title} · ${formatRange(
                role.chapter.start,
                role.chapter.end,
                role.chapter.dateLabel,
                role.chapter.ongoing,
              )}`}
              className="h-full min-w-[6px] transition"
              style={{
                flexGrow: weights[index],
                flexBasis: 0,
                background: isActive
                  ? theme.color
                  : isPast
                    ? theme.fillPast
                    : theme.fill,
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-2.5">
          {tenure.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenure.logo}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md object-contain"
            />
          ) : null}
          <CompanyName tenure={tenure} color={theme.color} />
        </div>
        <p className="shrink-0 text-[11px] tracking-[0.16em] text-white/40 uppercase">
          {theme.label} · {duration}
        </p>
      </div>
      {ladder ? (
        <p className="mt-1 text-[11px] tracking-[0.16em] text-white/35 uppercase">
          Role {step} of {tenure.roles.length}
        </p>
      ) : null}

      {ladder ? (
        <ol className="mt-4">
          {tenure.roles.map((role, index) => {
            const isActive = role.index === activeIndex;
            const isPast = role.index < activeIndex;
            const isLast = index === tenure.roles.length - 1;
            const range = formatRange(
              role.chapter.start,
              role.chapter.end,
              role.chapter.dateLabel,
              role.chapter.ongoing,
            );

            return (
              <li key={role.chapter.slug} className="flex gap-3">
                <div className="flex w-3 flex-col items-center">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45"
                    style={{
                      background: isActive
                        ? theme.color
                        : isPast
                          ? theme.fillPast
                          : "transparent",
                      boxShadow: isActive
                        ? `0 0 0 3px ${theme.fill}`
                        : `inset 0 0 0 1px ${isPast ? theme.fillPast : "rgba(255,255,255,0.35)"}`,
                    }}
                  />
                  {isLast ? null : (
                    <span className="mt-1 mb-1 w-px flex-1 bg-white/15" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onGoTo(role.index)}
                  aria-current={isActive ? "step" : undefined}
                  className={`min-w-0 flex-1 pb-4 text-left ${isLast ? "pb-0" : ""}`}
                >
                  <span
                    className={`block text-sm leading-5 ${isActive ? "font-medium text-white" : "text-white/70"}`}
                  >
                    {role.chapter.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] tracking-wide text-white/35 uppercase">
                    {range}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : first ? (
        <div className="mt-3">
          {repeatTitle ? (
            <p className="text-sm font-medium text-white">{first.chapter.title}</p>
          ) : null}
          <p className={`text-[11px] tracking-wide text-white/35 uppercase ${repeatTitle ? "mt-0.5" : ""}`}>
            {formatRange(
              first.chapter.start,
              first.chapter.end,
              first.chapter.dateLabel,
              first.chapter.ongoing,
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function roleWeight(role: TenureGroup["roles"][number]) {
  const start = new Date(`${role.chapter.start}T00:00:00`).getTime();
  const end = role.chapter.ongoing
    ? Date.now()
    : new Date(`${role.chapter.end}T00:00:00`).getTime();
  return Math.max(1, end - start);
}

type ChapterMomentsProps = {
  moments: Moment[];
  reducedMotion: boolean;
};

function ChapterMoments({ moments, reducedMotion }: ChapterMomentsProps) {
  if (moments.length === 0) return null;

  return (
    <div className="mt-7">
      <p className="text-[11px] tracking-[0.2em] text-white/35 uppercase">
        In this place
      </p>
      <ul className="mt-3">
        {moments.map((moment, index) => (
          <motion.li
            key={`${moment.title}-${moment.period ?? ""}`}
            initial={reducedMotion ? false : { y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.05 * index }}
            className="border-t border-white/10 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              {moment.href ? (
                <a
                  href={moment.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-white underline decoration-[var(--coral)] decoration-1 underline-offset-4"
                >
                  {moment.title}
                </a>
              ) : (
                <span className="font-medium text-white">{moment.title}</span>
              )}
              <span className="text-[11px] tracking-wide text-white/35 uppercase">
                {[moment.kind, moment.period].filter(Boolean).join(" · ")}
              </span>
            </div>
            {moment.body ? (
              <p className="mt-2 text-sm leading-6 text-white/55">
                {moment.body}
              </p>
            ) : null}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
