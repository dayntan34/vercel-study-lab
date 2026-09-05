# Vercel Study Lab

Throwaway resources on the **ACME** team (`acme-415b1`) built so the Vercel
dashboard has real data to explore. Everything is removable with
`./teardown.sh --yes`.

Dashboard: https://vercel.com/acme-415b1

---

## The five projects

| Project | Live URL | What it demonstrates |
| --- | --- | --- |
| **next-lab** | [next-lab-acme-415b1.vercel.app](https://next-lab-acme-415b1.vercel.app) | Framework build, Node + Edge functions, middleware, ISR, cron, Edge Config, firewall, analytics |
| **api-lab** | [api-lab-acme-415b1.vercel.app](https://api-lab-acme-415b1.vercel.app) | Six functions with different runtimes, memory limits and error rates |
| **static-lab** | [static-lab-acme-415b1.vercel.app](https://static-lab-acme-415b1.vercel.app) | Zero-config static hosting, clean URLs, redirects, custom 404 |
| **vite-lab** | [vite-lab-acme-415b1.vercel.app](https://vite-lab-acme-415b1.vercel.app) | SPA build, framework detection, rewrite-based client routing |
| **broken-lab** | [broken-lab-acme-415b1.vercel.app](https://broken-lab-acme-415b1.vercel.app) | A **failed** production build with a readable build log |

Custom aliases also point at these: `study-lab-next`, `study-lab-api`,
`study-lab-static`, `study-lab-vite`, `study-lab-next-preview` — all
`.vercel.app`.

---

## Where to look, and what you'll find there

**Project → Deployments.** 16 deployments across the five projects, including
three in `ERROR` state. Two failed for genuine reasons worth understanding: one
because Vercel refuses to build a Next.js version with a known CVE, one because
`npm install` hit a peer-dependency conflict. The third fails on purpose.

**broken-lab → the failed deployment → Building.** A staged build log that
fails at "step 3/3" with a module-resolution error. Flip `BREAK_THE_BUILD` to
`0` in that project's env vars and redeploy to watch it go green.

**next-lab → Deployments → any deployment → Functions.** Node functions, one
Edge function and Edge Middleware are listed separately, each with its own
region and size. Compare with static-lab, which has no functions at all.

**next-lab → Settings → Environment Variables.** Nine variables covering every
case the UI handles: the same key (`STUDY_LAB_TARGET`) set differently per
environment, an `encrypted` value, two `sensitive` values that cannot be read
back after saving, and a `NEXT_PUBLIC_` variable exposed to the browser.

**next-lab → Settings → Cron Jobs.** Two jobs, hourly and daily. Cron only
registers from a *production* deployment, which is why preview deploys show
none.

**next-lab → Firewall.** Five custom rules covering all four mitigations —
deny, rate limit, challenge and log-only — plus one rule left switched off, and
three IP rules (deny, challenge, bypass). It is live: `/admin` returns 403 while
`/` returns 200. The traffic run generated 164 real blocks to look at.

**next-lab → Observability / Logs.** Roughly 2,100 requests with a deliberately
messy status distribution: 200, 307, 308, 403, 404, 429, 500, 503. `/api/slow`
randomises its latency so the duration percentiles have real spread, and
`/api/error` fails about a third of the time.

**next-lab → Analytics and Speed Insights.** 88 page views from 30 browser
sessions across five device profiles, with real Core Web Vitals. `vite-lab` has
analytics too, so you can compare. See the caveat below.

**Storage → study-lab-blob.** Five objects under two prefixes (`reports/`,
`avatars/`) with different content types. Connected to two projects, which is
why `BLOB_READ_WRITE_TOKEN` appears in their env vars.

**Storage → study-lab-flags** (Edge Config). Seven keys covering booleans,
numbers, strings, an array and a nested object. `next-lab` reads them live at
[/flags](https://next-lab-acme-415b1.vercel.app/flags) — edit a value in the
dashboard and reload that page to watch it change without a redeploy.

**Team → Settings → Webhooks.** Two webhooks. One is account-wide, one is scoped
to two projects, which shows why the event lists differ between them.

**static-lab → Settings → Deployment Protection.** Vercel Authentication is on
for *preview only*, so preview URLs redirect to SSO while production stays
public. The other projects have it off.

**Instant Rollback.** next-lab's production alias was rolled back to an older
deployment and then promoted forward again, so both actions appear in its
history.

---

## Things the platform would not let us create

Worth knowing, since each is a real product boundary rather than a mistake:

- **Git integration** needs a browser OAuth handshake. The repo exists at
  [dayntan34/vercel-study-lab](https://github.com/dayntan34/vercel-study-lab)
  with a merged PR ready to link.
- **Marketplace storage** (Postgres, Redis, and similar) installs only through
  the dashboard OAuth flow; there is no listing or install API.
- **Edge Config** is capped at 1 store on Pro.
- **Password protection** and **automation bypass** require the paid Advanced
  Deployment Protection add-on.
- **OWASP managed rules** and **access groups** are Enterprise-only.
- **Custom domains** need DNS you actually control.

---

## A caveat about Analytics

Vercel's Web Analytics script refuses to run under automation. The real check,
lifted from the served script:

```js
if (navigator.webdriver || navigator.userAgent.includes("Headless")) return;
```

`scripts/generate-pageviews.mjs` masks both signals, which is the only reason
the Analytics tab has data. It is worth knowing that the numbers there are
synthetic.

Separately, the script is served from a **per-project obfuscated path**
(e.g. `/784cefd45c605c7a/script.js`) rather than `/_vercel/insights/script.js`,
which now 404s. The npm SDK reads that path from a build-time environment
variable. This is why `static-lab` reports Speed Insights but not Web
Analytics: with no build step, it has no way to learn the path.

---

## Scripts

```bash
./scripts/inventory.sh                  # snapshot live resources to inventory.json
node scripts/generate-traffic.mjs 1400 16   # HTTP traffic -> logs, observability, firewall
node scripts/generate-pageviews.mjs 30 next # browser sessions -> analytics, vitals
                                            # sites: next | static | vite
./teardown.sh                           # dry run
./teardown.sh --yes                     # delete Vercel resources
./teardown.sh --yes --repo --token      # also delete the repo and revoke the token
```

Re-run the traffic scripts any time the dashboards look stale — analytics
views are time-windowed and will empty out on their own.

## Teardown

`./teardown.sh` is safe to run repeatedly and only touches resources whose
names it recognises. Deleting a project takes its deployments, aliases,
environment variables, firewall config and analytics with it; stores, webhooks
and Edge Configs are team-level and are removed separately.

Deleting the GitHub repo needs one extra grant, since the `dayntan34` token
lacks the scope:

```bash
gh auth refresh -h github.com -u dayntan34 -s delete_repo
```
