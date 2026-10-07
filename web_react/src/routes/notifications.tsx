import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/components/e-chowk/account";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/notifications")({
  head: () =>
    pageHead("Notifications", "Your sample job, application and voice updates in one place."),
  component: Notifications,
});