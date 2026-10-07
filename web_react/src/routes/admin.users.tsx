import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/users")({
  head: () =>
    pageHead(
      "Marketplace Users",
      "Inspect sample worker and employer identities by role and channel.",
    ),
  component: Page,
});
function Page() {
  return <AdminPage section="users" />;
}