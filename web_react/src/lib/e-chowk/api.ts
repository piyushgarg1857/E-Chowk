import type { Job, JobApplication, Notification, Role, User } from "./data";

export const API_BASE_URL = "https://echowk-dev-api.azurewebsites.net";
const SESSION_KEY = "echowk.session";

export interface ApiUser {
  id: string;
  role?: Role | null;
  [key: string]: unknown;
}
export interface Session {
  access_token: string;
  user: ApiUser;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Listener = (session: Session | null) => void;
const listeners = new Set<Listener>();
export function onSessionChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
  listeners.forEach((fn) => fn(session));
}

function unwrap(body: unknown): unknown {
  if (body && typeof body === "object" && "success" in body && "data" in body)
    return (body as { data: unknown }).data;
  return body;
}
function errorMessage(body: unknown, status: number) {
  const b = body as { error?: { message?: string }; message?: string | string[] } | null;
  const msg = b?.error?.message ?? b?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return msg || `Request failed (${status})`;
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) {
    const token = getSession()?.access_token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : null,
    });
  } catch {
    throw new ApiError("E-Chowk server is unreachable. Please check your connection.", 0);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    if (res.status === 401 && options.auth !== false && getSession()) {
      setSession(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/login")
        window.location.assign("/login");
    }
    throw new ApiError(errorMessage(body, res.status), res.status);
  }
  return unwrap(body) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") s.set(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
};
const list = (v: unknown): Record<string, unknown>[] => {
  if (Array.isArray(v)) return v as Record<string, unknown>[];
  const o = v as Record<string, unknown> | null;
  for (const k of ["items", "data", "jobs", "workers", "notifications", "applications", "results"])
    if (o && Array.isArray(o[k])) return o[k] as Record<string, unknown>[];
  return [];
};
const pick = (o: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};
const str = (v: unknown, d = "") => (v === undefined || v === null ? d : String(v));
const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export function toUser(o: Record<string, unknown>): User {
  return {
    id: str(o["id"]),
    role: (str(pick(o, "role"), "worker") as Role) || "worker",
    full_name: str(pick(o, "full_name", "fullName", "name"), "E-Chowk user"),
    phone_number: str(pick(o, "phone_number", "phoneNumber", "phone")).replace(/^\+91/, ""),
    skill_category: str(pick(o, "skill_category", "skillCategory", "skill"), "—"),
    current_location: str(pick(o, "current_location", "currentLocation", "location"), "—"),
    daily_wage: num(pick(o, "daily_wage", "dailyWage")),
    is_available: Boolean(pick(o, "is_available", "isAvailable") ?? false),
    rating: num(pick(o, "rating", "average_rating", "averageRating")),
    source: (str(pick(o, "source"), "web") as User["source"]) || "web",
    experience: num(pick(o, "experience", "experience_years", "experienceYears")),
    distance: num(pick(o, "distance", "distance_km", "distanceKm")),
  };
}
export function toJob(o: Record<string, unknown>): Job {
  const employer = pick(o, "employer") as Record<string, unknown> | string | undefined;
  return {
    id: str(o["id"]),
    employer_id: str(pick(o, "employer_id", "employerId")),
    required_skill: str(pick(o, "required_skill", "requiredSkill", "skill")),
    title: str(pick(o, "title"), "Job"),
    description: str(pick(o, "description")),
    location: str(pick(o, "location")),
    offered_wage: num(pick(o, "offered_wage", "offeredWage", "wage")),
    duration_days: num(pick(o, "duration_days", "durationDays"), 1),
    starts_at: str(pick(o, "starts_at", "startsAt", "start_date", "created_at", "createdAt")),
    status: (str(pick(o, "status"), "open").toLowerCase() as Job["status"]) || "open",
    employer:
      typeof employer === "object" && employer
        ? str(pick(employer, "full_name", "fullName", "name"), "Employer")
        : str(employer, "Employer"),
    distance: num(pick(o, "distance", "distance_km")),
  };
}
export function toApplication(o: Record<string, unknown>): JobApplication {
  return {
    id: str(o["id"]),
    job_id: str(pick(o, "job_id", "jobId")),
    worker_id: str(pick(o, "worker_id", "workerId")),
    status:
      (str(pick(o, "status"), "pending").toLowerCase() as JobApplication["status"]) || "pending",
    created_at: str(pick(o, "created_at", "createdAt")),
  };
}
export function toNotification(o: Record<string, unknown>): Notification {
  const t = str(pick(o, "type"), "job").toLowerCase();
  const created = str(pick(o, "created_at", "createdAt"));
  return {
    id: str(o["id"]),
    title: str(pick(o, "title"), "Update"),
    body: str(pick(o, "body", "message", "content")),
    type: (["job", "application", "voice", "payment", "rating"].find((k) => t.includes(k)) ??
      "job") as Notification["type"],
    read: Boolean(pick(o, "read", "is_read", "isRead") ?? pick(o, "read_at", "readAt")),
    time: created ? new Date(created).toLocaleString("en-IN") : "",
  };
}

