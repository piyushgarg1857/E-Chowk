import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/jobs")({
  head: () =>
    pageHead("Marketplace Jobs", "Review sample marketplace jobs and canonical job status values."),
  component: Page,
});
function Page() {
  return <AdminPage section="jobs" />;
}