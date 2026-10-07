import { createFileRoute } from "@tanstack/react-router";
import { FindWork } from "@/components/e-chowk/marketplace";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/find-work")({
  head: () =>
    pageHead(
      "Find Work",
      "Explore sample jobs around Jaipur, filtered by skill, location and wage.",
    ),
  component: FindWork,
});