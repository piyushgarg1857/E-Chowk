import { createFileRoute } from "@tanstack/react-router";
import { CreateJob } from "@/components/e-chowk/create-job";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/create-job")({
  head: () =>
    pageHead(
      "Post a Job",
      "Describe work in Hindi, review structured details, and publish a sample job.",
    ),
  component: CreateJob,
});