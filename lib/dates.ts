const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

export function formatRange(
  start: string,
  end: string,
  dateLabel?: string,
  ongoing?: boolean,
) {
  if (dateLabel) return dateLabel;
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (Number.isNaN(s.getTime())) return "";
  const startText = s.toLocaleDateString("en-US", MONTH_YEAR);
  if (ongoing) return `${startText} — Present`;
  if (Number.isNaN(e.getTime())) return startText;
  return `${startText} — ${e.toLocaleDateString("en-US", MONTH_YEAR)}`;
}

export function yearOf(iso: string) {
  const year = new Date(`${iso}T00:00:00`).getFullYear();
  return Number.isFinite(year) ? year : undefined;
}

export function monthsBetween(start: string, end: string, ongoing?: boolean) {
  const from = new Date(`${start}T00:00:00`);
  const to = ongoing ? new Date() : new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() + 3 < from.getDate()) months -= 1;
  return Math.max(0, months);
}

/** How long a stint lasted, e.g. "4 yrs 10 mos", "5 mos", "2 wks". */
export function formatDuration(start: string, end: string, ongoing?: boolean) {
  const from = new Date(`${start}T00:00:00`);
  const to = ongoing ? new Date() : new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return "";
  const months = monthsBetween(start, end, ongoing);
  if (months < 1) {
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} wk${weeks === 1 ? "" : "s"}`;
  }
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearText = `${years} yr${years === 1 ? "" : "s"}`;
  if (rest === 0) return yearText;
  return `${yearText} ${rest} mo${rest === 1 ? "" : "s"}`;
}

export function timelineSpan(starts: string[], ends: string[]) {
  const start = Math.min(...starts.map((d) => new Date(`${d}T00:00:00`).getTime()));
  const end = Math.max(...ends.map((d) => new Date(`${d}T00:00:00`).getTime()));
  return { start, end, duration: Math.max(1, end - start) };
}

export function positionOnTimeline(iso: string, start: number, duration: number) {
  const t = new Date(`${iso}T00:00:00`).getTime();
  return Math.min(1, Math.max(0, (t - start) / duration));
}

export function chaptersTimeSpan(
  chapters: { start: string; end: string; ongoing?: boolean }[],
) {
  const now = new Date().toISOString().slice(0, 10);
  return timelineSpan(
    chapters.map((chapter) => chapter.start),
    chapters.map((chapter) => (chapter.ongoing ? now : chapter.end)),
  );
}

/** Latest chapter whose start is on or before `t`. */
export function chapterIndexAtTime(
  t: number,
  chapters: { start: string }[],
) {
  let index = 0;
  for (let i = 0; i < chapters.length; i += 1) {
    const start = new Date(`${chapters[i].start}T00:00:00`).getTime();
    if (!Number.isFinite(start)) continue;
    if (start <= t) index = i;
    else break;
  }
  return index;
}
