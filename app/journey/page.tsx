import type { Metadata } from "next";
import { getChapters, getProfile } from "@/lib/content";
import { Experience } from "@/components/Experience";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "Journey",
  "An interactive globe through the places, jobs, and stories that shaped Jérémy Lanfranchi.",
  "/journey",
);

export default function Journey() {
  const chapters = getChapters();
  const profile = getProfile();

  return <Experience chapters={chapters} profile={profile} />;
}
