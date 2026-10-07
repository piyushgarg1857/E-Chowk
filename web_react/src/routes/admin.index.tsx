import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/e-chowk/system";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead(
      "Platform Overview",
      "Sample platform metrics, channel activity and safe marketplace execution.",
    ),
  component: Page,
});
function Page() {
  return <AdminPage section="overview" />;
}