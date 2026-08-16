"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { ResumeLink } from "@/components/chrome/ResumeLink";
import type { Profile } from "@/lib/types";

export function Contact({ profile }: { profile: Profile }) {
  const email = profile.email?.trim();

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
            className="relative hidden shrink-0 md:block"
          >
            <Image
              src={profile.portrait}
              alt={profile.name}
              width={512}
              height={640}
              preload
              className="h-auto w-[min(72vw,280px)] object-contain md:w-[min(38vw,420px)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
            className="max-w-xl text-center md:text-left"
          >
            <p className="text-[11px] tracking-[0.22em] text-white/55 uppercase">
              Get in touch
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,8vw,5.6rem)] leading-[0.88] font-semibold tracking-tight">
              Say hello.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 md:mt-5 md:text-xl">
              Work, pictures, a coffee in Paris, or just a note. I read
              everything.
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-lg text-white transition hover:text-[var(--coral)]"
                  >
                    {email}
                    <span aria-hidden="true" className="text-[var(--coral)]">
                      →
                    </span>
                  </a>
                </li>
              ) : null}
              {profile.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-lg text-white/80 transition hover:text-[var(--coral)]"
                  >
                    {social.label}
                    <span aria-hidden="true" className="text-white/35">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-left">
              <ResumeLink href={profile.resumeHref} />
            </div>

            <Link
              href="/journey"
              className="mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] text-white/45 uppercase transition hover:text-white"
            >
              Or get back on my life journey
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
