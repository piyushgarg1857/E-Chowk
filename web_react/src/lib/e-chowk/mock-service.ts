import type { AgentConversation, Job, Role } from "./data";
// UI-only adapter. Replace this boundary with authenticated NestJS API calls.
// The agent proposes intents; production backend authorization must validate each action.
export const mockMarketplaceService = {
  async searchJobs(records: Job[], query: string) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return records.filter(
      (job) =>
        job.status === "open" &&
        `${job.title} ${job.required_skill} ${job.location}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  },
  validateApply(role: Role, job: Job, duplicate: boolean) {
    if (role !== "worker") return "Only a worker can apply. Switch to the worker demo.";
    if (job.status !== "open") return "This job is no longer accepting applications.";
    if (duplicate) return "You have already applied for this job.";
    return null;
  },
  async understand(
    text: string,
    role: Role,
    records: Job[],
  ): Promise<Pick<AgentConversation, "parts" | "tool">> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const lower = text.toLowerCase();
    if (/profile|प्रोफाइल|availability/.test(lower))
      return {
        parts: [
          {
            type: "text",
            text: "आपकी प्रोफाइल तैयार है। Your profile belongs to you. Open Profile to review your details; any change needs your confirmation.",
          },
        ],
        tool: "Own-profile permission checked · no changes made",
      };
    if (/application|आवेदन|status/.test(lower))
      return {
        parts: [
          {
            type: "text",
            text: "आपका आवेदन समीक्षा में है। Your Home wiring application is under review. You can see all application statuses in My Chowk.",
          },
        ],
        tool: "Check application → worker scope validated → sample status returned",
      };
    if (role === "employer" || /worker|hire|कारीगर/.test(lower))
      return {
        parts: [
          {
            type: "text",
            text: "समझ गया! You need a skilled worker in Jaipur. Ramesh Kumar is a plumber in Mansarovar, available at ₹800/day with a 4.8 rating. Open Find Workers to review and confirm a contact request.",
          },
        ],
        tool: "Find workers → search_workers → location filter validated → demo worker returned",
      };
    const skill =
      ["plumber", "electrician", "carpenter", "painter", "mason", "driver", "helper"].find((s) =>
        lower.includes(s),
      ) || (/प्लंबर/.test(lower) ? "plumber" : "plumber");
    const matches = records.filter(
      (j) => j.status === "open" && j.required_skill.toLowerCase() === skill,
    );
    return {
      parts: [
        {
          type: "text",
          text: matches.length
            ? `समझ गया! You’re looking for ${skill} work in Jaipur. I found ${matches.length} sample job${matches.length > 1 ? "s" : ""}, including “${matches[0]?.title}” at ₹${matches[0]?.offered_wage}/day. Review the job before confirming your application. कोई आवेदन आपकी अनुमति के बिना नहीं भेजा जाएगा।`
            : `अभी कोई काम नहीं मिला। No sample ${skill} jobs are open right now. Try another skill or check back later.`,
        },
      ],
      tool: `Understanding: find_job · ${skill} · Jaipur → Search jobs → Backend validation (simulated) → ${matches.length} results`,
    };
  },
};