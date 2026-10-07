import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/ai-logs")({
  head: () =>
    pageHead(
      "AI Execution Logs",
      "Transparent simulated intent, tool, validation and result logs.",
    ),
  component: Page,
});
function Page() {
  return <AdminPage section="ai-logs" />;
}