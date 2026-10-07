import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDemo } from "@/lib/e-chowk/store";
import { JobDetails } from "@/components/e-chowk/marketplace";
import { pageHead } from "@/lib/e-chowk/data";
export const Route = createFileRoute("/jobs/$jobId")({
  head: ({ params }) =>
    pageHead(
      `Job ${params.jobId}`,
      "Review the work, wage and employer before confirming a sample application.",
    ),
  component: JobPage,
});
function JobPage() {
  const { jobId } = Route.useParams();
  const { ensureJob, live } = useDemo();
  useEffect(() => {
    void ensureJob(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, live]);
  return <JobDetails jobId={jobId} />;
}