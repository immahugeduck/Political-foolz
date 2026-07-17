<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7521de1b-e821-4f8d-bd5b-399a4956fc3e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local `.env` file (do not commit it) from `.env.example`
3. Configure at least one AI provider key: `GEMINI_API_KEY` or `OPENAI_API_KEY`
4. Run the app:
   `npm run dev`

## Operations and Security

- Runtime hardening is enabled in `server.ts`:
  - `helmet` security headers
  - strict CORS allowlist (local dev + `https://political-foolz.vercel.app`)
  - API rate limiting (`/api`, 60 requests/minute/IP)
  - JSON payload limit (`1mb`)
  - structured request logging (`pino-http`)
  - env validation at startup (production requires `APP_URL`)
- Health checks:
  - `GET /api/health` basic liveness
  - `GET /api/ready` env and AI-provider readiness
- CI and dependency hygiene:
  - GitHub Actions workflow at `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm run build`, and `npm audit --audit-level=high`
  - Dependabot config at `.github/dependabot.yml` creates weekly npm dependency updates

## Post-Deploy Add-ons (Vercel Dashboard + External Services)

1. Keep all secrets only in Vercel environment variables (Production/Preview/Development).
2. Rotate external provider keys periodically.
3. Add Sentry for server and frontend error tracking.
4. Add uptime monitoring for `/` and `/api/health` (for example Better Stack or UptimeRobot).
5. Configure alerting for deploy failures, repeated 5xx responses, and latency spikes.

## AI Analysis Upgrades

- `POST /api/legislation/chat` now supports:
  - `audienceMode`: `"standard" | "eli5" | "eli15" | "policy_wonk"`
  - `history`: recent chat turns (role/content objects) for interactive refinement
  - `zipCode` / `stateCode` for localized impact context
  - `compareBillId` for bill-to-bill comparison prompts
- `GET /api/legislation/summarize` and `GET /api/legislation/alerts` now return enriched analysis metadata, including:
  - `sources`, `confidenceScore`, `uncertaintyNotes`, `followUpQuestions`
  - multi-perspective fields: `supporterView`, `opponentView`, `neutralAnalysis`
- New endpoint: `POST /api/legislation/analyze-deep`
  - accepts `billId` or `billTitle` or `billText`, plus optional `compareBillId`, `audienceMode`, `zipCode`, `stateCode`
  - returns a deep multi-layer policy analysis payload with source validation fields
