import { createFileRoute } from "@tanstack/react-router";
import { WorkerDashboard } from "@/components/e-chowk/marketplace";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/worker")({
  head: () =>
    pageHead(
      "My Chowk",
      "Your worker workspace: availability, local jobs, applications and earnings records.",
    ),
  component: WorkerDashboard,
});