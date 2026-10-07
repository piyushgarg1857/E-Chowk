import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  users as seedUsers,
  jobs as seedJobs,
  applications as seedApplications,
  notifications as seedNotifications,
  type Role,
  type User,
  type Job,
  type JobApplication,
  type AgentConversation,
} from "./data";
import { mockMarketplaceService } from "./mock-service";
import { api, ApiError, getSession, onSessionChange, setSession, type Session } from "./api";
const errText = (e: unknown) =>
  e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
function useDemoState() {
  const [role, setRole] = useState<Role>("worker");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const workspaceRole: Role = ["/employer", "/find-workers", "/create-job"].includes(pathname)
    ? "employer"
    : ["/worker", "/find-work"].includes(pathname)
      ? "worker"
      : pathname.startsWith("/admin")
        ? "admin"
        : role;
  useEffect(() => {
    setRole(workspaceRole);
  }, [workspaceRole]);
  const [users, setUsers] = useState(seedUsers);
  const [jobs, setJobs] = useState(seedJobs);
  const [applications, setApplications] = useState(seedApplications);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [messages, setMessages] = useState<AgentConversation[]>([
    {
      id: "hello",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "नमस्ते! मैं ई-चौक हूँ। Tell me what work you need, or what worker you’re looking for. कैसे मदद करूँ?",
        },
      ],
    },
  ]);
  const [session, setSessionState] = useState<Session | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [liveJobs, setLiveJobs] = useState<Job[] | null>(null);
  const [liveApps, setLiveApps] = useState<JobApplication[]>([]);
  const [liveNotes, setLiveNotes] = useState<typeof seedNotifications | null>(null);
  const [liveWorkers, setLiveWorkers] = useState<User[]>([]);
  useEffect(() => {
    setSessionState(getSession());
    return onSessionChange((s) => setSessionState(s)) as unknown as () => void;
  }, []);
  const loggedIn = !!session;
  const live = !!session?.user?.role;
  const liveRole = (session?.user?.role ?? null) as Role | null;
  async function refresh() {
    const current = getSession();
    if (!current?.user?.role) return;
    const [meR, notesR] = await Promise.allSettled([api.me(), api.notifications()]);
    if (meR.status === "fulfilled") setMe(meR.value);
    if (notesR.status === "fulfilled") setLiveNotes(notesR.value);
    else setLiveNotes([]);
    if (current.user.role === "worker") {
      const [jobsR, appsR] = await Promise.allSettled([api.matchingJobs(50), api.myApplications()]);
      setLiveJobs(jobsR.status === "fulfilled" ? jobsR.value : []);
      setLiveApps(appsR.status === "fulfilled" ? appsR.value : []);
      setLiveWorkers([]);
    } else if (current.user.role === "employer") {
      const jobsR = await api.myJobs().catch(() => []);
      setLiveJobs(jobsR);
      const apps = await Promise.allSettled(jobsR.map((j) => api.applications(j.id)));
      setLiveApps(apps.flatMap((a) => (a.status === "fulfilled" ? a.value : [])));
      const workers = await Promise.allSettled(jobsR.map((j) => api.matchingWorkersForJob(j.id)));
      const unique = new Map<string, User>();
      workers.forEach((r) => r.status === "fulfilled" && r.value.forEach((w) => unique.set(w.id, w)));
      setLiveWorkers([...unique.values()]);
    } else {
      const jobsR = await api.jobs({ limit: 50 }).catch(() => []);
      setLiveJobs(jobsR);
      setLiveApps([]);
      setLiveWorkers([]);
    }
  }
  useEffect(() => {
    if (live) void refresh();
    else {
      setMe(null);
      setLiveJobs(null);
      setLiveNotes(null);
      setLiveApps([]);
      setLiveWorkers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, session?.access_token]);
  function setLoggedIn(value: boolean) {
    if (!value) setSession(null);
  }
  function signOut() {
    setSession(null);
  }
  async function ensureJob(id: string) {
    if (!live) return;
    try {
      const job = await api.job(id);
      setLiveJobs((prev) => [job, ...(prev ?? []).filter((j) => j.id !== id)]);
      if (liveRole === "employer") {
        const apps = await api.applications(id).catch(() => []);
        setLiveApps((prev) => [...prev.filter((a) => a.job_id !== id), ...apps]);
      }
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404)) toast.error(errText(e));
    }
  }
  const demoUser =
    users.find((user) => user.id === (workspaceRole === "employer" ? "e1" : "w1")) ?? seedUsers[0];
  const currentUser: User = live && me ? me : (demoUser as User);
  async function updateProfile(patch: Partial<User>) {
    if (live) {
      try {
        const updated = await api.updateProfile(patch as Record<string, unknown>);
        setMe(updated);
        toast.success("Profile updated · प्रोफाइल अपडेट हो गई");
      } catch (e) {
        toast.error(errText(e));
      }
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === currentUser?.id ? { ...u, ...patch } : u)));
    toast.success("Profile updated · डेमो प्रोफाइल अपडेट हो गई");
  }
  async function apply(job: Job) {
    if (live) {
      if (liveRole !== "worker") return void toast.error("Only a worker account can apply.");
      try {
        await api.apply(job.id);
        toast.success("Application sent · आवेदन भेज दिया");
        void refresh();
      } catch (e) {
        toast.error(errText(e));
      }
      return;
    }
    const error = mockMarketplaceService.validateApply(
      workspaceRole,
      job,
      applications.some((a) => a.job_id === job.id && a.worker_id === "w1"),
    );
    if (error) {
      toast.error(error);
      return;
    }
    setApplications((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        job_id: job.id,
        worker_id: "w1",
        status: "pending",
        created_at: "2026-10-07",
      },
    ]);
    setNotifications((prev) => [
      {
        id: crypto.randomUUID(),
        title: "Application submitted",
        body: `${job.title} · waiting for employer review. Demo only.`,
        type: "application",
        read: false,
        time: "Just now",
      },
      ...prev,
    ]);
    toast.success("Application sent in demo · आवेदन भेज दिया");
  }
  async function createJob(
    job: Omit<Job, "id" | "employer_id" | "employer" | "distance">,
  ): Promise<string | null> {
    if (live) {
      try {
        const created = await api.createJob({ ...job });
        setLiveJobs((prev) => [created, ...(prev ?? [])]);
        toast.success("Job published · काम पोस्ट हो गया");
        return created.id || null;
      } catch (e) {
        toast.error(errText(e));
        return null;
      }
    }
    const id = crypto.randomUUID();
    setJobs((prev) => [
      {
        ...job,
        id,
        employer_id: "e1",
        employer: users.find((u) => u.id === "e1")?.full_name || "Sample employer",
        distance: 0,
      },
      ...prev,
    ]);
    toast.success("Job published in demo · काम पोस्ट हो गया");
    return id;
  }
  async function reviewApplication(id: string, status: JobApplication["status"]) {
    if (live) {
      if (status !== "accepted" && status !== "rejected") return;
      try {
        const updated = await api.decideApplication(id, status);
        setLiveApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
        await refresh();
        toast.success(`Application ${status} · आवेदन अपडेट हो गया`);
      } catch (e) {
        toast.error(errText(e));
      }
      return;
    }
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (status === "accepted")
      setJobs((prev) => prev.map((j) => (j.id === app.job_id ? { ...j, status: "assigned" } : j)));
    toast.success(`Application ${status} in demo`);
  }
  function markRead(id?: string) {
    if (live) {
      (id ? api.markRead(id) : api.markAllRead())
        .then(() =>
          setLiveNotes((prev) =>
            (prev ?? []).map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
          ),
        )
        .catch((e) => toast.error(errText(e)));
      return;
    }
    setNotifications((prev) => prev.map((n) => (!id || n.id === id ? { ...n, read: true } : n)));
  }
  async function updateJobStatus(id: string, status: Job["status"]) {
    if (live) {
      try {
        if (status === "in_progress") {
          const updated = await api.startJob(id);
          setLiveJobs((prev) => (prev ?? []).map((j) => (j.id === id ? updated : j)));
        } else if (status === "completed") {
          await api.completeJob(id);
          await refresh();
        } else {
          toast.info("This job transition is not available from the current web action.");
          return;
        }
        toast.success(`Job ${status.replace("_", " ")} · status updated`);
      } catch (e) {
        toast.error(errText(e));
      }
      return;
    }
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
    toast.success(`Job ${status.replace("_", " ")} · demo updated`);
  }
  return {
    role: live && liveRole ? liveRole : workspaceRole,
    setRole,
    live,
    session,
    signOut,
    ensureJob,
    users: live ? [currentUser, ...liveWorkers] : users,
    jobs: live
      ? (liveJobs ?? [])
      : jobs.map((job) => ({
          ...job,
          employer: users.find((user) => user.id === job.employer_id)?.full_name || job.employer,
        })),
    applications: live ? liveApps : applications,
    notifications: live ? (liveNotes ?? []) : notifications,
    messages,
    setMessages,
    loggedIn,
    setLoggedIn,
    currentUser,
    updateProfile,
    apply,
    createJob,
    reviewApplication,
    markRead,
    updateJobStatus,
  };
}
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}