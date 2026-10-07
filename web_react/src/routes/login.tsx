import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/e-chowk/account";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/login")({
  head: () =>
    pageHead(
      "Phone Login",
      "Explore phone OTP and role selection in the E-Chowk sign-in prototype.",
    ),
  component: Login,
});