export const api = {
  sendOtp: (phone: string) =>
    request<unknown>("/auth/send-otp", { method: "POST", body: { phone }, auth: false }),
  verifyOtp: (phone: string, otp: string) =>
    request<Session>("/auth/verify-otp", { method: "POST", body: { phone, otp }, auth: false }),
  setRole: (role: Role) =>
    request<Partial<Session> & { user?: ApiUser }>("/auth/role", {
      method: "PATCH",
      body: { role },
    }),
  me: async () => toUser(await request<Record<string, unknown>>("/users/me")),
  jobs: async (p: { skill?: string; location?: string; limit?: number } = {}) =>
    list(await request(`/jobs${qs(p)}`)).map(toJob),
  job: async (id: string) =>
    toJob(await request<Record<string, unknown>>(`/jobs/${encodeURIComponent(id)}`)),
  createJob: async (body: Record<string, unknown>) =>
    toJob(await request<Record<string, unknown>>("/jobs", { method: "POST", body })),
  apply: (jobId: string) =>
    request<Record<string, unknown>>(`/jobs/${encodeURIComponent(jobId)}/applications`, {
      method: "POST",
      body: {},
    }),
  applications: async (jobId: string) =>
    list(await request(`/jobs/${encodeURIComponent(jobId)}/applications`)).map(toApplication),
  matchWorkers: async (p: { skill?: string; location?: string; limit?: number } = {}) =>
    list(await request(`/matching/workers${qs(p)}`)).map((w) => ({
      ...toUser((w["worker"] as Record<string, unknown>) ?? w),
      role: "worker" as Role,
    })),
  updateProfile: async (body: Record<string, unknown>) => toUser(await request<Record<string, unknown>>("/users/me", { method: "PATCH", body })),
  myJobs: async () => list(await request("/jobs/mine")).map(toJob),
  myWork: async () => list(await request("/jobs/my-work")).map(toJob),
  myApplications: async () => list(await request("/jobs/my-applications")).map(toApplication),
  decideApplication: (applicationId: string, status: "accepted" | "rejected") => request<Record<string, unknown>>("/jobs/applications/" + encodeURIComponent(applicationId), { method: "PATCH", body: { status } }).then(toApplication),
  startJob: (jobId: string) => request<Record<string, unknown>>("/jobs/" + encodeURIComponent(jobId) + "/start", { method: "POST" }).then(toJob),
  completeJob: (jobId: string) => request<Record<string, unknown>>("/jobs/" + encodeURIComponent(jobId) + "/complete", { method: "POST" }),
  matchingJobs: async (limit = 20) => list(await request("/matching/jobs?limit=" + encodeURIComponent(limit))).map(toJob),
  matchingWorkersForJob: async (jobId: string) => list(await request("/matching/jobs/" + encodeURIComponent(jobId) + "/workers")).map((w) => ({ ...toUser(w), role: "worker" as Role })),
  agentMessage: (message: string) => request<{ reply: string; session_id: string }>("/agent/message", { method: "POST", body: { message } }),
  agentSessionMessage: (sessionId: string, message: string) => request<{ reply: string; session_id: string }>("/agent/sessions/" + encodeURIComponent(sessionId) + "/messages", { method: "POST", body: { message } }),
  payments: async () => list(await request("/payments")),
  createPayment: (body: { job_id: string; payee_id: string; amount: number; provider?: string }) => request<Record<string, unknown>>("/payments", { method: "POST", body }),
  confirmPayment: (id: string, provider_reference?: string) => request<Record<string, unknown>>("/payments/" + encodeURIComponent(id) + "/confirm", { method: "POST", body: { provider_reference } }),
  ratingsForUser: (userId: string) => list(await request("/trust/users/" + encodeURIComponent(userId))),
  rateJob: (jobId: string, score: number, comment?: string) => request<Record<string, unknown>>("/trust/jobs/" + encodeURIComponent(jobId) + "/rating", { method: "POST", body: { score, comment } }),
  notifications: async () => list(await request("/notifications")).map(toNotification),
  markRead: (id: string) =>
    request(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "POST" }),
};