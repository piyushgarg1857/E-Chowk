import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Mic,
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Check,
  BriefcaseBusiness,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppShell, PageHeading, DemoNote, IconBox, Pill } from "./shared";
import { useDemo } from "@/lib/e-chowk/store";
import { skills, rupees, dateLabel } from "@/lib/e-chowk/data";
export function CreateJob() {
  const { createJob, role, setRole, live } = useDemo();
  const navigate = useNavigate();
  const [review, setReview] = useState(false);
  const [assist, setAssist] = useState(false);
  const [speech, setSpeech] = useState(
    "Kal Jaipur ke Mansarovar mein bathroom ki fitting aur pipe repair ke liye plumber chahiye. 900 rupaye roz, 2 din ka kaam.",
  );
  const [busy, setBusy] = useState(false);
  const initialStart = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    skill: "Plumber",
    title: "",
    description: "",
    location: "Mansarovar, Jaipur",
    wage: "900",
    duration: "2",
    start: initialStart,
    status: "open",
  });
  function change(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <AppShell area="employer">
      <PageHeading title="Post a job" hindi="काम की जानकारी दें। Help the right worker find you." />
      <div className="details-grid">
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (new Date(form.start).getTime() <= Date.now()) {
              toast.error("Start time must be in the future.");
              return;
            }
            setReview(true);
          }}
        >
          <section className="panel">
            <div className="panel-title">
              <h3>Work details · काम की जानकारी</h3>
              <Pill>Job draft</Pill>
            </div>
            <div className="stack">
              <div className="grid-2">
                <label className="form-field">
                  <span>Required skill · ज़रूरी हुनर *</span>
                  <select value={form.skill} onChange={(e) => change("skill", e.target.value)}>
                    {skills.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Job title *</span>
                  <input
                    required
                    maxLength={100}
                    placeholder="e.g. Bathroom fitting & pipe repair"
                    value={form.title}
                    onChange={(e) => change("title", e.target.value)}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Description · काम का विवरण *</span>
                <textarea
                  required
                  placeholder="What needs to be done? Mention tools, materials, and any special requirements."
                  value={form.description}
                  onChange={(e) => change("description", e.target.value)}
                />
              </label>
              <label className="form-field">
                <span>Location · काम की जगह *</span>
                <input
                  required
                  value={form.location}
                  onChange={(e) => change("location", e.target.value)}
                />
              </label>
              <div className="grid-2">
                <label className="form-field">
                  <span>Offered wage · ₹ per day *</span>
                  <input
                    type="number"
                    required
                    min={100}
                    max={100000}
                    value={form.wage}
                    onChange={(e) => change("wage", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Duration · days *</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={365}
                    value={form.duration}
                    onChange={(e) => change("duration", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Start date & time *</span>
                  <input
                    type="datetime-local"
                    required
                    min={initialStart}
                    value={form.start}
                    onChange={(e) => change("start", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Initial job status</span>
                  <select value={form.status} onChange={(e) => change("status", e.target.value)}>
                    <option value="open">Open · Accepting applications</option>
                    <option value="draft">Draft · Not published</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
          <DemoNote>
            Review your structured job before publishing. Production backend checks employer role,
            field validation, and ownership.
          </DemoNote>
          <div className="between">
            <Link to="/employer" className="text-link">
              Cancel
            </Link>
            <Button type="submit" className="button-large">
              <ClipboardCheck />
              Review job <ArrowRight />
            </Button>
          </div>
        </form>
        <aside className="stack">
          <section className="panel">
            <IconBox tone="green">
              <Mic />
            </IconBox>
            <h3 className="mt-4">Bol kar kaam batayein.</h3>
            <p className="small muted mt-3">
              Describe the work in Hindi or Hinglish. The demo turns your description into fields
              for you to review.
            </p>
            <Button
              className="button-large mt-5 w-full"
              variant="outline"
              onClick={() => setAssist(true)}
            >
              <Mic />
              Describe the work in Hindi
            </Button>
            <p className="small muted mt-4">
              Simulated AI assist · Production AI tool calling is coming soon.
            </p>
          </section>
          <section className="panel">
            <h3>A clear job gets better responses.</h3>
            <div className="stack mt-5">
              {[
                "Be specific about the required skill.",
                "Set a fair daily wage.",
                "Mention tools and materials.",
                "Share a clear location and start time.",
              ].map((s) => (
                <div key={s} className="flex-row small muted">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <Dialog open={assist} onOpenChange={setAssist}>
        <DialogContent>
          <DialogTitle>Describe your work · अपनी बात बताइए</DialogTitle>
          <DialogDescription>
            Text-based voice-flow simulation. No audio is recorded and no AI service is called.
          </DialogDescription>
          <label className="form-field">
            <span>Hindi / Hinglish description</span>
            <textarea value={speech} onChange={(e) => setSpeech(e.target.value)} />
          </label>
          <DemoNote>
            The AI proposes fields. You review and confirm; it cannot publish a job by itself.
          </DemoNote>
          <Button
            disabled={busy || !speech.trim()}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                const skill =
                  skills.find((s) => speech.toLowerCase().includes(s.toLowerCase())) ||
                  (/पेंटर/.test(speech)
                    ? "Painter"
                    : /प्लंबर/.test(speech)
                      ? "Plumber"
                      : "Plumber");
                const wage = speech.match(/(\d{3,5})\s*(rup|rupee|रुप|₹)/i)?.[1] || "900";
                const duration = speech.match(/(\d+)\s*(din|day|दिन)/i)?.[1] || "2";
                setForm((prev) => ({
                  ...prev,
                  skill,
                  title:
                    skill === "Plumber"
                      ? "Bathroom fitting & pipe repair"
                      : `${skill} work in Jaipur`,
                  description: speech,
                  location: "Mansarovar, Jaipur",
                  wage,
                  duration,
                }));
                setBusy(false);
                setAssist(false);
                toast.success("Demo intent extracted. Review all fields before publishing.");
              }, 1000);
            }}
          >
            {busy ? "Understanding your request…" : "Fill draft fields (demo)"}
            <ArrowRight />
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent>
          <DialogTitle>
            Review before {form.status === "draft" ? "saving" : "publishing"}
          </DialogTitle>
          <DialogDescription>
            आपकी पुष्टि ज़रूरी है। Check the details workers will see.
          </DialogDescription>
          <div className="job-review">
            {[
              ["Job", form.title],
              ["Required skill", form.skill],
              ["Location", form.location],
              ["Daily wage", rupees(Number(form.wage))],
              ["Duration", `${form.duration} days`],
              ["Starts", `${dateLabel(form.start)} at ${form.start.split("T")[1]}`],
              ["Total estimate", rupees(Number(form.wage) * Number(form.duration))],
              ["Status", form.status],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="muted">{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <p className="small muted">{form.description}</p>
          <DemoNote>
            {live
              ? "This job will be published live to the E-Chowk marketplace."
              : "Creates a sample job in this session only. Nothing is posted to the real marketplace."}
          </DemoNote>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReview(false)}>
              Edit details
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                if (busy) return;
                if (role !== "employer") {
                  toast.error("Select Employer demo before publishing.");
                  setRole("employer");
                  return;
                }
                setBusy(true);
                void (async () => {
                  try {
                    const id = await createJob({
                      required_skill: form.skill,
                      title: form.title,
                      description: form.description,
                      location: form.location,
                      offered_wage: Number(form.wage),
                      duration_days: Number(form.duration),
                      starts_at: form.start,
                      status: form.status === "draft" ? "draft" : "open",
                    });
                    if (id) {
                      setReview(false);
                      void navigate({ to: "/jobs/$jobId", params: { jobId: id } });
                    }
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              <Check />
              {form.status === "draft" ? "Confirm & save draft" : "Confirm & publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}