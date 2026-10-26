# Portfolio — Nguyen The Vu

Personal portfolio (Home, Projects, About, CV) with a downloadable PDF CV generated from the same data as the site. Built with Next.js 16, Tailwind CSS v4, Motion and react-pdf.

## Develop

```bash
pnpm install
cp .env.example .env   # contact details: CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL
pnpm dev        # http://localhost:3000 (generates public/CV_NguyenTheVu.pdf first)
```

Edit CV content in `src/content/cv.ts`; the web pages and the PDF update together. Email, GitHub and LinkedIn live in env (`.env`, or Vercel project settings); a missing or malformed value fails the build. Pages are static, so rebuild/redeploy after changing them.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

## Deploy (Vercel + `.dev` domain on Cloudflare)

1. Push to GitHub and import the repo in Vercel (framework: Next.js, defaults are fine).
2. In Vercel → Project → Settings → Environment Variables, set `CONTACT_EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` (required, see `.env.example`) and `NEXT_PUBLIC_SITE_URL=https://<your-domain>.dev` (Production), then redeploy. The site URL feeds metadata, the sitemap and the "Portfolio" link in the CV/PDF.
3. Buy the `.dev` domain (Cloudflare Registrar sells at cost) and add it under Vercel → Project → Settings → Domains.
4. In Cloudflare DNS, add exactly the records Vercel shows (apex `A` record and `www` `CNAME`) with **Proxy status: DNS only** (grey cloud). Vercel issues the TLS certificate. `.dev` is HSTS-preloaded, so the site only works over HTTPS.
5. If you later turn the Cloudflare proxy on, set SSL/TLS mode to **Full (strict)** to avoid redirect loops.
