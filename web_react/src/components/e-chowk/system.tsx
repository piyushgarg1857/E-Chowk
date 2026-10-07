import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  UsersRound,
  BriefcaseBusiness,
  BrainCircuit,
  ShieldCheck,
  Database,
  Server,
  Phone,
  Smartphone,
  Globe,
  MessageCircle,
  ArrowRight,
  Activity,
  Bell,
  ScrollText,
  Check,
  LockKeyhole,
  Search,
  RefreshCw,
  Clock3,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AppShell,
  PageHeading,
  Stat,
  Pill,
  IconBox,
  ArchitectureStrip,
  SiteHeader,
  SiteFooter,
  DemoNote,
} from "./shared";
import { useDemo } from "@/lib/e-chowk/store";
import { auditEvents, rupees, dateLabel } from "@/lib/e-chowk/data";
import { toast } from "sonner";
export function ArchitecturePage() {
  return (
    <>
      <SiteHeader />
      <main className="container architecture-page">
        <div className="architecture-hero">
          <Pill>THE E-CHOWK PLATFORM</Pill>
          <h1>Many channels. One connected Chowk.</h1>
          <p>
            Built around the real Flutter + NestJS + PostgreSQL architecture. This web experience is
            a product prototype, not a replacement for the existing project.
          </p>
        </div>
        <div className="architecture-flow">
          <ArchitectureStrip large />
        </div>
        <div className="notice mb-8">
          <ShieldCheck />
          <span>
            <strong>The golden rule:</strong> LLM decides what the user means. Backend decides what
            the system is allowed to do. The LLM never accesses SQL or bypasses authorization.
          </span>
        </div>
        <div className="grid-2">
          <section className="panel">
            <h3>From conversation to safe action</h3>
            <div className="mt-4">
              {[
                "User speaks or types across a channel",
                "STT / text enters the AI agent",
                "Context and user memory inform intent",
                "Agent selects a defined marketplace tool",
                "NestJS validates identity, role, and permissions",
                "Marketplace performs an authorized database action",
                "Tool result returns to the AI agent",
                "AI responds through TTS or text",
              ].map((s, i) => (
                <div className="flow-step" key={s}>
                  <span className="step-number">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h3>One identity, across every channel</h3>
            <div className="mt-4">
              {[
                {
                  icon: Phone,
                  title: "Phone AI",
                  text: "Twilio & Hindi voice flow prototypes",
                  status: "Prototype",
                },
                {
                  icon: Smartphone,
                  title: "Flutter mobile app",
                  text: "Existing worker and employer screens",
                  status: "Existing project",
                },
                {
                  icon: Globe,
                  title: "Responsive web",
                  text: "This interactive UI/product demo",
                  status: "UI prototype",
                },
                {
                  icon: MessageCircle,
                  title: "WhatsApp",
                  text: "Later channel, same identity and marketplace",
                  status: "Coming soon",
                },
              ].map((c) => (
                <div className="list-row" key={c.title}>
                  <IconBox>
                    <c.icon />
                  </IconBox>
                  <div className="list-row-content">
                    <h4>{c.title}</h4>
                    <p>{c.text}</p>
                  </div>
                  <Pill tone={c.status === "Coming soon" ? "warm" : "neutral"}>{c.status}</Pill>
                </div>
              ))}
            </div>
            <hr className="rule" />
            <h3>Trust & safety</h3>
            <p className="small muted mt-3">
              Phone OTP identity, explicit role permissions, backend input validation, and an audit
              trail. Consequential actions always require user confirmation.
            </p>
          </section>
        </div>
        <section className="home-section">
          <div className="section-title">
            <div>
              <h2>Aligned with the real data model.</h2>
              <p>These canonical entities shape the mock records and service boundaries.</p>
            </div>
          </div>
          <div className="footer-badges">
            {[
              "users",
              "otp_sessions",
              "jobs",
              "job_applications",
              "audit_events",
              "agent_conversations",
              "notifications",
              "ratings",
              "payments",
            ].map((e) => (
              <Pill key={e} tone="neutral">
                {e}
              </Pill>
            ))}
          </div>
          <div className="grid-3 mt-7">
            {[
              {
                title: "Existing project foundation",
                text: "Flutter mobile application, NestJS backend, PostgreSQL entities, phone OTP authentication, and worker/employer screens.",
              },
              {
                title: "Prototype integrations",
                text: "Twilio voice, Groq LLM, and Hindi voice flows are repository prototypes. This UI does not connect to them.",
              },
              {
                title: "Coming soon",
                text: "WhatsApp, advanced matching, production payments, production AI tool calling, and production observability.",
              },
            ].map((c) => (
              <div key={c.title} className="benefit-item">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <div className="action-row mt-8">
            <Button asChild>
              <Link to="/admin">
                Explore system demo <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://github.com/piyushgarg1857/E-Chowk" target="_blank" rel="noreferrer">
                View GitHub repository ↗
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
const tabs = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/ai-logs", label: "AI Logs" },
  { to: "/admin/audit", label: "Audit" },
  { to: "/admin/system", label: "System" },
] as const;
export function AdminPage({ section = "overview" }: { section?: string }) {
  const { users, jobs, applications, messages, notifications } = useDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const title =
    section === "overview"
      ? "Platform overview"
      : section === "ai-logs"
        ? "AI execution logs"
        : section === "audit"
          ? "Audit events"
          : section === "system"
            ? "System & architecture"
            : section === "users"
              ? "Marketplace users"
              : "Marketplace jobs";
  return (
    <AppShell area="admin">
      <PageHeading
        title={title}
        hindi="One marketplace. Every channel. A transparent system demonstration."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Sample system data refreshed · no live health checks performed")
            }
          >
            <RefreshCw />
            Refresh demo
          </Button>
        }
      />
      <nav className="admin-tabs">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} activeOptions={{ exact: true }}>
            {t.label}
          </Link>
        ))}
      </nav>
      <DemoNote>
        This admin area is a public prototype, not a secured admin console. All metrics, identities,
        health indicators, and logs are sample data.
      </DemoNote>
      {section === "overview" ? (
        <>
          <div className="stats-row mt-6">
            <Stat
              label="Marketplace users"
              value={users.length}
              note={`${users.filter((u) => u.role === "worker").length} workers · 1 employer`}
              icon={<UsersRound />}
            />
            <Stat
              label="Active jobs"
              value={
                jobs.filter((j) => ["open", "assigned", "in_progress"].includes(j.status)).length
              }
              note="Across sample Jaipur jobs"
              icon={<BriefcaseBusiness />}
            />
            <Stat
              label="Applications"
              value={applications.length}
              note="Validated demo requests"
              icon={<ScrollText />}
            />
            <Stat
              label="AI conversations"
              value={messages.filter((m) => m.role === "user").length + 24}
              note="24 sample + current session"
              icon={<BrainCircuit />}
            />
          </div>
          <div className="grid-2">
            <section className="panel">
              <div className="panel-title">
                <h3>Channel activity</h3>
                <Pill tone="neutral">Sample · last 7 days</Pill>
              </div>
              <div className="admin-bar-chart">
                {[
                  { class: "phone", label: "Phone AI", value: 42 },
                  { class: "app", label: "Flutter app", value: 58 },
                  { class: "web", label: "Web", value: 31 },
                  { class: "whatsapp", label: "WhatsApp", value: 0 },
                ].map((c) => (
                  <div key={c.label} className="chart-column">
                    <strong className="text-foreground">{c.value}</strong>
                    <div className={`bar ${c.class}`} />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
              <p className="small muted mt-4">WhatsApp · Coming soon</p>
            </section>
            <section className="panel">
              <div className="panel-title">
                <h3>Users by role</h3>
                <Pill tone="neutral">Canonical roles</Pill>
              </div>
              {[
                {
                  role: "Worker",
                  count: users.filter((u) => u.role === "worker").length,
                  icon: UsersRound,
                },
                {
                  role: "Employer",
                  count: users.filter((u) => u.role === "employer").length,
                  icon: BriefcaseBusiness,
                },
                { role: "Admin", count: 1, icon: ShieldCheck },
              ].map((r) => (
                <div className="list-row" key={r.role}>
                  <IconBox>
                    <r.icon />
                  </IconBox>
                  <div className="list-row-content">
                    <h4>{r.role}</h4>
                    <p>
                      {r.role === "Admin"
                        ? "Demonstration account"
                        : "Sample registered identities"}
                    </p>
                  </div>
                  <strong className="text-lg text-primary">{r.count}</strong>
                </div>
              ))}
            </section>
            <section className="panel">
              <div className="panel-title">
                <h3>System health</h3>
                <Pill tone="neutral">Not monitored live</Pill>
              </div>
              <HealthRows />
            </section>
            <section className="panel">
              <div className="panel-title">
                <h3>Shared architecture</h3>
                <Link to="/architecture" className="text-link">
                  Full view <ArrowRight />
                </Link>
              </div>
              <ArchitectureStrip />
              <div className="notice mt-4">
                <ShieldCheck />
                <span>
                  LLM proposes an action. NestJS authorizes it. PostgreSQL stores the resulting
                  marketplace record.
                </span>
              </div>
            </section>
          </div>
          <section className="panel mt-6">
            <div className="panel-title">
              <h3>Recent AI tool execution</h3>
              <Link to="/admin/ai-logs" className="text-link">
                All logs <ArrowRight />
              </Link>
            </div>
            <AuditTable />
          </section>
          <div className="grid-3 mt-6">
            <div className="panel">
              <IconBox>
                <Bell />
              </IconBox>
              <h3 className="mt-4">{notifications.length} notifications</h3>
              <p className="small muted mt-2">Sample marketplace and voice events.</p>
            </div>
            <div className="panel">
              <IconBox tone="green">
                <ShieldCheck />
              </IconBox>
              <h3 className="mt-4">Backend authorization</h3>
              <p className="small muted mt-2">Checks role, ownership, state and inputs.</p>
            </div>
            <div className="panel">
              <IconBox tone="orange">
                <Activity />
              </IconBox>
              <h3 className="mt-4">Production observability</h3>
              <p className="small muted mt-2">Coming soon · no live system monitoring.</p>
            </div>
          </div>
        </>
      ) : section === "users" ? (
        <>
          <div className="filters">
            <label className="filter-search">
              <Search />
              <input
                aria-label="Search users"
                className="filter-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search names, skill, or city"
              />
            </label>
            <select
              className="filter-input"
              aria-label="Filter user role"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="worker">Worker</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="panel table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>LOCATION</th>
                  <th>SKILL</th>
                  <th>CHANNEL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(
                    (u) =>
                      (filter === "all" || u.role === filter) &&
                      `${u.full_name} ${u.skill_category} ${u.current_location}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.full_name}</strong>
                        <small>{u.id} · sample identity</small>
                      </td>
                      <td>
                        <Pill>{u.role}</Pill>
                      </td>
                      <td>{u.current_location}</td>
                      <td>{u.skill_category}</td>
                      <td>{u.source}</td>
                      <td>
                        <Pill tone={u.is_available ? "success" : "neutral"}>
                          {u.is_available ? "Available" : "Busy"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {users.filter(
              (u) =>
                (filter === "all" || u.role === filter) &&
                `${u.full_name} ${u.skill_category} ${u.current_location}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            ).length === 0 && <div className="empty-state">No sample users match this filter.</div>}
          </div>
        </>
      ) : section === "jobs" ? (
        <>
          <div className="filters">
            <label className="filter-search">
              <Search />
              <input
                className="filter-input"
                aria-label="Search admin jobs"
                placeholder="Search jobs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="filter-input"
              aria-label="Filter job status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {["draft", "open", "assigned", "in_progress", "completed", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="panel table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>JOB</th>
                  <th>EMPLOYER</th>
                  <th>WAGE / DAY</th>
                  <th>STARTS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {jobs
                  .filter(
                    (j) =>
                      (filter === "all" || j.status === filter) &&
                      j.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((j) => (
                    <tr key={j.id}>
                      <td>
                        <Link to="/jobs/$jobId" params={{ jobId: j.id }}>
                          <strong>{j.title}</strong>
                          <small>
                            {j.required_skill} · {j.location}
                          </small>
                        </Link>
                      </td>
                      <td>{j.employer}</td>
                      <td>{rupees(j.offered_wage)}</td>
                      <td>{dateLabel(j.starts_at)}</td>
                      <td>
                        <Pill tone={j.status === "open" ? "success" : "neutral"}>
                          {j.status.replace("_", " ")}
                        </Pill>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {jobs.filter(
              (j) =>
                (filter === "all" || j.status === filter) &&
                j.title.toLowerCase().includes(query.toLowerCase()),
            ).length === 0 && <div className="empty-state">No sample jobs in this state.</div>}
          </div>
        </>
      ) : section === "ai-logs" || section === "audit" ? (
        <>
          <section className="panel mt-6">
            <div className="panel-title">
              <h3>
                {section === "audit"
                  ? "Immutable event trail · sample"
                  : "Safe tool execution flow"}
              </h3>
              <Pill tone="neutral">Mock logs</Pill>
            </div>
            <AuditTable />
          </section>
          <div className="notice mt-6">
            <ShieldCheck />
            <span>
              Intent → tool selection → backend validation → result. No SQL is exposed to the LLM.
              Production AI tool calling and observability are coming soon.
            </span>
          </div>
          <section className="panel mt-6">
            <h3>Validation rules represented in the prototype</h3>
            <div className="grid-3 mt-5">
              {[
                "Worker applies only to an open job.",
                "Employer reviews only owned job requests.",
                "Profile edits apply only to the current identity.",
                "Duplicate applications are rejected.",
                "Consequential actions require confirmation.",
                "Job states use the canonical status values.",
              ].map((r) => (
                <div key={r} className="flex-row small">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="grid-2 mt-6">
            <section className="panel">
              <h3>System component status</h3>
              <div className="mt-4">
                <HealthRows />
              </div>
            </section>
            <section className="panel">
              <h3>Architecture</h3>
              <ArchitectureStrip />
              <p className="small muted mt-4">
                Channels connect to NestJS, which coordinates Auth, AI Agent and Marketplace
                services before authorized PostgreSQL reads or writes.
              </p>
              <Link to="/architecture" className="text-link mt-5">
                Full architecture <ArrowRight />
              </Link>
            </section>
          </div>
          <section className="panel mt-6">
            <h3>Future capabilities</h3>
            <div className="grid-3 mt-5">
              {[
                "WhatsApp channel",
                "Advanced matching engine",
                "Production payments",
                "Production AI tool calling",
                "Production observability",
              ].map((s) => (
                <div className="between small" key={s}>
                  <strong>{s}</strong>
                  <Pill tone="warm">Coming soon</Pill>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
function HealthRows() {
  return (
    <>
      {[
        { name: "NestJS backend", status: "Existing project", tone: "neutral" },
        { name: "PostgreSQL data model", status: "Schema aligned", tone: "success" },
        { name: "Phone OTP authentication", status: "Demo only here", tone: "neutral" },
        { name: "Twilio / Groq / Hindi voice", status: "Prototype", tone: "warm" },
        { name: "Production observability", status: "Coming soon", tone: "warm" },
      ].map((h) => (
        <div className="health-row" key={h.name}>
          <span>{h.name}</span>
          <Pill tone={h.tone}>{h.status}</Pill>
        </div>
      ))}
    </>
  );
}
function AuditTable() {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>TIME</th>
            <th>INTENT</th>
            <th>TOOL</th>
            <th>BACKEND VALIDATION</th>
            <th>RESULT</th>
          </tr>
        </thead>
        <tbody>
          {auditEvents.map((e) => (
            <tr key={e.id}>
              <td>{e.time}</td>
              <td>
                <Pill>{e.intent}</Pill>
              </td>
              <td>{e.tool}</td>
              <td>
                <span className="flex-row">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  {e.validation}
                </span>
              </td>
              <td>
                <Pill tone="success">{e.result}</Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}