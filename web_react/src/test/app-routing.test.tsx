import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it("preserves every marketplace and AI navigation destination", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of [
      "/voice",
      "/assistant",
      "/employer",
      "/worker",
      "/profile",
      "/find-work",
      "/find-workers",
      "/create-job",
      "/notifications",
      "/history",
      "/architecture",
      "/jobs/j1",
      "/admin",
      "/admin/users",
      "/admin/jobs",
      "/admin/ai-logs",
      "/admin/audit",
      "/admin/system",
    ]) {
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});