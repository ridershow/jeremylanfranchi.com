type ResumeLinkProps = {
  href: string;
  className?: string;
};

export function ResumeLink({ href, className }: ResumeLinkProps) {
  const filename = href.split("/").pop() ?? "resume.pdf";
  const classes = [
    "inline-flex items-center gap-2 text-lg text-white/80 transition hover:text-[var(--coral)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} download={filename} className={classes}>
      Download resume
      <span aria-hidden="true" className="text-white/35">
        ↓
      </span>
    </a>
  );
}
