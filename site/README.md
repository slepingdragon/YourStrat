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

## Deploy (Cloudflare Pages, matches the xaeryx.com setup)
1. New Pages project → connect this repo → **build output / root = `site/`** (no build command; it's static).
2. Custom domain → **`yourstrat.xaeryx.com`** (Cloudflare adds the CNAME automatically since you own the zone).
3. `https://yourstrat.xaeryx.com/privacy` resolves from `privacy.html` → use that as the Play Console privacy URL.

(Or drag-drop the `site/` folder into any static host.) The xaeryx.com launcher
link **to** this subdomain is handled separately by the xaeryx.com-repo agent.
