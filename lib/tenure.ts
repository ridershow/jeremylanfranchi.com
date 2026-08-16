import { formatDuration } from "./dates";
import type { Chapter, TrackKind } from "./types";

export type TenureRole = {
  chapter: Chapter;
  index: number;
};

export type TenureGroup = {
  company: string;
  href?: string;
  logo?: string;
  track: TrackKind;
  startIndex: number;
  endIndex: number;
  roles: TenureRole[];
};

function consecutiveRuns(chapters: Chapter[]): TenureGroup[] {
  const groups: TenureGroup[] = [];
  let index = 0;

  while (index < chapters.length) {
    const company = chapters[index].company;
    if (!company) {
      index += 1;
      continue;
    }

    const roles: TenureRole[] = [{ chapter: chapters[index], index }];
    let cursor = index + 1;
    while (cursor < chapters.length && chapters[cursor].company === company) {
      roles.push({ chapter: chapters[cursor], index: cursor });
      cursor += 1;
    }

    const head = roles[0];
    const tail = roles[roles.length - 1];
    if (!head || !tail) {
      index = cursor;
      continue;
    }

    groups.push({
      company,
      href: roles.find((role) => role.chapter.companyHref)?.chapter.companyHref,
      logo: roles.find((role) => role.chapter.companyLogo)?.chapter.companyLogo,
      track:
        head.chapter.track ??
        (head.chapter.kind === "study" ? "education" : "fte"),
      startIndex: head.index,
      endIndex: tail.index,
      roles,
    });

    index = cursor;
  }

  return groups;
}

export function companyGroups(chapters: Chapter[]): TenureGroup[] {
  return consecutiveRuns(chapters);
}

export function tenureDuration(group: TenureGroup) {
  const span = tenureDates(group);
  if (!span) return "";
  return formatDuration(span.start, span.end, span.ongoing);
}

export function tenureDates(group: TenureGroup) {
  const first = group.roles[0]?.chapter;
  const last = group.roles[group.roles.length - 1]?.chapter;
  if (!first || !last) return undefined;
  return {
    start: first.start,
    end: last.end,
    ongoing: Boolean(last.ongoing),
  };
}

export function tenureFor(
  chapters: Chapter[],
  index: number,
): TenureGroup | undefined {
  return consecutiveRuns(chapters).find((group) =>
    group.roles.some((role) => role.index === index),
  );
}

export function tenureIndices(chapters: Chapter[]): Set<number> {
  const indices = new Set<number>();
  for (const group of consecutiveRuns(chapters)) {
    for (const role of group.roles) indices.add(role.index);
  }
  return indices;
}
