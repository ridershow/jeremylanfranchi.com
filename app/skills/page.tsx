import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { Skills } from "@/components/skills/Skills";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "Skills",
  "Core and other skills — growth marketing, product-led growth, and the tools behind the work.",
  "/skills",
);

export default function SkillsPage() {
  const profile = getProfile();

  return <Skills profile={profile} />;
}
