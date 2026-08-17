"use client";

export const READ_MORE_LABEL = "Read more";
export const CLOSE_LABEL = "Close";

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
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-expanded={expanded}
      className={`pointer-events-auto inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-white uppercase transition hover:text-[var(--coral)] ${
        expanded ? "" : "mt-3"
      }`}
    >
      {expanded ? CLOSE_LABEL : READ_MORE_LABEL}
      <span aria-hidden="true">{expanded ? "×" : "→"}</span>
    </button>
  );
}
