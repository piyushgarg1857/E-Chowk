import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/audit")({
  head: () => pageHead("Audit Events", "Sample audit trail and backend authorization rules."),
  component: Page,
});
function Page() {
  return <AdminPage section="audit" />;
}