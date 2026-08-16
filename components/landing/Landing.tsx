"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Wordmark } from "@/components/chrome/Wordmark";
import type { Profile } from "@/lib/types";

export function Landing({ profile }: { profile: Profile }) {
  return (
    <div className="relative h-dvh w-full overflow-y-auto bg-[#07080c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(232,93,76,0.16),transparent_42%),radial-gradient(ellipse_at_80%_70%,rgba(232,93,76,0.08),transparent_46%)]" />

      <div className="relative z-10 flex min-h-dvh flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:py-6">
        <Wordmark profile={profile} />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 py-6 md:flex-row md:items-center md:gap-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative shrink-0"
          >
            <Image
              src={profile.portrait}
              alt={profile.name}
              width={512}
              height={640}
              preload
              className="h-auto w-[min(48vw,180px)] object-contain md:w-[min(38vw,420px)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
            className="max-w-xl text-center md:text-left"
          >
            <p className="text-[11px] tracking-[0.22em] text-white/55 uppercase">
              {profile.kicker}
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,8vw,5.6rem)] leading-[0.88] font-semibold tracking-tight">
              I&apos;m {profile.shortName}.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 md:mt-5 md:text-xl">
              {profile.bio}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8 md:justify-start">
              <Link
                href="/journey"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--coral)] px-7 py-3.5 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:brightness-110"
              >
                Discover my journey
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href={profile.portfolioHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:border-[var(--coral)] hover:text-[var(--coral)]"
              >
                See my portfolio
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
