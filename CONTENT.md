# Updating this site

Stories, dates, and coordinates live in files. The globe reads them at build time — you do not need to touch React or Three.js to add a chapter.

## Add a chapter

1. Create `content/chapters/08-your-slug.md` (number prefix keeps files sorted in the folder; the site sorts by `start` date).
2. Copy the frontmatter below. Set `lat` / `lng` for the pin.
3. Write the story under the frontmatter.
4. Drop photographs into `public/photos/<slug>/` (`jpg`, `png`, `webp`, `avif`). They appear automatically in that chapter’s destination album (right side on desktop, filmstrip over the globe on phone) — not inline under the story.
5. Restart or refresh the dev server.

```yaml
---
slug: your-slug
title: Place name          # for work chapters, this is the role
kind: home          # home | study | travel | work
start: 2024-01-01
end: 2024-06-01
ongoing: false
dateLabel:          # optional. Overrides the formatted date range
kicker: Short line above the title
company:                 # school or employer. Title is the role (or place, for study)
companyHref:             # optional. Site
track: fte               # education | founder | fte — colors the timeline overlay
location:
  name: City, Country
  lat: 48.8566
  lng: 2.3522
moments:
  - title: A job, a series, a note
    kind: work      # work | photo | life
    period: 2024
    href: https://example.com
    body: One or two sentences.
photos:
  - src: /photos/your-slug/hero.jpg
    caption: Optional caption if the filename is not enough
---

Paragraphs of the story. Separate them with a blank line.
```

## Edit who you are

`content/profile.json` holds:

- Landing copy: `kicker`, `bio`, `portrait`
- Earth (chapter 0) intro: `intro` — first string is the motto, the rest are body paragraphs
- Resume: `resumeHref` (file in `public/`, e.g. `public/Resume-Jeremy-Lanfranchi.pdf`). Replace that file with a fresh LinkedIn PDF export anytime.
- Skills page: `skills.crafts` — each craft has `title`, `line`, and `chapters` (slugs that open `/journey?c=<slug>`). Optional `skills.tools` is a quiet footer, not a second resume.

```json
"skills": {
  "crafts": [
    {
      "title": "Invent",
      "line": "Brands and companies that did not exist yet.",
      "chapters": ["urbanartt", "beng"]
    }
  ],
  "tools": ["Webflow", "n8n"]
}
```
- Name, tagline, social links, and optional `email` for the contact page

## Tips

- Paris 18e and Paris 9e are separate chapters so the camera actually moves.
- Every job and school is its own chapter. Set `title` to the role (or program), `company:` to the org, and `track:` to `education`, `founder`, or `fte`. Same-city chapters reuse the pin — the globe does not fly.
- Consecutive chapters with the same `company` share a timeline rail, a time-in-org label, and a role ladder. Rails sit on a color lane (blue education, violet founder, gold FTE) and stretch across the real start–end dates, not just a single tick. Coral is reserved for play, the live pin, and the playhead.
- Photography trips you have not lived in can be `kind: travel`.
- `dateLabel` is useful when a date is approximate (Bali, childhood).
- Leave `photos:` out if you only drop files in the folder. They still appear in the destination album.
- Click a thumbnail to open it fullscreen. Hide the album to drag the globe.
