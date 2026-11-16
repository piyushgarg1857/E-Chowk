import { Fragment, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  Star,
  MapPin,
  CalendarDays,
  Clock3,
  Search,
  Mic,
  UserRound,
  Database,
  Server,
  BrainCircuit,
  Check,
  Bell,
  House,
  History,
  UsersRound,
  Plus,
  LayoutDashboard,
  ScrollText,
  Activity,
  Phone,
  Smartphone,
  Globe,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/e-chowk/store";
import { AnimatedLogo } from "./animated-logo";
import { rupees, dateLabel, hindiSkills, type Job, type Role } from "@/lib/e-chowk/data";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="E-Chowk home">
      <AnimatedLogo />
      <span className="brand-name">eChowk{!compact && <small>ई-चौक · हर हुनर को काम</small>}</span>
    </Link>
  );
}
export function Pill({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function Avatar({
  name,
  large = false,
  tone = 0,
}: {
  name: string;
  large?: boolean;
  tone?: number;
}) {
  return (
    <span className={`avatar ${large ? "large" : ""} tone-${tone}`}>
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function Rating({ value }: { value: number }) {
  return (
    <span className="rating">
      <Star />
      {value.toFixed(1)}
    </span>
  );
}
export function IconBox({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`icon-box ${tone}`}>{children}</span>;
}
export function PageHeading({
  title,
  hindi,
  action,
}: {
  title: string;
  hindi: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{hindi}</p>
      </div>
      {action}
    </div>
  );
}
export function Stat({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className="notice">
      <ShieldCheck />
      <span>
        {children ||
          "Interactive prototype · Sample records only. No live calls, OTPs, AI requests, or payments."}
      </span>
    </div>
  );
}
export function Confirm({
  trigger,
  title,
  description,
  onConfirm,
  label = "Confirm · पुष्टि करें",
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { live } = useDemo();
  return (
    <>
      <span className="inline-flex" onClick={() => setOpen(true)}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {!live && (
            <DemoNote>
              This is a simulated demo action. Your confirmation is required; sign in for live marketplace requests.
            </DemoNote>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel · अभी नहीं
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function ArchitectureStrip({ large = false }: { large?: boolean }) {
  const items = [
    { label: "User", sub: "Phone / app / web", icon: UserRound },
    { label: "AI Agent", sub: "Understands intent", icon: BrainCircuit },
    { label: "Backend", sub: "Validates permissions", icon: Server },
    { label: "Marketplace", sub: "Allowed actions", icon: BriefcaseBusiness },
    { label: "Database", sub: "PostgreSQL", icon: Database },
  ];
  return (
    <div className="architecture-strip">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <ArrowRight className="architecture-arrow" />}
          <div className={`architecture-node ${large ? "large" : ""}`}>
            {large ? (
              <IconBox>
                <item.icon />
              </IconBox>
            ) : (
              <item.icon />
            )}
            <span>{item.label}</span>
            {large && <small>{item.sub}</small>}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <Pill>
          {job.required_skill} · {hindiSkills[job.required_skill]}
        </Pill>
        <Pill tone={job.status === "open" ? "success" : "neutral"}>
          {job.status === "open" ? "Open" : job.status.replace("_", " ")}
        </Pill>
      </div>
      <h3>{job.title}</h3>
      <p className="job-employer">
        {job.employer} <ShieldCheck className="inline h-3 w-3 text-success" />
      </p>
      <div className="job-meta">
        <MapPin />
        {job.location} <span>· {job.distance} km</span>
      </div>
      <div className="job-meta">
        <CalendarDays />
        {dateLabel(job.starts_at)} <span>·</span>
        <Clock3 />
        {job.duration_days} {job.duration_days === 1 ? "day" : "days"}
      </div>
      <div className="job-card-bottom">
        <span className="job-wage">
          {rupees(job.offered_wage)}
          <small> / day</small>
        </span>
        <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
          View job <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
const workerNav = [
  { to: "/worker", label: "My Chowk", mobile: "Home", icon: House },
  { to: "/find-work", label: "Find Work", mobile: "Find Work", icon: Search },
  { to: "/voice", label: "Voice AI", mobile: "Voice AI", icon: Mic },
  { to: "/history", label: "Digital Khata", mobile: "History", icon: History },
  { to: "/profile", label: "My Profile", mobile: "Profile", icon: UserRound },
] as const;
const employerNav = [
  { to: "/employer", label: "Overview", mobile: "Home", icon: House },
  { to: "/find-workers", label: "Find Workers", mobile: "Workers", icon: UsersRound },
  { to: "/create-job", label: "Post a Job", mobile: "Post Job", icon: Plus },
  { to: "/voice", label: "Voice AI", mobile: "Voice AI", icon: Mic },
  { to: "/profile", label: "My Profile", mobile: "Profile", icon: UserRound },
] as const;
const adminNav = [
  { to: "/admin", label: "Overview", mobile: "Home", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", mobile: "Users", icon: UsersRound },
  { to: "/admin/jobs", label: "Jobs", mobile: "Jobs", icon: BriefcaseBusiness },
  { to: "/admin/ai-logs", label: "AI Logs", mobile: "AI Logs", icon: BrainCircuit },
  { to: "/admin/audit", label: "Audit", mobile: "Audit", icon: ScrollText },
  { to: "/admin/system", label: "System", mobile: "System", icon: Activity },
] as const;
export function AppShell({
  children,
  area,
}: {
  children: ReactNode;
  area?: "worker" | "employer" | "admin";
}) {
  const { role, setRole, currentUser, notifications, live } = useDemo();
  const activeRole = area || role;
  const nav =
    activeRole === "admin" ? adminNav : activeRole === "employer" ? employerNav : workerNav;
  const count = notifications.filter((n) => !n.read).length;
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(activeRole);
  const locationLabel = (currentUser?.current_location && currentUser.current_location !== "—")
    ? currentUser.current_location
    : "Jaipur, Rajasthan";

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Brand />
        <div className="sidebar-label">
          {activeRole === "worker"
            ? "Your work, your chowk"
            : activeRole === "employer"
              ? "Your hiring space"
              : "Platform demonstration"}
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} activeOptions={{ exact: true }} className="nav-item">
              <item.icon />
              {item.label}
            </Link>
          ))}
          {activeRole !== "admin" && (
            <Link to="/assistant" className="nav-item" activeOptions={{ exact: true }}>
              <MessageCircle /> AI Assistant
            </Link>
          )}
          <Link to="/notifications" className="nav-item">
            <Bell />
            Notifications {count > 0 && <span className="pill warm">{count}</span>}
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <Mic className="h-5 w-5" />
            <strong className="block mt-2">Voice AI</strong>
            <p>बोलकर काम · Apni baat bolo.</p>
            <Link to="/voice">
              Voice AI <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {!live && (
            <div>
              <div className="sidebar-label">Prototype controls · not sign-in</div>
              <select
                aria-label="Demo role"
                className="role-picker"
                value={activeRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as Role);
                  setRole(e.target.value as Role);
                  setRoleOpen(true);
                }}
              >
                <option value="worker">Worker demo</option>
                <option value="employer">Employer demo</option>
                <option value="admin">Admin demo</option>
              </select>
            </div>
          )}
          <Link to="/architecture" className="nav-item p-0">
            <Server />
            Platform architecture
          </Link>
          <div className="sidebar-profile">
            <Avatar
              name={
                activeRole === "admin" ? "Platform Admin" : currentUser?.full_name || "Account"
              }
            />
            <span>
              <strong>{activeRole === "admin" ? "Platform Admin" : currentUser?.full_name || "My Account"}</strong>
              <small>
                {activeRole === "worker"
                  ? `${currentUser?.skill_category && currentUser.skill_category !== "—" ? currentUser.skill_category : "Worker"} · ${locationLabel}`
                  : activeRole === "employer"
                    ? `Employer · ${locationLabel}`
                    : "System demo"}
              </small>
            </span>
            <Link to="/profile" aria-label="Open profile">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
      <div className="app-main">
        {!live && (
          <div className="demo-banner">
            E-CHOWK DEMO MODE · Viewing sample records. Sign in with your phone to use live AI matching and jobs.
          </div>
        )}
        <header className="app-header">
          <span className="app-header-title">
            <BriefcaseBusiness className="h-4 w-4" />
            E-Chowk <ChevronRight className="h-3 w-3" />
            {activeRole === "worker"
              ? "Worker workspace"
              : activeRole === "employer"
                ? "Employer workspace"
                : "Admin overview"}
          </span>
          <div className="mobile-brand">
            <Brand compact />
          </div>
          <div className="app-header-actions">
            <span className="header-location">
              <MapPin />
              {locationLabel}
            </span>
            {!live && (
              <select
                aria-label="Mobile demo role"
                className="demo-role-top"
                value={activeRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as Role);
                  setRole(e.target.value as Role);
                  setRoleOpen(true);
                }}
              >
                <option value="worker">Worker demo</option>
                <option value="employer">Employer demo</option>
                <option value="admin">Admin demo</option>
              </select>
            )}
            <Button variant="ghost" size="sm" title="Hindi and English are shown together">
              हिंदी / EN
            </Button>
            <Link className="notification-link" to="/notifications" aria-label="Notifications">
              <Bell />
              {count > 0 && <span className="notification-count">{count}</span>}
            </Link>
            <Link
              to="/profile"
              className="account-link"
              aria-label={`Profile for ${currentUser?.full_name || "account"}`}
            >
              <Avatar name={currentUser?.full_name || "User"} />
            </Link>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="Main navigation">
        {nav.slice(0, 5).map((item) => (
          <Link key={item.to} to={item.to} activeOptions={{ exact: true }}>
            <item.icon />
            <span>{item.mobile}</span>
          </Link>
        ))}
      </nav>
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedRole[0]?.toUpperCase() + selectedRole.slice(1)} demo selected
          </DialogTitle>
          <DialogDescription>
            This changes the prototype view only, not your authenticated permissions.
          </DialogDescription>
          <Button asChild onClick={() => setRoleOpen(false)}>
            <Link
              to={
                selectedRole === "worker"
                  ? "/worker"
                  : selectedRole === "employer"
                    ? "/employer"
                    : "/admin"
              }
            >
              Open {selectedRole} workspace <ArrowRight />
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function SiteHeader() {
  const { setRole, live, currentUser, role, signOut } = useDemo();
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Brand />
        <nav className="site-nav">
          {live ? (
            <>
              <Link to={role === "employer" ? "/employer" : "/worker"}>
                {role === "employer" ? "Employer Chowk" : "My Chowk"}
              </Link>
              <Link to="/find-work">Find Work</Link>
              <Link to="/find-workers">Hire Workers</Link>
              <Link to="/voice">
                Voice AI <Pill tone="success">बोलकर काम</Pill>
              </Link>
              <Link to="/profile">My Profile · प्रोफाइल</Link>
            </>
          ) : (
            <>
              <Link to="/find-work" onClick={() => setRole("worker")}>
                Find Work
              </Link>
              <Link to="/find-workers" onClick={() => setRole("employer")}>
                Hire Workers
              </Link>
              <Link to="/voice">
                Voice AI <Pill tone="success">बोलकर काम</Pill>
              </Link>
              <Link to="/architecture">How it works</Link>
            </>
          )}
        </nav>
        <div className="site-header-actions">
          <Button
            className="language-button"
            variant="ghost"
            size="sm"
            title="Bilingual Hindi and English experience"
          >
            हिंदी <span className="muted">/ EN</span>
          </Button>
          {live ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/profile" className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  <span>{currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Profile"}</span>
                </Link>
              </Button>
              <Button asChild className="button-large">
                <Link to={role === "employer" ? "/employer" : "/worker"}>
                  Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  signOut();
                  toast.success("Signed out · लॉगआउट हो गए");
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="header-login">
                <Link to="/login">Log in · लॉगिन</Link>
              </Button>
              <Button asChild className="button-large">
                <Link to="/login">
                  Get started <ArrowRight />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <div className="footer-badges">
            {["Flutter", "NestJS", "PostgreSQL", "Phone OTP", "Voice AI prototype"].map((t) => (
              <Pill key={t} tone="neutral">
                {t}
              </Pill>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 E-Chowk · Made for India’s workforce. भारत के हर हुनर के लिए।</span>
          <div className="action-row">
            <span>UI prototype · Not a live marketplace</span>
            <Link to="/admin" className="text-link">
              System demo
            </Link>
            <a
              href="https://github.com/piyushgarg1857/E-Chowk"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export function ChannelIcons() {
  return (
    <div className="channel-row">
      {[
        { icon: Phone, title: "Phone AI", text: "बस फोन करो, बात करो", soon: false },
        { icon: Smartphone, title: "Mobile App", text: "Your chowk, in your pocket", soon: false },
        { icon: Globe, title: "Responsive Web", text: "Work & hire from anywhere", soon: false },
        { icon: MessageCircle, title: "WhatsApp", text: "Coming soon", soon: true },
      ].map((c) => (
        <div key={c.title} className="channel-item">
          <c.icon />
          <div>
            <strong>{c.title}</strong>
            <small>{c.text}</small>
          </div>
          {c.soon && <span className="dot" />}
        </div>
      ))}
    </div>
  );
}
export function Timeline({
  items,
}: {
  items: { title: string; description: string; done: boolean }[];
}) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <div className="timeline-item" key={item.title}>
          <span className={`timeline-check ${item.done ? "" : "pending"}`}>
            {item.done ? <Check /> : <Clock3 />}
          </span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}