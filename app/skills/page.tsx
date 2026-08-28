import type { Metadata } from "next";
import { getChapters, getProfile } from "@/lib/content";
import { Skills } from "@/components/skills/Skills";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "Skills",
  "Invent, design, prototype, industrialize — four crafts, with the chapters that prove them.",
  "/skills",
);

export default function SkillsPage() {
  const profile = getProfile();
  const chapters = getChapters();

  return <Skills profile={profile} chapters={chapters} />;
}
