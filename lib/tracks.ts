import type { TrackKind } from "./types";

export const TRACKS: Record<
  TrackKind,
  {
    label: string;
    color: string;
    fill: string;
    fillActive: string;
    fillPast: string;
    fillMuted: string;
  }
> = {
  education: {
    label: "Education",
    color: "#6eb5d8",
    fill: "rgba(110, 181, 216, 0.30)",
    fillActive: "rgba(110, 181, 216, 0.55)",
    fillPast: "#b7d7ea",
    fillMuted: "rgba(110, 181, 216, 0.16)",
  },
  founder: {
    label: "Founder",
    color: "#9b8ec4",
    fill: "rgba(155, 142, 196, 0.30)",
    fillActive: "rgba(155, 142, 196, 0.55)",
    fillPast: "#c9c0e0",
    fillMuted: "rgba(155, 142, 196, 0.16)",
  },
  fte: {
    label: "FTE",
    color: "#e0c36a",
    fill: "rgba(224, 195, 106, 0.32)",
    fillActive: "rgba(224, 195, 106, 0.55)",
    fillPast: "#ead9a0",
    fillMuted: "rgba(224, 195, 106, 0.16)",
  },
};

export const TRACK_ORDER: TrackKind[] = ["education", "founder", "fte"];

export function trackTheme(track?: TrackKind) {
  return TRACKS[track ?? "founder"];
}
