import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  Mic,
  ShieldCheck,
  UserRound,
  UsersRound,
  Check,
  MapPin,
  Bell,
  BriefcaseBusiness,
  Star,
  Wallet,
  History,
  CalendarDays,
  Download,
  Save,
  Languages,
  CircleCheck,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/e-chowk/store";
import { api, ApiError, setSession, type Session } from "@/lib/e-chowk/api";
import { skills, payments, ratings, rupees, dateLabel, type Role } from "@/lib/e-chowk/data";
import {
  Brand,
  AppShell,
  PageHeading,
  DemoNote,
  Pill,
  Avatar,
  Rating,
  IconBox,
  Stat,
  Confirm,
} from "./shared";
import { toast } from "sonner";
export function Login() {
  const navigate = useNavigate();
  const { setRole } = useDemo();
  const [pending, setPending] = useState<Session | null>(null);
  const fail = (e: unknown) => {
    const msg = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
    setError(msg);
    toast.error(msg);
  };
  const [step, setStep] = useState<"phone" | "otp" | "role">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState<Role>("worker");
  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <Brand />
        <div>
          <IconBox tone="green">
            <Mic />
          </IconBox>
          <h1 className="mt-6">
            Har hunar ko kaam.
            <br />
            Har kaam ko kaamgar.
          </h1>
          <p>आपकी पहचान, आपका हुनर, आपका चौक। One identity across phone, app, and web.</p>
          <div className="action-row mt-6">
            <Pill>Hindi + English</Pill>
            <Pill>Phone-first identity</Pill>
          </div>
        </div>
        <small>Secure phone sign-in · सुरक्षित लॉगिन</small>
      </aside>
      <main className="auth-form-panel">
        <div className="auth-form">
          <IconBox>
            <ShieldCheck />
          </IconBox>
          <h1>
            {step === "phone"
              ? "Welcome to your Chowk."
              : step === "otp"
                ? "Verify your number."
                : "How will you use E-Chowk?"}
          </h1>
          <p className="muted small">
            {step === "phone"
              ? "नमस्ते! अपना मोबाइल नंबर डालिए।"
              : step === "otp"
                ? `SMS में आया कोड डालिए। Sent to +91 ${phone}.`
                : "आप काम ढूँढ रहे हैं या कामगार?"}
          </p>
          <div className="mt-5">
            <DemoNote>
              {step === "otp"
                ? "Code is valid for a few minutes · कोड किसी के साथ साझा न करें।"
                : "We will send a 6-digit code by SMS · SMS से कोड भेजा जाएगा।"}
            </DemoNote>
          </div>
          {step !== "role" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                if (step === "phone") {
                  if (!/^[6-9]\d{9}$/.test(phone)) {
                    setError("Enter a valid 10-digit Indian mobile number.");
                    return;
                  }
                  setBusy(true);
                  api
                    .sendOtp(`+91${phone}`)
                    .then(() => {
                      setStep("otp");
                      toast.success("OTP sent · कोड भेज दिया");
                    })
                    .catch(fail)
                    .finally(() => setBusy(false));
                } else {
                  if (!/^\d{6}$/.test(otp)) {
                    setError("Enter the 6-digit code.");
                    return;
                  }
                  setBusy(true);
                  api
                    .verifyOtp(`+91${phone}`, otp)
                    .then((res) => {
                      const r = res as unknown as Record<string, unknown>;
                      const token = String(r["access_token"] ?? r["accessToken"] ?? "");
                      if (!token || !r["user"])
                        throw new ApiError("Unexpected sign-in response.", 500);
                      const s = { access_token: token, user: r["user"] as Session["user"] };
                      if (s.user.role === "worker" || s.user.role === "employer") {
                        setSession(s);
                        setRole(s.user.role);
                        toast.success("Signed in · स्वागत है");
                        void navigate({ to: s.user.role === "worker" ? "/worker" : "/employer" });
                      } else {
                        setPending(s);
                        setSession(s);
                        setStep("role");
                      }
                    })
                    .catch(fail)
                    .finally(() => setBusy(false));
                }
              }}
            >
              {step === "phone" ? (
                <label className="form-field">
                  <span>Mobile number · मोबाइल नंबर</span>
                  <div className="auth-phone">
                    <span>🇮🇳 +91</span>
                    <input
                      aria-label="Indian mobile number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </label>
              ) : (
                <label className="form-field">
                  <span>6-digit OTP · सत्यापन कोड</span>
                  <input
                    aria-label="OTP"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="text-destructive text-xs mb-4">
                  {error}
                </p>
              )}
              <Button type="submit" className="button-large" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : step === "phone"
                    ? "Get OTP · कोड प्राप्त करें"
                    : "Verify · पुष्टि करें"}
                <ArrowRight />
              </Button>
              {step === "otp" && (
                <div className="between mt-3">
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                    }}
                  >
                    Change number
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      api
                        .sendOtp(`+91${phone}`)
                        .then(() => toast.success("New code sent · नया कोड भेजा"))
                        .catch(fail)
                        .finally(() => setBusy(false));
                    }}
                  >
                    Resend code
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <>
              <div className="role-choice">
                <Button
                  variant={chosen === "worker" ? "default" : "outline"}
                  onClick={() => setChosen("worker")}
                >
                  <UserRound className="h-6! w-6!" />
                  <span>Find work · काम ढूँढें</span>
                </Button>
                <Button
                  variant={chosen === "employer" ? "default" : "outline"}
                  onClick={() => setChosen("employer")}
                >
                  <UsersRound className="h-6! w-6!" />
                  <span>Hire workers</span>
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-destructive text-xs mb-4">
                  {error}
                </p>
              )}
              <Button
                className="button-large"
                disabled={busy}
                onClick={() => {
                  setError("");
                  setBusy(true);
                  api
                    .setRole(chosen)
                    .then((res) => {
                      const r = (res ?? {}) as Record<string, unknown>;
                      const token = String(
                        r["access_token"] ?? r["accessToken"] ?? pending?.access_token ?? "",
                      );
                      const user = (r["user"] ??
                        (r["id"] ? r : null) ?? {
                          ...pending?.user,
                          role: chosen,
                        }) as Session["user"];
                      setSession({
                        access_token: token,
                        user: { ...user, role: user.role ?? chosen },
                      });
                      setRole(chosen);
                      toast.success("Welcome · स्वागत है");
                      void navigate({ to: chosen === "worker" ? "/worker" : "/employer" });
                    })
                    .catch(fail)
                    .finally(() => setBusy(false));
                }}
              >
                Enter your Chowk <ArrowRight />
              </Button>
            </>
          )}
          <div className="mt-5">
            <Button asChild variant="outline" className="button-large">
              <Link to="/voice">
                <Phone />
                Continue with voice call
              </Link>
            </Button>
          </div>
          <p className="small muted mt-5">
            Your phone number identifies you. Backend permissions control what each role can do.
          </p>
          <Link to="/" className="auth-back">
            <ArrowLeft />
            Back to E-Chowk
          </Link>
        </div>
      </main>
    </div>
  );
}
export function Profile() {
  const { role, currentUser, updateProfile } = useDemo();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.full_name || "",
    skill: currentUser?.skill_category || "Plumber",
    city: currentUser?.current_location || "Jaipur",
    wage: currentUser?.daily_wage || 800,
  });
  const [prefs, setPrefs] = useState({
    jobs: true,
    applications: true,
    calls: true,
    updates: false,
  });
  return (
    <AppShell>
      <PageHeading
        title="Your profile"
        hindi="आपकी पहचान, आपका हुनर। Your work story starts here."
        action={
          <Button
            className="button-large"
            onClick={() => {
              setForm({
                name: currentUser?.full_name || "",
                skill: currentUser?.skill_category || "Plumber",
                city: currentUser?.current_location || "Jaipur",
                wage: currentUser?.daily_wage || 800,
              });
              setEditing(true);
            }}
          >
            <UserRound />
            Edit profile
          </Button>
        }
      />
      <div className="details-grid">
        <div className="stack">
          <section className="panel">
            <div className="panel-title">
              <h3>Personal information</h3>
              <Pill tone="success">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Pill>
            </div>
            {[
              ["Full name", currentUser?.full_name],
              ["Mobile number", `+91 ${currentUser?.phone_number}`],
              ["Role", role === "admin" ? "Admin demo" : role],
              ["City / location", currentUser?.current_location],
              ["Registration source", `${currentUser?.source} · sample registration`],
            ].map(([label, value]) => (
              <div key={label} className="profile-fact">
                <span className="muted">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
          {role === "worker" && (
            <section className="panel">
              <h3>Work preferences · काम की पसंद</h3>
              <div className="profile-fact mt-3">
                <span className="muted">Primary skill</span>
                <strong>{currentUser?.skill_category}</strong>
              </div>
              <div className="profile-fact">
                <span className="muted">Daily wage expectation</span>
                <strong>{rupees(currentUser?.daily_wage || 0)}/day</strong>
              </div>
              <div className="profile-fact">
                <span className="muted">Experience</span>
                <strong>{currentUser?.experience} years</strong>
              </div>
              <div className="preference-row">
                <div>
                  <strong>Available for work</strong>
                  <p>काम के लिए उपलब्ध · Visible to employers in the demo</p>
                </div>
                <Switch
                  checked={currentUser?.is_available ?? false}
                  onCheckedChange={(value: boolean) => updateProfile({ is_available: value })}
                  aria-label="Profile availability"
                />
              </div>
            </section>
          )}
          <section className="panel">
            <h3>Notification preferences</h3>
            {(
              [
                {
                  key: "jobs",
                  label: role === "employer" ? "New applicants" : "Job opportunities",
                  text: "Relevant local opportunities and requests.",
                },
                {
                  key: "applications",
                  label: "Application updates",
                  text: "Keep up with decisions and job progress.",
                },
                {
                  key: "calls",
                  label: "Voice & call events",
                  text: "Registration and voice session activity.",
                },
                {
                  key: "updates",
                  label: "Product updates",
                  text: "Occasional updates about E-Chowk.",
                },
              ] as const
            ).map((p) => (
              <div key={p.key} className="preference-row">
                <div>
                  <strong>{p.label}</strong>
                  <p>{p.text}</p>
                </div>
                <Switch
                  aria-label={p.label}
                  checked={prefs[p.key]}
                  onCheckedChange={(checked: boolean) => {
                    setPrefs((prev) => ({ ...prev, [p.key]: checked }));
                    toast.success("Preference saved for this demo session");
                  }}
                />
              </div>
            ))}
          </section>
        </div>
        <aside className="stack">
          <section className="panel profile-summary">
            <Avatar name={currentUser?.full_name || "Worker"} large />
            <h2>{currentUser?.full_name}</h2>
            <p>{role === "worker" ? currentUser?.skill_category : "Employer"} · Jaipur</p>
            <Rating value={currentUser?.rating || 4.8} />
            <hr className="rule" />
            <div className="between small mb-2">
              <strong>Profile completeness</strong>
              <span>80%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
            <p>Add secondary skills and a profile photo in the mobile app.</p>
            <Pill tone="neutral">Profile photo upload · Coming soon</Pill>
          </section>
          <section className="panel">
            <IconBox tone="green">
              <Phone />
            </IconBox>
            <h3 className="mt-4">Bolo aur jud jao.</h3>
            <p className="small muted mt-2">
              Explore the phone-first registration flow, built for workers who prefer speaking.
            </p>
            <Link to="/voice" className="text-link mt-4">
              Try voice registration <ArrowRight />
            </Link>
          </section>
          <DemoNote>
            One identity across channels. Real phone verification and permissions are handled by the
            existing backend.
          </DemoNote>
        </aside>
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogTitle>Edit your demo profile</DialogTitle>
          <DialogDescription>
            Review your details. Only your own sample profile will change.
          </DialogDescription>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile({
                full_name: form.name,
                current_location: form.city,
                skill_category: form.skill,
                daily_wage: form.wage,
              });
              setEditing(false);
            }}
          >
            <label className="form-field">
              <span>Full name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>Location</span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </label>
            {role === "worker" && (
              <div className="grid-2">
                <label className="form-field">
                  <span>Primary skill</span>
                  <select
                    value={form.skill}
                    onChange={(e) => setForm((prev) => ({ ...prev, skill: e.target.value }))}
                  >
                    {skills.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Wage expectation · ₹/day</span>
                  <input
                    type="number"
                    min={100}
                    required
                    value={form.wage}
                    onChange={(e) => setForm((prev) => ({ ...prev, wage: Number(e.target.value) }))}
                  />
                </label>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save />
                Confirm & save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
export function Notifications() {
  const { notifications, markRead } = useDemo();
  const [filter, setFilter] = useState("all");
  const shown = notifications.filter((n) => filter !== "unread" || !n.read);
  const icons = {
    job: BriefcaseBusiness,
    application: Check,
    voice: Phone,
    payment: Wallet,
    rating: Star,
  };
  return (
    <AppShell>
      <PageHeading
        title="Notifications"
        hindi="आपके चौक की हर खबर। Stay up to date."
        action={
          <Button
            variant="outline"
            className="button-large"
            onClick={() => {
              markRead();
              toast.success("All notifications marked read");
            }}
          >
            <Check />
            Mark all read
          </Button>
        }
      />
      <div className="action-row mb-5">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All updates
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </Button>
      </div>
      <div className="panel p-0 overflow-hidden">
        {shown.length ? (
          shown.map((n) => {
            const Icon = icons[n.type];
            return (
              <div key={n.id} className={`notification-row ${n.read ? "" : "unread"}`}>
                <IconBox tone={n.type === "job" ? "green" : n.type === "payment" ? "orange" : ""}>
                  <Icon />
                </IconBox>
                <div className="flex-1 min-w-0">
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                  {!n.read && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2"
                      onClick={() => markRead(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
                <div className="text-right">
                  <small>{n.time}</small>
                  {!n.read && <span className="dot block ml-auto mt-2" />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state border-0">
            <Bell />
            <h3>You’re all caught up.</h3>
            <p className="mt-2">कोई नई सूचना नहीं है। New updates will appear here.</p>
          </div>
        )}
      </div>
      <div className="mt-6">
        <DemoNote>
          Notifications reflect sample job, application, voice, payment record, and rating events.
        </DemoNote>
      </div>
    </AppShell>
  );
}
export function HistoryPage() {
  const { jobs } = useDemo();
  const [filter, setFilter] = useState("all");
  const completed = jobs.filter((j) => j.status === "completed");
  const paymentRows = payments.filter((p) => filter === "all" || p.status === filter);
  return (
    <AppShell>
      <PageHeading
        title="Digital Khata"
        hindi="मेहनत का हिसाब, साफ़ और सरल। Your work, earnings, and trust."
        action={
          <Button
            variant="outline"
            className="button-large"
            onClick={() => {
              const csv =
                "Job,Amount,Status,Date\n" +
                payments
                  .map(
                    (p) =>
                      `${jobs.find((j) => j.id === p.job_id)?.title},${p.amount},${p.status},${p.date}`,
                  )
                  .join("\n");
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = "e-chowk-demo-khata.csv";
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Sample khata downloaded");
            }}
          >
            <Download />
            Download record
          </Button>
        }
      />
      <div className="stats-row">
        <Stat
          label="Recorded earnings"
          value={rupees(payments.reduce((sum, p) => sum + p.amount, 0))}
          note="This sample period"
          icon={<Wallet />}
        />
        <Stat
          label="Completed jobs"
          value={completed.length}
          note="Sample work records"
          icon={<BriefcaseBusiness />}
        />
        <Stat label="Average rating" value="4.9" note="From these jobs" icon={<Star />} />
        <Stat
          label="Payment transfers"
          value="Not live"
          note="Production payments coming soon"
          icon={<ShieldCheck />}
        />
      </div>
      <div className="notice warm mb-6">
        <Wallet />
        <span>
          <strong>Payment integration · Coming soon.</strong> This khata shows sample cash/UPI
          records only. E-Chowk has not collected, transferred, or verified any money.
        </span>
      </div>
      <div className="stack">
        <section className="panel">
          <div className="panel-title">
            <h3>Payment records · भुगतान का हिसाब</h3>
            <select
              className="filter-input w-auto! text-xs!"
              aria-label="Transaction status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All records</option>
              <option value="recorded">Recorded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {paymentRows.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>WORK</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>METHOD</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to="/jobs/$jobId" params={{ jobId: p.job_id }}>
                          <strong>{jobs.find((j) => j.id === p.job_id)?.title}</strong>
                          <small>Jaipur · completed</small>
                        </Link>
                      </td>
                      <td>{p.date}</td>
                      <td>
                        <strong className="text-primary">{rupees(p.amount)}</strong>
                      </td>
                      <td>{p.method}</td>
                      <td>
                        <Pill tone="success">{p.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Wallet />
              <h3>No pending payment records</h3>
              <p className="mt-2">All sample records are recorded.</p>
            </div>
          )}
        </section>
        <section className="panel">
          <h3>Your completed work</h3>
          {completed.map((j) => {
            const review = ratings.find((r) => r.job_id === j.id);
            return (
              <div className="list-row" key={j.id}>
                <IconBox tone="green">
                  <Check />
                </IconBox>
                <div className="list-row-content">
                  <h4>{j.title}</h4>
                  <p>
                    {j.employer} · {dateLabel(j.starts_at)} · {j.duration_days} days
                  </p>
                  {review && <p>“{review.comment}”</p>}
                </div>
                <div className="text-right">
                  <strong className="text-primary text-sm">
                    {rupees(j.offered_wage * j.duration_days)}
                  </strong>
                  <div>
                    <Rating value={review?.score || 5} />
                  </div>
                </div>
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: j.id }}
                  aria-label={`View completed ${j.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}