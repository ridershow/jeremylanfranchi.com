"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { journeyChapterHref } from "@/lib/site";
import type { Chapter, Craft, Profile } from "@/lib/types";

function proofLabel(chapter: Chapter, siblings: Chapter[]): string {
  const name = chapter.company ?? chapter.title;
  const clash =
    siblings.filter((entry) => (entry.company ?? entry.title) === name)
      .length > 1;
  if (clash) return chapter.kicker || chapter.title;
  return name;
}

function CraftBlock({
  craft,
  chapters,
}: {
  craft: Craft;
  chapters: Chapter[];
}) {
  const bySlug = new Map(chapters.map((chapter) => [chapter.slug, chapter]));
  const proofs = craft.chapters
    .map((slug) => bySlug.get(slug))
    .filter((chapter): chapter is Chapter => Boolean(chapter));

  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
        {craft.title}
      </p>
      <p className="mt-3 text-base leading-relaxed text-white/70">{craft.line}</p>
      {proofs.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {proofs.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={journeyChapterHref(chapter.slug)}
                className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-[var(--coral)]"
              >
                {proofLabel(chapter, proofs)}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Skills({
  profile,
  chapters,
}: {
  profile: Profile;
  chapters: Chapter[];
}) {
  const tools = profile.skills.tools ?? [];

  return (
    <div className="relative h-dvh w-full overflow-y-auto bg-[#07080c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(232,93,76,0.16),transparent_42%),radial-gradient(ellipse_at_80%_70%,rgba(232,93,76,0.08),transparent_46%)]" />

      <div className="relative z-10 flex min-h-dvh flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:py-6">
        <Wordmark profile={profile} />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-10 md:py-12"
        >
          <p className="text-[11px] tracking-[0.22em] text-white/55 uppercase">
            How I work
          </p>
          <h1 className="font-display mt-3 text-[clamp(2.4rem,8vw,5.6rem)] leading-[0.88] font-semibold tracking-tight">
            Skills.
          </h1>

          <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-12 md:mt-14">
            {profile.skills.crafts.map((craft) => (
              <CraftBlock
                key={craft.title}
                craft={craft}
                chapters={chapters}
              />
            ))}
          </div>

          {tools.length > 0 ? (
            <p className="mt-12 text-sm text-white/40 md:mt-16">
              Also: {tools.join(", ")}.
            </p>
          ) : null}

          <Link
            href="/journey"
            className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] text-white/45 uppercase transition hover:text-white"
          >
            Or keep traveling
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
