import { handleItineraryRequest } from "../server/itinerary.js";

export const config = { maxDuration: 60 };

export default function handler(req, res) {
  return handleItineraryRequest(req, res, process.env);
}
