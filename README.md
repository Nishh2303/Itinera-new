# Itinera: AI travel planner

Itinera turns a destination, dates, budget and travel style into **three costed, day-by-day itineraries** (Balanced, Luxury, Explorer). You can refine a plan in plain language and export it as a PDF or Markdown trip report.

## Features

- **Three plan options** priced against your budget, with an over/under indicator
- **Cost breakdown** across accommodation, food, activities, transport and misc, plus per-person and per-day figures
- **Day-by-day timeline**: morning, afternoon and evening activities with costs, plus lunch and dinner picks
- **Where to stay**: 2–3 stays per option with area and nightly price
- **Practical notes**: getting around, seasonal notes, tips, and an interactive packing checklist
- **Refine**: "make day 2 slower" or "cut 20%" regenerates all options
- **Trip report export**: print-optimised PDF (via the browser's Save as PDF) and Markdown
- The last plan is kept across page refreshes; destination autocomplete works offline with an optional Geoapify upgrade

## Architecture

```
src/            React 19 + Tailwind v4 frontend (Vite)
  pages/        Home, Planner, Business, Contact (hash routing)
  components/   TripForm, DestinationInput, ItineraryReport, Layout, Feedback
  lib/          dates, currency formatting, destinations, API client, report export
server/         itinerary.js: prompt, JSON schema, validation, OpenAI call
api/            itinerary.js: Vercel serverless function (wraps server/)
vite.config.js  serves the same handler at /api/itinerary in dev and preview
```

The OpenAI key stays **server-side only**. The browser calls `/api/itinerary`, and the server calls OpenAI with [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) (strict JSON schema), so responses always match the shape the UI expects. Totals are recomputed from the breakdown on the server.

## Setup

```bash
npm install
cp .env.example .env    # then add your OPENAI_API_KEY
npm run dev             # http://localhost:5173
```

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | yes | Server-side OpenAI key |
| `OPENAI_MODEL` | no | Defaults to `gpt-4.1-mini`; any model that supports structured outputs |
| `VITE_GEOAPIFY_API_KEY` | no | Live city autocomplete; otherwise a built-in popular list is used |
| `VITE_CONTACT_EMAIL` | no | Address used on the Contact page |

## Deploy (Vercel)

Import the repo in Vercel (it auto-detects Vite and the `api/` function), then add `OPENAI_API_KEY` under Project → Settings → Environment Variables. To check a production build locally, run `npm run build && npm run preview`.

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`
