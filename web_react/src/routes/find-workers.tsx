import { createFileRoute } from "@tanstack/react-router";
import { FindWorkers } from "@/components/e-chowk/marketplace";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/find-workers")({
  head: () =>
    pageHead(
      "Find Skilled Workers",
      "Search Jaipur workers by skill, availability, wage and rating.",
    ),
  component: FindWorkers,
});