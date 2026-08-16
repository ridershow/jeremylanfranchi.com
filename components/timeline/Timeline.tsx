"use client";

import {
  chapterIndexAtTime,
  chaptersTimeSpan,
  formatDuration,
  formatRange,
  positionOnTimeline,
  yearOf,
} from "@/lib/dates";
import {
  companyGroups,
  tenureDates,
  tenureDuration,
  tenureIndices,
  type TenureGroup,
} from "@/lib/tenure";
import { TRACK_ORDER, TRACKS, trackTheme } from "@/lib/tracks";
import type { Chapter } from "@/lib/types";

type TimelineProps = {
  chapters: Chapter[];
  activeIndex: number;
  started: boolean;
  onGoTo: (index: number) => void;
  onContact: () => void;
};

export function Timeline({
  chapters,
  activeIndex,
  started,
  onGoTo,
  onContact,
}: TimelineProps) {
  const active = started ? chapters[activeIndex] : undefined;
  const span = chaptersTimeSpan(chapters);
  const at = (iso: string) => positionOnTimeline(iso, span.start, span.duration);
  const playhead = started && active ? at(active.start) : 0;
  const tenures = companyGroups(chapters);
  const roleTicks = tenureIndices(chapters);
  const rails = placeRails(tenures, span);
  const packed = packOverlaps(rails);
  const labels = companyLabels(rails, started ? activeIndex : -1);
  const years = compactYearMarks(chapters, at);
  const activeLabel = active
    ? active.company
      ? `${active.company} · ${active.title}`
      : formatRange(active.start, active.end, active.dateLabel, active.ongoing)
    : null;

  const selectFromClientX = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (ratio >= 0.99) {
      onContact();
      return;
    }
    const t = span.start + ratio * span.duration;
    onGoTo(chapterIndexAtTime(t, chapters));
  };

  return (
    <div
      className="pointer-events-auto w-full overflow-x-clip rounded-xl border border-white/10 bg-[#07080c]/82 px-2 py-2 md:rounded-2xl md:px-5 md:py-3"
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/55 uppercase md:mb-2 md:items-baseline md:justify-between md:gap-3">
          <span className="hidden min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex">
            <span>{started ? "Travel with me" : "Pick a chapter"}</span>
            <span className="flex items-center gap-2.5 normal-case tracking-normal">
              {TRACK_ORDER.map((track) => (
                <span
                  key={track}
                  className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase"
                  style={{ color: TRACKS[track].color }}
                  title={TRACKS[track].label}
                >
                  <span
                    className="h-0.5 w-3"
                    style={{ background: TRACKS[track].color }}
                  />
                  <span>{TRACKS[track].label}</span>
                </span>
              ))}
            </span>
          </span>
          <span className="min-w-0 flex-1 truncate tracking-normal text-white/80 normal-case md:flex-none md:text-right md:tracking-[0.18em] md:normal-case md:uppercase">
            <span className="md:hidden">
              {activeLabel ?? "Pick a chapter"}
            </span>
            <span className="hidden md:inline">
              {activeLabel ?? "Land wherever you like"}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 md:hidden">
            {TRACK_ORDER.map((track) => (
              <span
                key={track}
                className="h-0.5 w-3"
                style={{ background: TRACKS[track].color }}
                title={TRACKS[track].label}
              />
            ))}
          </span>
        </div>

        <div className="px-2.5 md:px-0">
          <div
            role="slider"
            aria-label="Timeline"
            aria-valuemin={0}
            aria-valuemax={chapters.length}
            aria-valuenow={started ? activeIndex : 0}
            tabIndex={0}
            className="relative h-12 cursor-pointer touch-none md:h-16"
            onClick={(event) => selectFromClientX(event.clientX, event.currentTarget)}
          >
            <div className="absolute right-0 bottom-2.5 left-0 h-px bg-white/20" />
            {rails.map((rail) => {
              const duration = tenureDuration(rail.group);
              const theme = trackTheme(rail.group.track);
              const sublane = packed.sublane.get(rail.group) ?? 0;
              const isActive =
                started &&
                (rail.group.roles.some((role) => role.index === activeIndex) ||
                  chapterOverlapsTenure(chapters[activeIndex], rail.group));
              const wide = rail.right - rail.left > 0.07;
              return (
                <button
                  key={`${rail.group.company}-${rail.group.startIndex}`}
                  type="button"
                  title={`${rail.group.company} · ${theme.label} · ${duration}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onGoTo(rail.group.roles[0]?.index ?? 0);
                  }}
                  className="absolute flex h-1.5 min-w-1 -translate-y-1/2 items-center overflow-hidden max-md:pointer-events-none md:h-2.5 md:min-w-1.5"
                  style={{
                    left: `${rail.left * 100}%`,
                    width: `${Math.max(0, (rail.right - rail.left) * 100)}%`,
                    top: `calc(var(--track-${rail.group.track}) + ${sublane} * var(--track-sublane) + 2px)`,
                    background: isActive ? theme.fillActive : theme.fill,
                  }}
                >
                  {wide ? (
                    <span
                      className="hidden truncate px-1 text-[8px] leading-none tracking-[0.12em] uppercase md:inline"
                      style={{ color: theme.color }}
                    >
                      {rail.group.company}
                    </span>
                  ) : null}
                </button>
              );
            })}
            <div
              className="absolute bottom-2.5 left-0 h-0.5 bg-[var(--coral)]"
              style={{ width: started ? `${playhead * 100}%` : "0%" }}
            />
            {chapters.map((chapter, index) => {
              const left = at(chapter.start);
              const isActive = started && index === activeIndex;
              const isRole = roleTicks.has(index);
              const theme = chapter.track ? trackTheme(chapter.track) : null;
              return (
                <button
                  key={chapter.slug}
                  type="button"
                  title={
                    chapter.company
                      ? `${chapter.company} · ${chapter.title} · ${formatDuration(chapter.start, chapter.end, chapter.ongoing)}`
                      : chapter.title
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onGoTo(index);
                  }}
                  className="absolute bottom-2.5 flex h-2 w-2 items-center justify-center max-md:pointer-events-none md:h-3 md:w-3"
                  style={{
                    left: `${left * 100}%`,
                    transform: "translate(-50%, 50%)",
                  }}
                >
                  <span
                    className={`h-2 w-2 border md:h-3 md:w-3 ${isRole ? "rounded-sm" : "rounded-full"}`}
                    style={{
                      borderColor: theme ? theme.color : "rgba(255,255,255,0.7)",
                      background: isActive
                        ? (theme?.color ?? "var(--coral)")
                        : started && index < activeIndex
                          ? (theme?.fillPast ?? "#f3b4ab")
                          : "#f4f0ea",
                      transform: `${isRole ? "rotate(45deg) " : ""}scale(${isActive ? 1.35 : 1})`,
                    }}
                  />
                </button>
              );
            })}
            <button
              type="button"
              title="Say hello"
              onClick={(event) => {
                event.stopPropagation();
                onContact();
              }}
              className="absolute bottom-2.5 flex h-2 w-2 translate-y-1/2 items-center justify-center max-md:-translate-x-full max-md:pointer-events-none md:h-3 md:w-3 md:-translate-x-1/2"
              style={{ left: "100%" }}
            >
              <span className="h-2 w-2 rounded-full border border-[var(--coral)] bg-transparent transition hover:bg-[var(--coral)] md:h-3 md:w-3" />
            </button>
            {started ? (
              <div
                className="pointer-events-none absolute bottom-2.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--coral)]"
                style={{
                  left: `${playhead * 100}%`,
                  transform: "translate(-50%, 50%)",
                }}
              />
            ) : null}
          </div>

          <div className="relative mt-0.5 h-4 md:hidden">
            {years.map((mark) => (
              <span
                key={mark.slug}
                className={`absolute font-mono text-[9px] text-white/40 ${
                  mark.left < 0.03 ? "" : "-translate-x-1/2"
                }`}
                style={{ left: `${mark.left * 100}%` }}
              >
                {mark.label}
              </span>
            ))}
            <span
              className="absolute -translate-x-full font-mono text-[9px] text-[var(--coral)]/80"
              style={{ left: "100%" }}
            >
              Hello
            </span>
          </div>
          <div className="relative mt-1 hidden h-10 md:block">
            {chapters.map((chapter, index) => {
              const year = yearOf(chapter.start);
              const prevYear =
                index === 0 ? null : yearOf(chapters[index - 1].start);
              if (prevYear === year) return null;
              return (
                <span
                  key={chapter.slug}
                  className="absolute -translate-x-1/2 font-mono text-[10px] text-white/40"
                  style={{ left: `${at(chapter.start) * 100}%` }}
                >
                  {index === 0 ? "Start" : year}
                </span>
              );
            })}
            <span
              className="absolute -translate-x-full font-mono text-[10px] text-[var(--coral)]/80"
              style={{ left: "100%" }}
            >
              Hello
            </span>
            {labels.map(({ rail, mid }) => {
              const theme = trackTheme(rail.group.track);
              return (
                <span
                  key={`${rail.group.company}-${rail.group.startIndex}-label`}
                  className="absolute top-3.5 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-[9px] tracking-[0.14em] uppercase"
                  style={{ left: `${mid * 100}%`, color: theme.color }}
                >
                  <span>{rail.group.company}</span>
                  <span className="tracking-wide" style={{ color: theme.fillActive }}>
                    {tenureDuration(rail.group)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

type Rail = {
  group: TenureGroup;
  left: number;
  right: number;
};

function placeRails(
  groups: TenureGroup[],
  span: { start: number; duration: number },
): Rail[] {
  return groups.flatMap((group) => {
    const dates = tenureDates(group);
    if (!dates) return [];
    const left = positionOnTimeline(dates.start, span.start, span.duration);
    const end = dates.ongoing ? new Date().toISOString().slice(0, 10) : dates.end;
    const right = positionOnTimeline(end, span.start, span.duration);
    return [{ group, left, right: Math.max(left, right) }];
  });
}

function packOverlaps(rails: Rail[]) {
  const sublane = new Map<TenureGroup, number>();

  for (const track of TRACK_ORDER) {
    const list = rails
      .filter((rail) => rail.group.track === track)
      .sort((a, b) => a.left - b.left || b.right - a.right);
    const laneEnds: number[] = [];
    for (const rail of list) {
      let lane = laneEnds.findIndex((end) => end <= rail.left + 0.004);
      if (lane < 0) {
        lane = laneEnds.length;
        laneEnds.push(rail.right);
      } else {
        laneEnds[lane] = rail.right;
      }
      sublane.set(rail.group, lane);
    }
  }

  return { sublane };
}

function chapterOverlapsTenure(chapter: Chapter | undefined, group: TenureGroup) {
  const span = tenureDates(group);
  if (!chapter || !span) return false;
  const at = new Date(`${chapter.start}T00:00:00`).getTime();
  const start = new Date(`${span.start}T00:00:00`).getTime();
  const end = span.ongoing
    ? Date.now()
    : new Date(`${span.end}T00:00:00`).getTime();
  return at >= start && at <= end;
}

function compactYearMarks(
  chapters: Chapter[],
  at: (iso: string) => number,
) {
  const marks: { slug: string; label: string; left: number }[] = [];
  let lastYear: number | null = null;
  for (const [index, chapter] of chapters.entries()) {
    const year = yearOf(chapter.start);
    if (year == null) continue;
    const prevYear = index === 0 ? null : yearOf(chapters[index - 1].start);
    if (prevYear === year) continue;
    const isFirst = index === 0;
    if (!isFirst && lastYear != null && year - lastYear < 5) continue;
    lastYear = year;
    marks.push({
      slug: chapter.slug,
      label: isFirst ? "Start" : String(year),
      left: at(chapter.start),
    });
  }
  return marks;
}

function companyLabels(rails: Rail[], activeIndex: number) {
  const ranked = [...rails].sort((a, b) => {
    const aActive = a.group.roles.some((role) => role.index === activeIndex)
      ? 1
      : 0;
    const bActive = b.group.roles.some((role) => role.index === activeIndex)
      ? 1
      : 0;
    if (aActive !== bActive) return bActive - aActive;
    return b.right - b.left - (a.right - a.left);
  });

  const placed: { rail: Rail; mid: number }[] = [];
  for (const rail of ranked) {
    const mid = (rail.left + rail.right) / 2;
    if (placed.some((item) => Math.abs(item.mid - mid) < 0.08)) continue;
    placed.push({ rail, mid });
  }
  return placed;
}
