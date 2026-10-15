import { handleSuggestRequest } from "../server/itinerary.js";

export const config = { maxDuration: 30 };

export default function handler(req, res) {
  return handleSuggestRequest(req, res, process.env);
}
