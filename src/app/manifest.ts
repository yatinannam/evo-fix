import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EvoCare — Personal Health Records",
    short_name: "EvoCare",
    description: "Your records, reminders, and health story in one place.",
    start_url: "/evocare",
    scope: "/evocare/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#104230",
  };
}
