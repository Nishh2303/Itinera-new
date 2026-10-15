import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleItineraryRequest } from "./server/itinerary.js";

// Serves /api/itinerary during `npm run dev` and `npm run preview`, using the
// same handler Vercel deploys from api/itinerary.js.
const apiPlugin = (env) => {
  const mount = (server) => {
    server.middlewares.use("/api/itinerary", (req, res) =>
      handleItineraryRequest(req, res, env),
    );
  };
  return { name: "itinera-api", configureServer: mount, configurePreviewServer: mount };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), tailwindcss(), apiPlugin(env)] };
});
