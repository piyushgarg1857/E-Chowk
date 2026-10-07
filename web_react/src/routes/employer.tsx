import { createFileRoute } from "@tanstack/react-router";
import { EmployerDashboard } from "@/components/e-chowk/marketplace";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/employer")({
  head: () =>
    pageHead("Hire Workers", "Manage sample job requests and review skilled worker applications."),
  component: EmployerDashboard,
});