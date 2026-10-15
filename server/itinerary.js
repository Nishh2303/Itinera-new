// Server-only: builds the prompt, calls OpenAI with a strict JSON schema, and
// validates input. Shared by the Vite dev middleware and the Vercel function so
// the OpenAI key never reaches the browser.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_DAYS = 14;

const slot = {
  type: "object",
  additionalProperties: false,
  required: ["activity", "description", "estimated_cost"],
  properties: {
    activity: { type: "string" },
    description: { type: "string" },
    estimated_cost: { type: "number" },
  },
};

const option = {
  type: "object",
  additionalProperties: false,
  required: ["type", "summary", "estimated_total_cost", "cost_breakdown", "days", "stays"],
  properties: {
    type: { type: "string", enum: ["Balanced", "Luxury", "Explorer"] },
    summary: { type: "string" },
    estimated_total_cost: { type: "number" },
    cost_breakdown: {
      type: "object",
      additionalProperties: false,
      required: ["accommodation", "food", "activities", "local_transport", "miscellaneous"],
      properties: {
        accommodation: { type: "number" },
        food: { type: "number" },
        activities: { type: "number" },
        local_transport: { type: "number" },
        miscellaneous: { type: "number" },
      },
    },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "date", "theme", "morning", "afternoon", "evening", "food"],
        properties: {
          day: { type: "integer" },
          date: { type: "string" },
          theme: { type: "string" },
          morning: slot,
          afternoon: slot,
          evening: slot,
          food: {
            type: "object",
            additionalProperties: false,
            required: ["lunch", "dinner"],
            properties: { lunch: { type: "string" }, dinner: { type: "string" } },
          },
        },
      },
    },
    stays: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "area", "price_per_night", "description"],
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          area: { type: "string" },
          price_per_night: { type: "number" },
          description: { type: "string" },
        },
      },
    },
  },
};

export const itinerarySchema = {
  type: "object",
  additionalProperties: false,
  required: ["trip_title", "overview", "best_time_notes", "getting_around", "travel_tips", "packing_list", "options"],
  properties: {
    trip_title: { type: "string" },
    overview: { type: "string" },
    best_time_notes: { type: "string" },
    getting_around: { type: "string" },
    travel_tips: { type: "array", items: { type: "string" } },
    packing_list: { type: "array", items: { type: "string" } },
    options: { type: "array", items: option },
  },
};

const SYSTEM_PROMPT = `You are Itinera, an expert travel planner. Produce exactly three itinerary options for the trip, in this order: "Balanced", "Luxury", "Explorer".

Rules:
- One entry in "days" per trip day, numbered from 1, with "date" as YYYY-MM-DD.
- All money values are plain numbers in the traveller's currency, for the whole group (not per person).
- "estimated_total_cost" must equal the sum of "cost_breakdown". Keep "Balanced" within the stated budget; "Luxury" may exceed it by up to 50%; "Explorer" should come in under it.
- Name real, specific places, neighbourhoods and dishes. Order each day so travel between stops is short.
- Descriptions are 1-2 sentences. Give 2-3 stays per option. Give 5-8 travel tips and 8-12 packing items suited to the season and activities.
- Respect the traveller's notes and preferences.`;

export class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v ?? "") ? v : null);

export function validateTrip(input) {
  const trip = {
    destination: str(input?.destination, 120),
    startDate: isoDate(input?.startDate),
    endDate: isoDate(input?.endDate),
    budget: Number(input?.budget),
    currency: str(input?.currency, 3).toUpperCase(),
    travellers: Math.trunc(Number(input?.travellers)),
    preferences: Array.isArray(input?.preferences)
      ? input.preferences.map((p) => str(p, 30)).filter(Boolean).slice(0, 10)
      : [],
    notes: str(input?.notes, 1000),
  };
  if (!trip.destination) throw new RequestError(400, "Destination is required.");
  if (!trip.startDate || !trip.endDate) throw new RequestError(400, "Valid start and end dates are required.");
  const days = Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86400000) + 1;
  if (days < 1) throw new RequestError(400, "End date cannot be before the start date.");
  if (days > MAX_DAYS) throw new RequestError(400, `Trips are limited to ${MAX_DAYS} days.`);
  if (!(trip.budget > 0)) throw new RequestError(400, "Budget must be a positive number.");
  if (!/^[A-Z]{3}$/.test(trip.currency)) throw new RequestError(400, "Invalid currency.");
  if (!(trip.travellers >= 1 && trip.travellers <= 50)) throw new RequestError(400, "Travellers must be between 1 and 50.");
  if (trip.preferences.length === 0) throw new RequestError(400, "Pick at least one travel style.");
  return { ...trip, days };
}

function describeTrip(t) {
  return `Trip details:
- Destination: ${t.destination}
- Dates: ${t.startDate} to ${t.endDate} (${t.days} days)
- Travellers: ${t.travellers}
- Total budget: ${t.budget} ${t.currency}
- Travel styles: ${t.preferences.join(", ")}
- Notes: ${t.notes || "None"}`;
}

