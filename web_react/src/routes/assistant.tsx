import { createFileRoute } from "@tanstack/react-router";
import { Assistant } from "@/components/e-chowk/assistant";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/assistant")({
  head: () =>
    pageHead(
      "AI Assistant",
      "A bilingual simulated marketplace assistant with transparent actions and user confirmation.",
    ),
  component: Assistant,
});