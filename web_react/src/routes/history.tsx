import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/e-chowk/account";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/history")({
  head: () =>
    pageHead(
      "Digital Khata",
      "A simple record of completed work, sample payment records and ratings.",
    ),
  component: HistoryPage,
});