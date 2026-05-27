# site/ — yourstrat.xaeryx.com

Self-contained static site for the YourStrat subdomain, **themed to match the
Xaeryx family** (monochrome white-on-near-black `#0a0a0a`, Inter, dot-grid +
top vignette, glass cards, shimmer eyebrow, star mark). No build step.

- `index.html` — landing page (star hero, feature cards, Google Play CTA, footer + family nav to xaeryx.com).
- `privacy.html` — privacy policy (the Play-required URL → `/privacy`).
- `styles.css` — shared Xaeryx theme.

## Before publishing
- Fill the **2 highlighted (`[DATE]`, `[CONTACT EMAIL]`) placeholders** in `privacy.html` (highlighted yellow). Everything else is final.
- The Google Play link in `index.html` (`…?id=com.yourstrat.app`) goes live once the app is published.

## Deploy (Vercel → yourstrat.xaeryx.com)
1. **Import** `slepingdragon/YourStrat` at vercel.com/new → set **Root Directory = `site`**, Framework = **Other**, no build command. Deploy. (`vercel.json` here enables clean URLs, so `/privacy` serves `privacy.html`.)
2. Project → **Settings → Domains → Add `yourstrat.xaeryx.com`**. Vercel shows a CNAME target (`cname.vercel-dns.com`).
3. In the xaeryx.com DNS (Cloudflare): add **CNAME `yourstrat` → `cname.vercel-dns.com`, Proxy = DNS only (grey cloud)**. Vercel issues SSL automatically.
4. Live at `https://yourstrat.xaeryx.com`; the Play Console privacy URL is `https://yourstrat.xaeryx.com/privacy`.

(Pure static — `vercel --prod` from the `site/` dir, or drag-drop the folder, also work.) The xaeryx.com launcher link **to** this subdomain is the xaeryx.com-repo agent's task.
