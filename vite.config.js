import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleItineraryRequest, handleSuggestRequest } from "./server/itinerary.js";

// Serves /api/itinerary and /api/suggest during `npm run dev` and `npm run preview`, using the
// same handlers Vercel deploys from api/.
const apiPlugin = (env) => {
  const mount = (server) => {
    server.middlewares.use("/api/itinerary", (req, res) => handleItineraryRequest(req, res, env));
    server.middlewares.use("/api/suggest", (req, res) => handleSuggestRequest(req, res, env));
  };
  return { name: "itinera-api", configureServer: mount, configurePreviewServer: mount };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), tailwindcss(), apiPlugin(env)] };
});
