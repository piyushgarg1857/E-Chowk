import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/system")({
  head: () =>
    pageHead(
      "System Architecture",
      "E-Chowk system components, architecture and future capabilities.",
    ),
  component: Page,
});
function Page() {
  return <AdminPage section="system" />;
}