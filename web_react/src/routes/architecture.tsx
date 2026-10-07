import { createFileRoute } from "@tanstack/react-router";
import { ArchitecturePage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/architecture")({
  head: () =>
    pageHead(
      "One Connected Chowk",
      "The real Flutter, NestJS and PostgreSQL architecture, channel roadmap and safe AI authorization flow.",
    ),
  component: ArchitecturePage,
});