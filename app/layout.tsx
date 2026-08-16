import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { Analytics } from "@/components/seo/Analytics";
import { getChapters, getProfile } from "@/lib/content";
import {
  GOOGLE_SITE_VERIFICATION,
  GTM_ID,
  SITE_URL,
  graphJsonLd,
} from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const profile = getProfile();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — Growth marketer & photographer`,
    template: `%s — ${profile.name}`,
  },
  description: profile.bio,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  keywords: [
    profile.name,
    "growth marketing",
    "field marketing",
    "photographer",
    "GitGuardian",
    "Paris",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    siteName: profile.name,
    title: `${profile.name} — Growth marketer & photographer`,
    description: profile.bio,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Growth marketer & photographer`,
    description: profile.bio,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  category: "portfolio",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#07080c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const chapters = getChapters();

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-[#07080c] font-sans text-white">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Analytics />
        <script id="graph-jsonld" type="application/ld+json">
          {JSON.stringify(graphJsonLd(profile, chapters))}
        </script>
        {children}
      </body>
    </html>
  );
}
