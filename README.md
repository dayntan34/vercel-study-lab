# Vercel Study Lab

Throwaway resources created to explore the Vercel dashboard UI.
Everything here is designed to be torn down with `./teardown.sh`.

## Apps

| Dir | Purpose in the dashboard |
| --- | --- |
| `apps/next-lab` | Next.js App Router: functions, edge middleware, ISR, cron, logs |
| `apps/static-lab` | Zero-config static site: simplest possible deployment view |
| `apps/vite-lab` | Vite SPA: build step, framework detection, SPA rewrites |
| `apps/broken-lab` | Intentionally failing build: study the error / build log UI |
| `apps/api-lab` | Many serverless + edge functions: Observability & Runtime Logs |

## Inventory

`inventory.json` is written by the setup scripts and consumed by teardown.
