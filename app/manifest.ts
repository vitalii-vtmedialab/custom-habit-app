import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pace — Habits & Goals",
    short_name: "Pace",
    description: "Personal habit and goal tracking",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F1E9",
    theme_color: "#F4F1E9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
