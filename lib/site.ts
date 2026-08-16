import type { Metadata } from "next";
import type { Chapter, Profile } from "./types";

export const SITE_URL = "https://jeremylanfranchi.com";
export const GTM_ID = "GTM-PDNPXDK";
export const GOOGLE_SITE_VERIFICATION =
  "hhJj9WCKTBMsqshpJvn-3_wNbm4B47cf0_Cd8_K4oSY";

export const ROUTES = [
  { path: "/", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/journey", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/skills", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: { absoluteTitle?: boolean },
): Metadata {
  const url = absoluteUrl(path);
  return {
    title: options?.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      description,
    },
  };
}

export function graphJsonLd(profile: Profile, chapters: Chapter[]) {
  const currentWork = [...chapters]
    .reverse()
    .find((chapter) => chapter.kind === "work" && chapter.ongoing);
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        url: SITE_URL,
        image: absoluteUrl(profile.portrait),
        description: profile.bio,
        jobTitle: currentWork?.title ?? "Growth marketer",
        email: profile.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Paris",
          addressCountry: "FR",
        },
        sameAs: profile.socials.map((social) => social.href),
        knowsAbout: [...profile.skills.core, ...profile.skills.other],
        worksFor: currentWork?.company
          ? {
              "@type": "Organization",
              name: currentWork.company,
              url: currentWork.companyHref,
            }
          : undefined,
        hasOccupation: chapters
          .filter((chapter) => chapter.kind === "work")
          .map((chapter) => ({
            "@type": "Occupation",
            name: chapter.title,
            occupationLocation: {
              "@type": "Place",
              name: chapter.location.name,
            },
          })),
        alumniOf: chapters
          .filter((chapter) => chapter.kind === "study" && chapter.company)
          .map((chapter) => ({
            "@type": "EducationalOrganization",
            name: chapter.company,
          })),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: profile.name,
        description: profile.tagline,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: profile.name,
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        mainEntity: { "@id": personId },
      },
    ],
  };
}
