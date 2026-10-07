import { describe, expect, it } from "vitest";
import { jobs, users } from "@/lib/e-chowk/data";
import { mockMarketplaceService } from "@/lib/e-chowk/mock-service";
describe("E-Chowk mock service boundary", () => {
  it("accepts an eligible worker application", () => {
    const job = jobs.find((j) => j.status === "open");
    if (!job) throw new Error("Missing fixture");
    expect(mockMarketplaceService.validateApply("worker", job, false)).toBeNull();
  });
  it("rejects non-worker roles and duplicates", () => {
    const job = jobs.find((j) => j.status === "open");
    if (!job) throw new Error("Missing fixture");
    expect(mockMarketplaceService.validateApply("employer", job, false)).toMatch(/Only a worker/);
    expect(mockMarketplaceService.validateApply("worker", job, true)).toMatch(/already applied/);
  });
  it("rejects applications to a closed job", () => {
    const job = jobs.find((j) => j.status === "completed");
    if (!job) throw new Error("Missing fixture");
    expect(mockMarketplaceService.validateApply("worker", job, false)).toMatch(/no longer/);
  });
  it("keeps canonical roles, job statuses, and realistic worker records", () => {
    expect(users.every((u) => ["worker", "employer", "admin"].includes(u.role))).toBe(true);
    expect(
      jobs.every((j) =>
        ["draft", "open", "assigned", "in_progress", "completed", "cancelled"].includes(j.status),
      ),
    ).toBe(true);
    expect(users.filter((u) => u.role === "worker").every((u) => u.daily_wage > 0)).toBe(true);
  });
  it("returns only matching open job records", async () => {
    const results = await mockMarketplaceService.searchJobs(jobs, "plumber");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((j) => j.status === "open" && j.required_skill === "Plumber")).toBe(true);
  });
});