"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export function Wordmark({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="pointer-events-auto flex items-center justify-between gap-3 md:items-start md:gap-4"
    >
      <Link href="/" className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <Image
          src="/brand/jl-logo.png"
          alt="Jérémy Lanfranchi"
          width={36}
          height={36}
          className="h-8 w-8 md:h-9 md:w-9"
          preload
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-wide text-white uppercase">
            <span className="md:hidden">{profile.shortName}</span>
            <span className="hidden md:inline">{profile.name}</span>
          </p>
          <p className="hidden text-[11px] tracking-[0.16em] text-white/50 uppercase md:block">
            {profile.location}
          </p>
        </div>
      </Link>

      <nav className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] tracking-[0.16em] text-white/70 uppercase md:flex">
        <NavItems profile={profile} />
      </nav>

      <div className="relative md:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center text-white"
        >
          <MenuIcon open={open} />
        </button>
        {open ? (
          <nav
            id={menuId}
            className="absolute top-full right-0 z-50 mt-1 min-w-[12.5rem] border border-white/10 bg-[#07080c]/95 py-2 text-[11px] tracking-[0.16em] text-white/80 uppercase shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="flex flex-col" onClick={() => setOpen(false)}>
              <NavItems profile={profile} stacked />
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function NavItems({
  profile,
  stacked = false,
}: {
  profile: Profile;
  stacked?: boolean;
}) {
  const item = stacked
    ? "block px-4 py-3 text-left text-white/80 transition hover:bg-white/5 hover:text-[var(--coral)]"
    : "transition hover:text-[var(--coral)]";
  const contact = stacked
    ? item
    : "border-l border-white/20 pl-4 text-white/90 transition hover:text-[var(--coral)]";

  return (
    <>
      <Link href="/skills" className={item}>
        Skills
      </Link>
      <Link href="/contact" className={contact}>
        Contact
      </Link>
      {profile.socials.map((social) => (
        <a
          key={social.href}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          className={item}
        >
          {social.label}
        </a>
      ))}
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d={open ? "M3 3l12 12M15 3L3 15" : "M2 4.5h14M2 9h14M2 13.5h14"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
