import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mic,
  MessageCircle,
  ArrowRight,
  Search,
  BriefcaseBusiness,
  MapPin,
  Wallet,
  Star,
  Bell,
  Check,
  Clock3,
  Plus,
  Phone,
  CalendarDays,
  UsersRound,
  ShieldCheck,
  TrendingUp,
  Filter,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AppShell,
  PageHeading,
  Stat,
  Pill,
  IconBox,
  JobCard,
  Avatar,
  Rating,
  Confirm,
  DemoNote,
  Timeline,
} from "./shared";
import { useDemo } from "@/lib/e-chowk/store";
import { skills, hindiSkills, rupees, dateLabel, type Job, type User } from "@/lib/e-chowk/data";
import { toast } from "sonner";
export function VoiceBand({ employer = false }: { employer?: boolean }) {
  return (
    <div className="voice-band">
      <div className="flex-row">
        <span className="voice-circle">
          <Mic />
        </span>
        <div>
          <h2>
            {employer ? "Need the right person? Just ask." : "Apni baat bolo. Kaam hum samjhenge."}
          </h2>
          <p>
            {employer
              ? "“Mansarovar mein kal ek plumber chahiye.”"
              : "“Bhai, mujhe kal Jaipur mein plumber ka kaam chahiye.”"}
          </p>
        </div>
      </div>
      <Button asChild variant="secondary" className="button-large">
        <Link to="/voice">
          <Mic />
          Voice AI <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
export function WorkerDashboard() {
  const { currentUser, updateProfile, jobs, applications, notifications, live } = useDemo();
  const workerApps = applications.filter((a) => a.worker_id === currentUser?.id || (!live && a.worker_id === "w1"));
  const active = jobs.find((j) => j.status === "in_progress");
  const pendingCount = workerApps.filter((a) => a.status === "pending").length;
  const completedCount = live ? workerApps.filter((a) => a.status === "completed").length : 12;
  const ratingVal = currentUser?.rating ? currentUser.rating.toFixed(1) : (live ? "5.0" : "4.8");
  const wageLabel = currentUser?.daily_wage ? rupees(currentUser.daily_wage) : (live ? "Not set" : "₹12,450");

  return (
    <AppShell area="worker">
      <PageHeading
        title={`Namaste, ${currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Karmik"}`}
        hindi="आपका अपना चौक। Let’s find your next opportunity."
        action={
          <div className={`availability-row ${currentUser?.is_available ? "available" : ""}`}>
            <span className="dot" />
            <span>{currentUser?.is_available ? "Available for work" : "Not available"}</span>
            <Switch
              aria-label="Available for work"
              checked={currentUser?.is_available ?? false}
              onCheckedChange={(checked: boolean) => updateProfile({ is_available: checked })}
            />
          </div>
        }
      />
      <div className="stats-row">
        <Stat
          label="Applications"
          value={pendingCount}
          note="Awaiting employer review"
          icon={<BriefcaseBusiness />}
        />
        <Stat label="Completed jobs" value={completedCount} note={live ? "Verified jobs" : "Sample lifetime total"} icon={<Check />} />
        <Stat
          label="Expected wage"
          value={wageLabel}
          note={live ? "Per day rate" : "Digital khata · sample total"}
          icon={<Wallet />}
        />
        <Stat label="Your rating" value={ratingVal} note={live ? "Marketplace trust score" : "From 12 sample reviews"} icon={<Star />} />
      </div>
      <VoiceBand />
      <div className="dashboard-columns">
        <div className="stack">
          <div>
            <div className="section-title">
              <div>
                <h2 className="text-xl!">Recommended for you</h2>
                <p>
                  {currentUser?.skill_category && currentUser.skill_category !== "—"
                    ? `आपके हुनर (${currentUser.skill_category}) के लिए`
                    : "Jobs near you"}
                </p>
              </div>
              <Link to="/find-work" className="text-link">
                View all <ArrowRight />
              </Link>
            </div>
            <div className="grid-3">
              {jobs
                .filter((j) => j.status === "open")
                .slice(0, 4)
                .map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
            </div>
          </div>
          <section className="panel">
            <div className="panel-title">
              <h3>Your applications</h3>
              <Pill>{workerApps.filter((a) => a.status !== "completed").length} active</Pill>
            </div>
            {workerApps
              .filter((a) => a.status !== "completed")
              .map((a) => {
                const j = jobs.find((job) => job.id === a.job_id);
                return j ? (
                  <div className="list-row" key={a.id}>
                    <IconBox>
                      <BriefcaseBusiness />
                    </IconBox>
                    <div className="list-row-content">
                      <h4>{j.title}</h4>
                      <p>
                        {j.employer} · {dateLabel(a.created_at)}
                      </p>
                    </div>
                    <Pill tone={a.status === "accepted" ? "success" : "warm"}>
                      {a.status === "pending" ? "In review" : a.status}
                    </Pill>
                    <Link to="/jobs/$jobId" params={{ jobId: j.id }} aria-label={`View ${j.title}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                ) : null;
              })}
          </section>
          {active && (
            <section className="panel active-job">
              <div className="between">
                <Pill tone="success">
                  <span className="dot" />
                  CURRENT JOB
                </Pill>
                <Pill tone="neutral">In progress</Pill>
              </div>
              <h3>{active.title}</h3>
              <p className="small muted">
                {active.employer} · {active.location}
              </p>
              <div className="between mt-4">
                <span className="job-wage">
                  {rupees(active.offered_wage)}
                  <small> / day</small>
                </span>
                <Link to="/jobs/$jobId" params={{ jobId: active.id }} className="text-link">
                  Job details <ArrowRight />
                </Link>
              </div>
            </section>
          )}
        </div>
        <aside className="dashboard-aside stack">
          <section className="panel">
            <div className="flex-row">
              <Avatar name={currentUser?.full_name || "RK"} large />
              <div>
                <h3>{currentUser?.full_name}</h3>
                <p className="small muted mt-1">{currentUser?.skill_category} · 8 years</p>
                <Rating value={4.8} />
              </div>
            </div>
            <hr className="rule" />
            <div className="profile-fact">
              <span className="muted">Location</span>
              <strong>Jaipur</strong>
            </div>
            <div className="profile-fact">
              <span className="muted">Expected wage</span>
              <strong>{rupees(currentUser?.daily_wage || 800)}/day</strong>
            </div>
            <div className="between small mt-4 mb-2">
              <span>Profile completion</span>
              <strong>80%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
            <Link to="/profile" className="text-link mt-4">
              Complete your profile <ArrowRight />
            </Link>
          </section>
          <section className="panel">
            <div className="panel-title">
              <h3>Notifications</h3>
              <Link to="/notifications" className="text-link">
                View all
              </Link>
            </div>
            <div className="mini-list">
              {notifications.slice(0, 3).map((n) => (
                <Link to="/notifications" className="list-row" key={n.id}>
                  <IconBox tone={n.type === "job" ? "green" : ""}>
                    {n.type === "job" ? <BriefcaseBusiness /> : <Bell />}
                  </IconBox>
                  <div className="list-row-content">
                    <h4>{n.title}</h4>
                    <p>{n.time}</p>
                  </div>
                  {!n.read && <span className="dot" />}
                </Link>
              ))}
            </div>
          </section>
          <section className="panel">
            <IconBox tone="orange">
              <Phone />
            </IconBox>
            <h3 className="mt-4">Phone se bhi jud sakte hain.</h3>
            <p className="small muted mt-2">
              Prefer speaking? Explore voice registration — no typing needed.
            </p>
            <Link to="/voice" className="text-link mt-4">
              Try voice registration <ArrowRight />
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
export function FindWork() {
  const { jobs, live, refresh } = useDemo();
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("All");
  const [location, setLocation] = useState("All Jaipur");
  const [sort, setSort] = useState("nearby");
  const [loading, setLoading] = useState(false);
  const filtered = jobs
    .filter(
      (j) =>
        j.status === "open" &&
        (skill === "All" || j.required_skill === skill) &&
        `${j.title} ${j.location} ${j.required_skill}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (location === "All Jaipur" || j.location.includes(location)),
    )
    .sort((a, b) => (sort === "wage" ? b.offered_wage - a.offered_wage : a.distance - b.distance));
  return (
    <AppShell area="worker">
      <PageHeading
        title="Find work near you"
        hindi="आपके हुनर के लिए सही काम। Local work, fair opportunities."
        action={
          <Button asChild variant="outline" className="button-large">
            <Link to="/voice">
              <Mic />
              Voice AI · बोलकर काम
            </Link>
          </Button>
        }
      />
      {!live && (
        <DemoNote>
          Viewing sample opportunities. Sign in with your phone to access live opportunities.
        </DemoNote>
      )}
      <div className="filters">
        <label className="filter-search">
          <Search />
          <input
            className="filter-input"
            aria-label="Search jobs"
            placeholder="Search work, skill, or neighbourhood"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          className="filter-input"
          aria-label="Required skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="All">All skills</option>
          {skills.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="filter-input"
          aria-label="Job location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {["All Jaipur", "Mansarovar", "Vaishali Nagar", "Jagatpura", "Malviya Nagar"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select
          className="filter-input"
          aria-label="Sort jobs"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="nearby">Nearest first</option>
          <option value="wage">Highest wage</option>
        </select>
      </div>
      <div className="between mb-5">
        <span className="small muted">
          <strong className="text-foreground">{filtered.length} jobs</strong> available {live ? "live" : "in the demo"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            setLoading(true);
            if (live) await refresh();
            setTimeout(() => {
              setLoading(false);
              toast.success("Job list refreshed");
            }, 500);
          }}
        >
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="panel animate-pulse h-60 bg-muted" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid-3">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search />
          <h3>No work matches these filters</h3>
          <p className="mt-2">अभी कोई काम नहीं मिला। Try another skill or neighbourhood.</p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setSkill("All");
              setLocation("All Jaipur");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </AppShell>
  );
}
export function WorkerCard({ worker, index = 0 }: { worker: User; index?: number }) {
  return (
    <article className="panel worker-card">
      <div className="between">
        <div className="flex-row">
          <Avatar name={worker.full_name} tone={index % 3} />
          <div>
            <h3>{worker.full_name}</h3>
            <small>
              {worker.skill_category} · {hindiSkills[worker.skill_category]}
            </small>
          </div>
        </div>
        <Rating value={worker.rating} />
      </div>
      <Pill tone={worker.is_available ? "success" : "neutral"}>
        {worker.is_available ? (
          <>
            <span className="dot" />
            Available tomorrow
          </>
        ) : (
          "Currently working"
        )}
      </Pill>
      <div className="worker-info">
        <span>
          <MapPin />
          {worker.distance} km away
        </span>
        <span>
          <Wrench />
          {worker.experience} years experience
        </span>
        <span className="col-span-2">
          <MapPin />
          {worker.current_location}
        </span>
      </div>
      <div className="worker-card-footer">
        <span className="job-wage">
          {rupees(worker.daily_wage)}
          <small> / day</small>
        </span>
        <Confirm
          title={`Contact ${worker.full_name}?`}
          description={`Request contact with ${worker.full_name}, ${worker.skill_category}, at ${rupees(worker.daily_wage)}/day. Contact sharing will require backend permission in the real app.`}
          trigger={
            <Button variant="outline" size="sm">
              <Phone />
              Call worker
            </Button>
          }
          label="Confirm contact request"
          onConfirm={() => toast.success("Contact request simulated · no phone call placed")}
        />
      </div>
    </article>
  );
}
export function FindWorkers() {
  const { users } = useDemo();
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("All");
  const [available, setAvailable] = useState(false);
  const [wage, setWage] = useState("all");
  const [rating, setRating] = useState("all");
  const [location, setLocation] = useState("All Jaipur");
  const workers = users.filter(
    (u) =>
      u.role === "worker" &&
      (skill === "All" || u.skill_category === skill) &&
      (!available || u.is_available) &&
      (wage === "all" || u.daily_wage <= Number(wage)) &&
      (rating === "all" || u.rating >= Number(rating)) &&
      (location === "All Jaipur" || u.current_location.includes(location)) &&
      `${u.full_name} ${u.skill_category} ${u.current_location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <AppShell area="employer">
      <PageHeading
        title="Find skilled workers"
        hindi="सही काम के लिए सही कामगार। Skilled people, close to you."
        action={
          <Button asChild className="button-large">
            <Link to="/assistant">
              <MessageCircle />
              AI Assistant
            </Link>
          </Button>
        }
      />
      <div className="filters">
        <label className="filter-search">
          <Search />
          <input
            className="filter-input"
            placeholder="Search name, skill, or location"
            aria-label="Search workers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          className="filter-input"
          aria-label="Worker skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="All">All skills</option>
          {skills.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="filter-input"
          aria-label="Wage range"
          value={wage}
          onChange={(e) => setWage(e.target.value)}
        >
          <option value="all">Any wage</option>
          <option value="700">Up to ₹700/day</option>
          <option value="800">Up to ₹800/day</option>
          <option value="900">Up to ₹900/day</option>
        </select>
        <select
          className="filter-input"
          aria-label="Minimum rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="all">Any rating</option>
          <option value="4.8">4.8 stars & above</option>
          <option value="4.5">4.5 stars & above</option>
        </select>
      </div>
      <div className="between mb-6 flex-wrap">
        <div className="action-row">
          <select
            className="filter-input w-auto! text-xs!"
            aria-label="Worker location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {[
              "All Jaipur",
              "Mansarovar",
              "Vaishali Nagar",
              "Malviya Nagar",
              "Jagatpura",
              "Sanganer",
              "Civil Lines",
            ].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <label className="flex-row small">
            <Switch
              checked={available}
              onCheckedChange={setAvailable}
              aria-label="Available workers only"
            />
            Available only
          </label>
        </div>
        <span className="small muted">{workers.length} sample workers</span>
      </div>
      {workers.length ? (
        <div className="grid-3">
          {workers.map((w, i) => (
            <WorkerCard key={w.id} worker={w} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <UsersRound />
          <h3>No workers match these filters</h3>
          <p className="mt-2">Try a different wage or skill.</p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setQuery("");
              setSkill("All");
              setAvailable(false);
              setWage("all");
              setRating("all");
              setLocation("All Jaipur");
            }}
          >
            Reset filters
          </Button>
        </div>
      )}
      <div className="mt-6">
        <DemoNote>
          Worker profiles and ratings are illustrative. “Call worker” creates a simulated request,
          not a live call.
        </DemoNote>
      </div>
    </AppShell>
  );
}
export function EmployerDashboard() {
  const { jobs, applications, users, currentUser, reviewApplication, live } = useDemo();
  const own = jobs.filter((j) => j.employer_id === currentUser?.id || (!live && j.employer_id === "e1"));
  const candidates = applications.filter(
    (a) => a.status === "pending" && own.some((j) => j.id === a.job_id),
  );
  return (
    <AppShell area="employer">
      <PageHeading
        title={`Namaste, ${currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Employer"}`}
        hindi="आपकी टीम, आपका भरोसा। Let’s get the work done."
        action={
          <Button asChild className="button-large">
            <Link to="/create-job">
              <Plus />
              Post a job
            </Link>
          </Button>
        }
      />
      <div className="stats-row">
        <Stat
          label="Open requests"
          value={own.filter((j) => j.status === "open").length}
          note="Ready for applications"
          icon={<BriefcaseBusiness />}
        />
        <Stat
          label="Candidates"
          value={candidates.length}
          note="Waiting for your review"
          icon={<UsersRound />}
        />
        <Stat
          label="In progress"
          value={own.filter((j) => j.status === "in_progress").length}
          note="Work happening today"
          icon={<Clock3 />}
        />
        <Stat label="Employer rating" value={currentUser?.rating ? currentUser.rating.toFixed(1) : (live ? "5.0 ★" : "4.9")} note={live ? "Verified employer profile" : "Sample trusted profile"} icon={<Star />} />
      </div>
      <VoiceBand employer />
      <div className="panel-title">
        <h3>Your job pipeline</h3>
        <Pill tone={live ? "success" : "neutral"}>{live ? "Live pipeline" : "Sample marketplace"}</Pill>
      </div>
      <div className="pipeline">
        {(["open", "assigned", "in_progress", "completed"] as const).map((status) => (
          <div key={status} className={`pipeline-step ${status === "open" ? "active" : ""}`}>
            <strong>{own.filter((j) => j.status === status).length}</strong>
            {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="stack">
          <section className="panel">
            <div className="panel-title">
              <h3>Active job requests</h3>
              <Link to="/create-job" className="text-link">
                <Plus />
                New request
              </Link>
            </div>
            {own
              .filter((j) => j.status !== "completed")
              .map((j) => (
                <div className="list-row" key={j.id}>
                  <IconBox>
                    <BriefcaseBusiness />
                  </IconBox>
                  <div className="list-row-content">
                    <h4>{j.title}</h4>
                    <p>
                      {j.location} · {rupees(j.offered_wage)}/day
                    </p>
                  </div>
                  <Pill tone={j.status === "open" ? "success" : "neutral"}>
                    {j.status.replace("_", " ")}
                  </Pill>
                  <Link to="/jobs/$jobId" params={{ jobId: j.id }} aria-label={`View ${j.title}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
          </section>
          <section className="panel">
            <div className="panel-title">
              <h3>Review candidates</h3>
              <Pill tone="warm">{candidates.length} pending</Pill>
            </div>
            {candidates.length ? (
              candidates.map((a) => {
                const user = users.find((u) => u.id === a.worker_id);
                const job = jobs.find((j) => j.id === a.job_id);
                return (
                  <div className="list-row flex-wrap" key={a.id}>
                    <Avatar name={user?.full_name || "Worker"} />
                    <div className="list-row-content">
                      <h4>{user?.full_name}</h4>
                      <p>
                        {job?.title} · {user?.skill_category}
                      </p>
                    </div>
                    <div className="action-row">
                      <Confirm
                        title="Accept this candidate?"
                        description={`Assign ${job?.title} to ${user?.full_name}. The real backend must verify employer ownership and worker eligibility.`}
                        trigger={
                          <Button size="sm">
                            <Check />
                            Accept
                          </Button>
                        }
                        onConfirm={() => reviewApplication(a.id, "accepted")}
                      />
                      <Confirm
                        title="Reject this application?"
                        description="The worker’s application will be marked rejected in the demo."
                        trigger={
                          <Button variant="outline" size="sm">
                            Reject
                          </Button>
                        }
                        onConfirm={() => reviewApplication(a.id, "rejected")}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="small muted py-5">All caught up. No pending applications.</div>
            )}
          </section>
        </div>
        <aside className="stack dashboard-aside">
          <section className="panel">
            <div className="panel-title">
              <h3>Workers nearby</h3>
              <Link to="/find-workers" className="text-link">
                View all
              </Link>
            </div>
            {users
              .filter((u) => u.role === "worker" && u.is_available)
              .slice(0, 3)
              .map((w, i) => (
                <div className="list-row" key={w.id}>
                  <Avatar name={w.full_name} tone={i} />
                  <div className="list-row-content">
                    <h4>{w.full_name}</h4>
                    <p>
                      {w.skill_category} · {w.distance} km
                    </p>
                  </div>
                  <Rating value={w.rating} />
                </div>
              ))}
          </section>
          <section className="panel">
            <IconBox tone="green">
              <ShieldCheck />
            </IconBox>
            <h3 className="mt-4">Hire with clarity.</h3>
            <p className="small muted mt-2">
              Set the wage, duration, and location before posting. Every assignment needs your
              approval.
            </p>
            <Link to="/architecture" className="text-link mt-4">
              Our safety approach <ArrowRight />
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
export function JobDetails({ jobId }: { jobId: string }) {
  const { jobs, role, applications, apply, updateJobStatus, reviewApplication, users, currentUser, live } = useDemo();
  const job = jobs.find((j) => j.id === jobId);
  if (!job)
    return (
      <AppShell>
        <div className="empty-state">
          <BriefcaseBusiness />
          <h3>Job not found</h3>
          <p className="mt-2">This job may have been completed or removed.</p>
          <Button asChild className="mt-5">
            <Link to="/find-work">Find other work</Link>
          </Button>
        </div>
      </AppShell>
    );
  const app = applications.find((a) => a.job_id === jobId && (a.worker_id === currentUser?.id || (!live && a.worker_id === "w1")));
  const own = role === "employer" && (job.employer_id === currentUser?.id || (!live && job.employer_id === "e1"));
  const candidates = applications.filter((a) => a.job_id === jobId);
  return (
    <AppShell>
      <Link to={role === "employer" ? "/employer" : "/find-work"} className="text-link mb-6">
        ← Back to {role === "employer" ? "your jobs" : "jobs"}
      </Link>
      <PageHeading
        title={job.title}
        hindi={`${job.required_skill} · ${hindiSkills[job.required_skill]} · ${job.location}`}
        action={
          <Pill tone={job.status === "open" ? "success" : "neutral"}>
            {job.status.replace("_", " ").toUpperCase()}
          </Pill>
        }
      />
      <div className="details-grid">
        <div className="stack">
          <section className="panel">
            <h3>About the work · काम की जानकारी</h3>
            <p className="mt-4 text-sm text-muted-foreground leading-7">{job.description}</p>
            <div className="detail-facts">
              {[
                { icon: Wallet, label: "Offered wage", value: `${rupees(job.offered_wage)} / day` },
                {
                  icon: CalendarDays,
                  label: "Start date",
                  value: `${dateLabel(job.starts_at)} 2026`,
                },
                { icon: Clock3, label: "Duration", value: `${job.duration_days} days` },
                { icon: MapPin, label: "Location", value: job.location },
              ].map((f) => (
                <div className="detail-fact" key={f.label}>
                  <IconBox>
                    <f.icon />
                  </IconBox>
                  <div>
                    <span>{f.label}</span>
                    <strong>{f.value}</strong>
                  </div>
                </div>
              ))}
            </div>
            <hr className="rule" />
            <h3>Employer details</h3>
            <div className="flex-row mt-4">
              <Avatar name={job.employer} />
              <div>
                <strong>{job.employer}</strong>
                <p className="small muted">Homeowner · Jaipur · Sample OTP-verified profile</p>
                <Rating value={4.9} />
              </div>
            </div>
          </section>
          <section className="panel">
            <h3>{own ? "Job activity" : "Application timeline"} · आवेदन का सफर</h3>
            <Timeline
              items={[
                {
                  title: app ? "Application submitted" : "Review the job",
                  description: app
                    ? `Submitted ${dateLabel(app.created_at)} · sample record`
                    : "Check wage, location, and work details.",
                  done: true,
                },
                {
                  title: app?.status === "rejected" ? "Application rejected" : "Employer review",
                  description:
                    app?.status === "rejected"
                      ? "The employer declined this sample application."
                      : app?.status === "accepted" || app?.status === "completed"
                        ? "Your application has been accepted."
                        : "Employer reviews applications before assigning work.",
                  done: !!app && app.status !== "pending",
                },
                {
                  title: "Work in progress",
                  description: "Start only after confirming the assignment.",
                  done: job.status === "in_progress" || job.status === "completed",
                },
                {
                  title: "Completed & recorded",
                  description: "Rating and payment records appear in your digital khata.",
                  done: job.status === "completed",
                },
              ]}
            />
          </section>
          {own && (
            <section className="panel">
              <h3>Applicants</h3>
              {candidates.length ? (
                candidates.map((a) => (
                  <div className="list-row flex-wrap" key={a.id}>
                    <Avatar name={users.find((u) => u.id === a.worker_id)?.full_name || "Worker"} />
                    <div className="list-row-content">
                      <h4>{users.find((u) => u.id === a.worker_id)?.full_name}</h4>
                      <Pill tone={a.status === "accepted" ? "success" : "warm"}>{a.status}</Pill>
                    </div>
                    {a.status === "pending" && (
                      <div className="action-row">
                        <Confirm
                          title="Accept application?"
                          description="This assigns the job in the demo after a simulated ownership check."
                          trigger={<Button size="sm">Accept</Button>}
                          onConfirm={() => reviewApplication(a.id, "accepted")}
                        />
                        <Confirm
                          title="Reject application?"
                          description="This marks the application rejected in the demo."
                          trigger={
                            <Button variant="outline" size="sm">
                              Reject
                            </Button>
                          }
                          onConfirm={() => reviewApplication(a.id, "rejected")}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="small muted mt-4">No sample applications yet.</p>
              )}
            </section>
          )}
          {job.status === "completed" && (
            <section className="panel">
              <h3>Completion record</h3>
              <div className="between mt-4">
                <div>
                  <strong>{rupees(job.offered_wage * job.duration_days)} recorded</strong>
                  <p className="small muted">Sample payment record · not a money transfer</p>
                </div>
                <Rating value={5} />
              </div>
              <Link to="/history" className="text-link mt-4">
                View digital khata <ArrowRight />
              </Link>
            </section>
          )}
        </div>
        <aside className="stack">
          <section className="panel">
            <span className="small muted">Expected earnings · अनुमानित कमाई</span>
            <strong className="block text-3xl text-primary mt-2">
              {rupees(job.offered_wage * job.duration_days)}
            </strong>
            <p className="small muted mt-2">
              {rupees(job.offered_wage)} × {job.duration_days} days
            </p>
            <hr className="rule" />
            {own ? (
              <>
                <p className="small muted mb-4">
                  Manage this sample job. Changes require your confirmation.
                </p>
                {job.status === "assigned" && (
                  <Confirm
                    title="Start this job?"
                    description="Move this assigned job to In Progress in the demo."
                    trigger={<Button className="w-full">Start work</Button>}
                    onConfirm={() => updateJobStatus(jobId, "in_progress")}
                  />
                )}{" "}
                {job.status === "in_progress" && (
                  <Confirm
                    title="Mark work completed?"
                    description="Confirm the work is complete. No payment will be transferred."
                    trigger={
                      <Button className="w-full">
                        <Check />
                        Mark completed
                      </Button>
                    }
                    onConfirm={() => updateJobStatus(jobId, "completed")}
                  />
                )}{" "}
                {job.status === "open" && (
                  <Confirm
                    title="Cancel this job?"
                    description="The sample job will stop accepting applications."
                    trigger={
                      <Button variant="outline" className="w-full">
                        Cancel job
                      </Button>
                    }
                    onConfirm={() => updateJobStatus(jobId, "cancelled")}
                  />
                )}
              </>
            ) : app ? (
              <>
                <Pill tone={app.status === "accepted" ? "success" : "warm"}>
                  Application {app.status}
                </Pill>
                <p className="small muted mt-3">
                  {app.status === "pending"
                    ? "आपका आवेदन समीक्षा में है। We’ll show the employer’s decision here."
                    : app.status === "rejected"
                      ? "This sample application was declined. Explore another opportunity."
                      : "Your sample application is saved."}
                </p>
              </>
            ) : job.status === "open" ? (
              <Confirm
                title="Apply for this job?"
                description={`${job.title} · ${rupees(job.offered_wage)}/day · ${job.duration_days} days. Your worker profile will be attached to a simulated application.`}
                trigger={
                  <Button className="button-large w-full">
                    <BriefcaseBusiness />
                    Apply now · आवेदन करें
                  </Button>
                }
                label="Confirm application"
                onConfirm={() => apply(job)}
              />
            ) : (
              <Pill tone="neutral">Applications closed</Pill>
            )}
            <div className="flex-row small muted mt-4">
              <ShieldCheck className="h-4 w-4" />
              You approve every action.
            </div>
          </section>
          <DemoNote>
            Backend validation in production: authenticated role, job status, ownership, and
            duplicate application checks.
          </DemoNote>
          <section className="panel">
            <IconBox tone="green">
              <Mic />
            </IconBox>
            <h3 className="mt-4">Need help understanding?</h3>
            <p className="small muted mt-2">
              Ask about the work in Hindi or English. काम के बारे में पूछिए।
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/assistant">
                AI Assistant <ArrowRight />
              </Link>
            </Button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}