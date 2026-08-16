import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Chapter, Moment, Photo, Profile, TrackKind } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PHOTO_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export function getProfile(): Profile {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "profile.json"), "utf8");
  return JSON.parse(raw) as Profile;
}

function parseTrack(value: unknown, kind: Chapter["kind"]): TrackKind | undefined {
  if (value === "education" || value === "founder" || value === "fte") {
    return value;
  }
  if (kind === "study") return "education";
  return undefined;
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return raw;

  const year = Number(match[1]);
  const month = Math.min(12, Math.max(1, Number(match[2]) || 1));
  const day = Math.max(1, Number(match[3]) || 1);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return `${year}-01-01`;

  const yyyy = String(parsed.getFullYear()).padStart(4, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function photosFor(slug: string, captions: Photo[] = []): Photo[] {
  const dir = path.join(process.cwd(), "public", "photos", slug);
  if (!fs.existsSync(dir)) return captions;

  const files = fs
    .readdirSync(dir)
    .filter((file) => PHOTO_EXTS.has(path.extname(file).toLowerCase()))
    .sort();

  if (files.length === 0) return captions;

  return files.map((file) => {
    const src = `/photos/${slug}/${file}`;
    const match = captions.find(
      (photo) => photo.src === src || photo.src.endsWith(file),
    );
    return { src, caption: match?.caption ?? "" };
  });
}

export function getChapters(): Chapter[] {
  const dir = path.join(CONTENT_DIR, "chapters");
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const chapters: Chapter[] = [];

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(dir, filename), "utf8");
    const { data, content } = matter(raw);
    const location = data.location as
      | { name: string; lat: number; lng: number }
      | undefined;
    if (!data.title || !location) continue;

    const slug = String(
      data.slug ?? filename.replace(/^\d+-/, "").replace(/\.md$/, ""),
    );

    const kind = data.kind as Chapter["kind"];
    chapters.push({
      slug,
      title: String(data.title),
      kind,
      start: toIsoDate(data.start),
      end: toIsoDate(data.end),
      ongoing: Boolean(data.ongoing),
      dateLabel: data.dateLabel ? String(data.dateLabel) : undefined,
      kicker: String(data.kicker ?? ""),
      company: data.company ? String(data.company) : undefined,
      companyHref: data.companyHref ? String(data.companyHref) : undefined,
      companyLogo: data.companyLogo ? String(data.companyLogo) : undefined,
      track: data.company ? parseTrack(data.track, kind) : undefined,
      location: {
        name: String(location.name),
        lat: Number(location.lat),
        lng: Number(location.lng),
      },
      moments: Array.isArray(data.moments) ? (data.moments as Moment[]) : [],
      photos: photosFor(
        slug,
        Array.isArray(data.photos) ? (data.photos as Photo[]) : [],
      ),
      body: content.trim(),
    });
  }

  return chapters.sort((a, b) => a.start.localeCompare(b.start));
}
