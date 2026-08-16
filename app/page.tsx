import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { Landing } from "@/components/landing/Landing";
import { pageMetadata } from "@/lib/site";

const profile = getProfile();

export const metadata: Metadata = pageMetadata(
  `${profile.name} — Growth marketer & photographer`,
  profile.bio,
  "/",
  { absoluteTitle: true },
);

export default function Home() {
  return <Landing profile={profile} />;
}
