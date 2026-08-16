export type ChapterKind = "home" | "study" | "travel" | "work";
export type MomentKind = "work" | "photo" | "life" | "study";
export type TrackKind = "education" | "founder" | "fte";

export type Photo = {
  src: string;
  caption?: string;
};

export type Moment = {
  title: string;
  kind: MomentKind;
  period?: string;
  body?: string;
  href?: string;
};

export type Chapter = {
  slug: string;
  title: string;
  kind: ChapterKind;
  start: string;
  end: string;
  ongoing?: boolean;
  dateLabel?: string;
  kicker: string;
  company?: string;
  companyHref?: string;
  companyLogo?: string;
  track?: TrackKind;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  moments: Moment[];
  photos: Photo[];
  body: string;
};

export type Social = {
  label: string;
  href: string;
};

export type Skills = {
  core: string[];
  other: string[];
};

export type Profile = {
  name: string;
  shortName: string;
  kicker: string;
  bio: string;
  intro: string[];
  tagline: string;
  location: string;
  portrait: string;
  email?: string;
  resumeHref: string;
  portfolioHref: string;
  skills: Skills;
  socials: Social[];
};
