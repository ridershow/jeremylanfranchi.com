# Jérémy Lanfranchi

Personal site: an interactive globe through the places that shaped me.

Production: [jeremylanfranchi.com](https://jeremylanfranchi.com)

## Architecture

Hostinger keeps the domain registration and email. Cloudflare is DNS, proxy, and CDN. Firebase Hosting serves the static export.

```
Hostinger (registrar + email)
        │
        ▼
Cloudflare (DNS + proxy + CDN)
        ▲
        │
Firebase Hosting (jlperso-eac6c)
```

MX, SPF, and other mail records stay on Hostinger through Cloudflare DNS. They are not proxied.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first screen is a short intro; **Get started** opens the globe.

## Add stories and photos

See [CONTENT.md](CONTENT.md). Chapters are markdown. Photographs go in `public/photos/<slug>/`.

## Deploy

The site is a Next.js static export (`out/`) deployed to the existing Firebase Hosting site. DNS does not change.

```bash
npx firebase login
npm run deploy
```

`www.jeremylanfranchi.com` should 301 to the apex. If it still 404s, add `www` in Firebase Hosting as a redirect to `jeremylanfranchi.com`, or a Cloudflare Redirect Rule with the same target.
