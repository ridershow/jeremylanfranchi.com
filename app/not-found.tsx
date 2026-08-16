import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-[#07080c] px-6 text-center text-white">
      <p className="text-[11px] tracking-[0.22em] text-white/55 uppercase">
        404
      </p>
      <h1 className="font-display mt-3 text-[clamp(2.4rem,8vw,5.6rem)] leading-[0.88] font-semibold tracking-tight">
        Lost in orbit.
      </h1>
      <p className="mt-4 max-w-md text-base text-white/70">
        That page is not on this map.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--coral)] px-7 py-3.5 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:brightness-110"
      >
        Back home
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
