import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/components/e-chowk/account";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/profile")({
  head: () =>
    pageHead(
      "Your Profile",
      "Manage your worker or employer sample profile and notification preferences.",
    ),
  component: Profile,
});