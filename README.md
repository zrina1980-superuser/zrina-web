# zrina.app

## Project content and homepage build

`projects.json` is the single source for portfolio cards and the generic project pages. Each entry may have a `projectPage` (technical overview) and a `caseStudy` (role, facts, problem, solution, decisions, learned, optional gallery; all in `hr` and `en`). Entries with `featuredRank` appear as flagship projects.

`npm run build` does three things: validates `projects.json` and its assets, embeds each project's data into its page and generates the bilingual homepage (`/` and `/en/`) and the suggest pages (`/predlozi/`, `/en/suggest/`) from `scripts/build-home.js` (all homepage copy lives there), and finally copies only publishable files into `dist/` (`scripts/build-dist.js`) so developer files are never served. Homepage styles and scripts: `site.css`, `site.js`; project pages: `project-page.css/js`.

Run `npm run optimize:images` after adding large PNG/JPG screenshots. Carwash, Tirehotel and Alatnica keep hand-authored pages.

## Suggest-an-app form

`functions/api/suggest.js` sends form submissions by email through Resend. Set these environment variables (Cloudflare Pages > Settings > Variables and Secrets): `RESEND_API_KEY` (secret), `SUGGEST_TO` (destination mailbox) and `SUGGEST_FROM` (a sender on a domain verified in Resend, e.g. `zrina.app <noreply@zrina.app>`). Without them the function returns 503 and the page falls back to a pre-filled `mailto:`.
## Tool policies and Cloudflare Pages

The shared About, Terms, and Privacy pages for the nine utilities live in `tools/`. The portfolio homepage and generated project pages remain separate and ad-free. `_headers` scopes security headers to tool URL paths and to the portfolio/project pages; `_redirects` sends tool paths without a trailing slash to their canonical paths and legacy HostVitals policy URLs to the shared pages.

The homepage wordmark and resized brand icons are in `assets/brand/`. Portfolio screenshots and the portfolio social preview are in `assets/portfolio/`. Tool logos live in `assets/tool-icons/`: the original tools use compact 96px JPEGs on the homepage and 180px Apple touch icons with 192px PNG favicons on their pages. UUID Inspector and Network Planner use dedicated SVG icons. There is no 512px app icon because the tools do not currently ship a web app manifest. The standalone utility pages share `assets/tool-shell.css` for a consistent responsive layout and theme; HostVitals keeps its own purpose-built interface. Tool pages use system fonts and do not request Google Fonts.

For Cloudflare Pages, keep the project root at the repository root so `index.html`, `404.html`, `_headers`, `_redirects`, `robots.txt`, and `sitemap.xml` are published from this directory. The build command is `npm run build`; the static output directory is `dist`. HostVitals also uses the Pages Function at `functions/hostvitals/api/probe.js`, so deploy from this root with Wrangler (not dashboard drag-and-drop), or connect the GitHub repository to Cloudflare Pages with build command `npm run build` and output directory `dist` (Pages Functions are picked up from `functions/` at the repository root):

```powershell
npx wrangler pages deploy dist --project-name YOUR_PAGES_PROJECT --branch main
```

Replace `YOUR_PAGES_PROJECT` with the existing Cloudflare Pages project name. After deployment, verify `https://zrina.app/hostvitals/api/probe?url=https%3A%2F%2Fexample.com` returns JSON instead of 404; without the Pages Function, HostVitals falls back to public gateways that may rate-limit or time out.

The root `ads.txt` declares Google as the direct seller for the existing publisher account. It only identifies authorized sellers; it does not display ads. Before enabling AdSense, add ad units and the required consent flow only to tool pages, and validate/update the tool-path CSP for the actual providers. Do not apply ad or consent scripts globally or to portfolio/project pages.

Reserved ad positions are planning notes only, not active ad units. Create the European regulations message in AdSense, but load its CMP/AdSense code only on tool pages after approval and before ads are enabled. Do not install a site-wide script or enable Auto ads.

The JSON tool formats source tokens directly so large number spellings, duplicate keys, and original key order are not silently changed; sorting is an explicit action. Its repair action is limited to converting single-quoted strings and removing trailing commas. The Cron tool supports Linux/POSIX, Kubernetes, GitHub Actions, and AWS EventBridge syntax, and previews upcoming runs in an IANA time zone while warning about platform-specific time-zone behavior.

The UUID Inspector decodes UUID/ULID/ObjectId and selected Snowflake identifiers in the browser. The Network Planner supports IPv4/IPv6 CIDRs, overlap and gap checks, aligned next-subnet selection, VLSM, CSV export, and share links; share links include the entered address plan.

## Support

If these tools have been useful, you can support their development on [Ko-fi](https://ko-fi.com/I2I61XNULM).
