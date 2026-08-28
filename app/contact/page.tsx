import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { Contact } from "@/components/contact/Contact";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Get in touch with Jérémy Lanfranchi: work, pictures, or just a hello.",
  "/contact",
);

export default function ContactPage() {
  const profile = getProfile();

  return <Contact profile={profile} />;
}
