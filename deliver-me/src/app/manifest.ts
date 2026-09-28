import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deliver Me — وصّل لي",
    short_name: "Deliver Me",
    description: "Closer than you think. — أقرب مما تتوقع.",
    start_url: "/ar",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#231b16",
    // Add icon-192.png / icon-512.png exported from the official app-icon tile (see public/brand/README.md)
    icons: [],
  };
}
