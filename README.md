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
2. Create a local `.env` file (do not commit it) and set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

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