export async function generateItinerary(body, { apiKey, model }) {
  if (!apiKey) throw new RequestError(500, "OPENAI_API_KEY is not configured on the server.");
  const trip = validateTrip(body?.trip);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: describeTrip(trip) },
  ];

  const refinement = str(body?.refinement, 1000);
  if (refinement) {
    if (!body?.previous || typeof body.previous !== "object") {
      throw new RequestError(400, "A previous itinerary is required to refine.");
    }
    const previous = JSON.stringify(body.previous);
    if (previous.length > 200_000) throw new RequestError(413, "Previous itinerary is too large.");
    messages.push(
      { role: "assistant", content: previous },
      {
        role: "user",
        content: `Revise the plan with this change: "${refinement}". Keep everything else unless the change requires it, and keep all constraints above.`,
      },
    );
  }

  const itinerary = await callOpenAI({
    apiKey,
    model,
    messages,
    name: "itinerary",
    schema: itinerarySchema,
    maxTokens: 16000,
  });
  // Models don't always add up their own numbers; the breakdown is the source of truth.
  for (const o of itinerary.options) {
    o.estimated_total_cost = Object.values(o.cost_breakdown).reduce((a, b) => a + b, 0);
  }
  return { trip, itinerary };
}

async function callOpenAI({ apiKey, model, messages, name, schema, maxTokens }) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      max_completion_tokens: maxTokens,
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.error?.message || res.statusText;
    throw new RequestError(res.status === 401 ? 500 : 502, `OpenAI error: ${detail}`);
  }

  const choice = payload?.choices?.[0];
  if (choice?.message?.refusal) throw new RequestError(422, choice.message.refusal);
  if (choice?.finish_reason === "length") {
    throw new RequestError(502, "The plan was too long to finish. Try a shorter trip.");
  }
  try {
    return JSON.parse(choice.message.content);
  } catch {
    throw new RequestError(502, "The AI returned an unreadable response. Please try again.");
  }
}

// --- Form suggestions -------------------------------------------------------

export const STYLE_IDS = ["Culture", "Food", "Adventure", "Nature", "Relaxation", "Spiritual", "Shopping", "Family"];

const suggestSchema = {
  type: "object",
  additionalProperties: false,
  required: ["place_summary", "ideal_days", "season_note", "budget_tiers", "recommended_styles", "ideas"],
  properties: {
    place_summary: { type: "string" },
    ideal_days: { type: "integer" },
    season_note: { type: "string" },
    budget_tiers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["tier", "amount", "description"],
        properties: {
          tier: { type: "string", enum: ["Budget", "Comfort", "Premium"] },
          amount: { type: "number" },
          description: { type: "string" },
        },
      },
    },
    recommended_styles: { type: "array", items: { type: "string", enum: STYLE_IDS } },
    ideas: { type: "array", items: { type: "string" } },
  },
};

const SUGGEST_PROMPT = `You help a traveller fill in a trip-planning form. Given a destination and optional dates, travellers and currency, return:
- place_summary: one sentence on what the place is known for.
- ideal_days: a sensible trip length in days (1-14).
- season_note: one sentence on weather and crowds for the given dates (or in general if no dates), including any festival or closure worth knowing.
- budget_tiers: exactly three, in order Budget, Comfort, Premium. "amount" is a realistic TOTAL for the whole group and trip length, in the given currency, excluding flights to the destination, rounded to a clean number. "description" is under 10 words (e.g. "Hostels, street food, public transport").
- recommended_styles: the 2-3 styles from the allowed list this place suits best.
- ideas: 6 short, specific must-do items for this place (max 7 words each), e.g. "Sunset boat ride on Lake Pichola".`;

export async function suggestForTrip(body, { apiKey, model }) {
  if (!apiKey) throw new RequestError(500, "OPENAI_API_KEY is not configured on the server.");
  const destination = str(body?.destination, 120);
  if (destination.length < 2) throw new RequestError(400, "Destination is required.");
  const currency = /^[A-Z]{3}$/.test(body?.currency ?? "") ? body.currency : "USD";
  const travellers = Math.min(Math.max(Math.trunc(Number(body?.travellers)) || 1, 1), 50);
  const start = isoDate(body?.startDate);
  const end = isoDate(body?.endDate);
  const days = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1 : null;
  const length = days >= 1 && days <= MAX_DAYS ? days : null;

  return callOpenAI({
    apiKey,
    model,
    name: "suggestions",
    schema: suggestSchema,
    maxTokens: 900,
    messages: [
      { role: "system", content: SUGGEST_PROMPT },
      {
        role: "user",
        content: `Destination: ${destination}
Dates: ${length ? `${start} to ${end} (${length} days)` : "not chosen yet; size budgets for your ideal_days"}
Travellers: ${travellers}
Currency: ${currency}`,
      },
    ],
  });
}

// --- HTTP -------------------------------------------------------------------

async function readJson(req) {
  let body = req.body;
  if (body === undefined) {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 300_000) throw new RequestError(413, "Request too large.");
    }
    body = raw ? JSON.parse(raw) : {};
  } else if (typeof body === "string") {
    body = JSON.parse(body);
  }
  return body;
}

// Wraps an action as a Node (req, res) handler, used by both the dev server and Vercel.
export const createHandler = (action) => async (req, res, env) => {
  const send = (status, data) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  if (req.method !== "POST") return send(405, { error: "Method not allowed" });

  try {
    const result = await action(await readJson(req), {
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    });
    send(200, result);
  } catch (err) {
    if (err instanceof SyntaxError) return send(400, { error: "Invalid JSON body." });
    console.error("[api]", err);
    send(err.status || 500, { error: err.status ? err.message : "Unexpected server error." });
  }
};

export const handleItineraryRequest = createHandler(generateItinerary);
export const handleSuggestRequest = createHandler(suggestForTrip);
