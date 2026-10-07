import { createFileRoute } from "@tanstack/react-router";
import { VoiceExperience } from "@/components/e-chowk/assistant";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/voice")({
  head: () =>
    pageHead(
      "Voice AI / बोलकर काम",
      "Explore E-Chowk’s Hindi-first voice conversation demo, intent understanding and safe job review.",
    ),
  component: VoiceExperience,
});