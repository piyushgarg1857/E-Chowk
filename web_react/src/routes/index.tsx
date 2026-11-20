import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Mic,
  Search,
  UsersRound,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  Languages,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  Car,
  HardHat,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SiteHeader,
  SiteFooter,
  ChannelIcons,
  JobCard,
  ArchitectureStrip,
  IconBox,
} from "@/components/e-chowk/shared";
import { useDemo } from "@/lib/e-chowk/store";
import { pageHead, skills } from "@/lib/e-chowk/data";
import { api, ApiError, type Session } from "@/lib/e-chowk/api";
import { toast } from "sonner";
import workersPhoto from "@/assets/workers.jpg";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Kaam bhi. Kaamgar bhi. AI ke saath.",
      "E-Chowk connects India’s workers and employers through Hindi-first voice, mobile and web. Explore an interactive marketplace prototype.",
    ),
  component: Home,
});
const skillIcons = [Wrench, Zap, Hammer, Paintbrush, BrickWall, Car, HardHat];
function Home() {
  const navigate = useNavigate();
  const { jobs, setRole, live, currentUser, role, signIn, signOut } = useDemo();
  const [skill, setSkill] = useState("All");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [loginChannel, setLoginChannel] = useState<"sms" | "whatsapp">("sms");
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const quickDemoLogin = async (demoPhone: string, targetRole: "worker" | "employer") => {
    setLoginError("");
    setBusy(true);
    try {
      const res = await api.verifyOtp(demoPhone, "123456");
      const r = res as unknown as Record<string, unknown>;
      const token = String(r["access_token"] ?? r["accessToken"] ?? "");
      if (!token || !r["user"]) throw new ApiError("Sign-in failed.", 500);
      const s = { access_token: token, user: r["user"] as Session["user"] };
      signIn(s);
      setRole(targetRole);
      toast.success(`Demo signed in as ${targetRole === "worker" ? "Worker" : "Employer"} · स्वागत है`);
      void navigate({ to: targetRole === "worker" ? "/worker" : "/employer" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Error signing in";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (loginStep === "phone") {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setLoginError("Enter valid 10-digit Indian mobile number");
        return;
      }
      setBusy(true);
      try {
        const res = await api.sendOtp(`+91${phone}`, loginChannel);
        setLoginStep("otp");
        toast.success(res.message || `${loginChannel.toUpperCase()} OTP sent · कोड भेज दिया`);
      } catch (err) {
        setLoginError(err instanceof ApiError ? err.message : "Failed to send OTP");
      } finally {
        setBusy(false);
      }
    } else {
      if (!/^\d{6}$/.test(otp)) {
        setLoginError("Enter 6-digit OTP");
        return;
      }
      setBusy(true);
      try {
        const res = await api.verifyOtp(`+91${phone}`, otp);
        const r = res as unknown as Record<string, unknown>;
        const token = String(r["access_token"] ?? r["accessToken"] ?? "");
        if (!token || !r["user"]) throw new ApiError("Sign-in failed", 500);
        const s = { access_token: token, user: r["user"] as Session["user"] };
        signIn(s);
        const userRole = (s.user.role as "worker" | "employer") || "worker";
        setRole(userRole);
        toast.success("Signed in · स्वागत है");
        void navigate({ to: userRole === "worker" ? "/worker" : "/employer" });
      } catch (err) {
        setLoginError(err instanceof ApiError ? err.message : "Verification failed");
      } finally {
        setBusy(false);
      }
    }
  };

  const openJobs = jobs
    .filter((j) => j.status === "open" && (skill === "All" || j.required_skill === skill))
    .slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <img
            src={workersPhoto}
            width={1536}
            height={1024}
            alt="Skilled workers in Jaipur: a plumber, carpenter and painter"
            className="hero-photo"
            fetchPriority="high"
          />
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="hero-label">
                <span className="dot" />
                INDIA’S VOICE-FIRST LABOUR MARKETPLACE
              </div>
              <h1>
                E-Chowk<span>.</span>
              </h1>
              <p className="hero-hindi">हर हुनर को काम।</p>
              <p className="hero-tagline">Kaam bhi. Kaamgar bhi. AI ke saath.</p>
              <p className="hero-desc">
                Find work or hire nearby — just say what you need. अपनी बात बोलिए।
              </p>

              {live ? (
                <div className="p-4 rounded-2xl bg-card/95 border shadow-sm my-4 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {currentUser?.full_name ? currentUser.full_name.slice(0, 2) : "EC"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span>नमस्ते, {currentUser?.full_name || "उपयोगकर्ता"}!</span>
                          <span className="pill tone-success text-[11px] py-0 px-2">सक्रिय लॉगिन</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {currentUser?.role === "employer" ? "🏢 Employer (नियोक्ता)" : "🛠️ Worker (कारीगर)"}
                          {currentUser?.phone_number ? ` · +91 ${currentUser.phone_number}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild size="sm">
                        <Link to={role === "employer" ? "/employer" : "/worker"}>
                          Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/voice">
                          <Mic className="h-3.5 w-3.5 mr-1" />
                          Voice AI
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/profile">
                          <UserRound className="h-3.5 w-3.5 mr-1" />
                          Profile
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
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-card/95 border shadow-sm my-4 max-w-xl">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="dot" />
                      <strong className="text-sm">Main Page Instant Login · तुरंत लॉगिन</strong>
                    </div>
                    <span className="text-[11px] text-muted-foreground">बार-बार लॉगिन नहीं करना पड़ेगा</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start text-xs h-auto py-2 px-3 border-primary/30 hover:border-primary"
                      disabled={busy}
                      onClick={() => quickDemoLogin("+919999999999", "worker")}
                    >
                      <UserRound className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">🚀 Demo Worker (कारीगर)</div>
                        <div className="muted text-[10px]">+91 99999 99999</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start text-xs h-auto py-2 px-3 border-primary/30 hover:border-primary"
                      disabled={busy}
                      onClick={() => quickDemoLogin("+918888888888", "employer")}
                    >
                      <UsersRound className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">🏢 Demo Employer (नियोक्ता)</div>
                        <div className="muted text-[10px]">+91 88888 88888</div>
                      </div>
                    </Button>
                  </div>

                  {loginStep === "phone" && (
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setLoginChannel("sms")}
                        className={`flex-1 py-1 px-2.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          loginChannel === "sms"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                        }`}
                      >
                        <span>📲</span> SMS OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginChannel("whatsapp")}
                        className={`flex-1 py-1 px-2.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          loginChannel === "whatsapp"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                        }`}
                      >
                        <span>💬</span> WhatsApp OTP
                      </button>
                    </div>
                  )}

                  <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                    {loginStep === "phone" ? (
                      <div className="auth-phone flex-1 w-full">
                        <span>🇮🇳 +91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="Enter 10-digit mobile"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP (demo: 123456)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="input text-xs flex-1 w-full"
                      />
                    )}
                    <Button type="submit" size="sm" disabled={busy} className="w-full sm:w-auto shrink-0">
                      {busy ? "Wait..." : loginStep === "phone" ? "Get OTP" : "Verify & Login"}
                    </Button>
                    {loginStep === "otp" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLoginStep("phone");
                          setOtp("");
                        }}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    )}
                  </form>
                  {loginError && <p className="text-destructive text-xs mt-1.5">{loginError}</p>}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    💡 Client Demo: Any number works with demo OTP <strong className="text-foreground">123456</strong> without SMS delay.
                  </p>
                </div>
              )}
              <div className="hero-actions">
                <div className="hero-ctas">
                  <Button asChild variant="outline" className="button-large">
                    <Link to="/worker" onClick={() => setRole("worker")}>
                      <Search />
                      Find Work
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="button-large">
                    <Link to="/employer" onClick={() => setRole("employer")}>
                      <UsersRound />
                      Hire Workers
                    </Link>
                  </Button>
                </div>
                <div className="hero-voice">
                  <Button asChild className="button-large button-voice">
                    <Link to="/voice">
                      <Mic />
                      Voice AI <span>· बोलकर काम</span> <ArrowRight />
                    </Link>
                  </Button>
                  <span className="hero-voice-note">
                    <strong>Apni baat bolo.</strong>E-Chowk kaam samjhega.
                  </span>
                </div>
              </div>
              <div className="hero-proof">
                <span>
                  <ShieldCheck />
                  OTP-first identity
                </span>
                <span>
                  <Languages />
                  Hindi + English
                </span>
                <span>
                  <MapPin />
                  Local opportunities
                </span>
              </div>
            </div>
          </div>
          <div className="hero-photo-label">
            <IconBox tone="green">
              <HeartHandshake />
            </IconBox>
            <div>
              <strong>Real skills. New possibilities.</strong>
              <small>Built for India’s everyday workforce.</small>
            </div>
          </div>
        </section>
        <section className="home-section">
          <div className="container">
            <div className="section-title">
              <div>
                <span className="section-kicker">
                  <span className="dot" />
                  काम आपके आस-पास
                </span>
                <h2 className="mt-2">Your next opportunity is nearby.</h2>
                <p>Explore sample jobs from Jaipur’s neighbourhoods.</p>
              </div>
              <Link to="/find-work" onClick={() => setRole("worker")} className="text-link">
                Explore all jobs <ArrowRight />
              </Link>
            </div>
            <div className="home-skills">
              <Button
                variant="ghost"
                onClick={() => setSkill("All")}
                className={`skill-chip ${skill === "All" ? "active" : ""}`}
              >
                <Search />
                All work
              </Button>
              {skills.slice(0, 6).map((s, i) => {
                const Icon = skillIcons[i] || Wrench;
                return (
                  <Button
                    key={s}
                    variant="ghost"
                    onClick={() => setSkill(s)}
                    className={`skill-chip ${skill === s ? "active" : ""}`}
                  >
                    <Icon />
                    {s}
                  </Button>
                );
              })}
            </div>
            <div className="grid-3">
              {openJobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
              {openJobs.length === 0 && (
                <div className="empty-state">
                  No sample {skill.toLowerCase()} jobs right now. Try another skill.
                </div>
              )}
            </div>
            <div className="flex-row small muted mt-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Interactive product demo · Jobs and profiles shown are sample records.
            </div>
          </div>
        </section>
        <section className="home-inclusion">
          <div className="container inclusion-grid">
            <div>
              <span className="section-kicker">
                <Languages className="h-4 w-4" />
                YOUR LANGUAGE. YOUR OPPORTUNITY.
              </span>
              <h2>
                Typing isn’t for everyone.
                <br />
                Opportunity should be.
              </h2>
              <p>“Bhai, mujhe kal Jaipur mein plumber ka kaam chahiye.”</p>
              <p className="mt-3">
                बस इतना कहिए। E-Chowk understands your skill, location, and availability — so you
                can focus on the work, not the app.
              </p>
              <Button asChild variant="outline" className="button-large mt-5">
                <Link to="/voice">
                  <Mic />
                  Voice AI · बोलकर काम <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="inclusion-steps">
              {[
                {
                  title: "Say what you need",
                  hindi: "अपनी बात बोलो",
                  text: "Talk in Hindi, Hinglish, or English.",
                },
                {
                  title: "Review your options",
                  hindi: "अपने लिए सही काम चुनो",
                  text: "Compare the skill, wage, and location.",
                },
                {
                  title: "You make the final call",
                  hindi: "आपकी पुष्टि, आपका फैसला",
                  text: "Every application and hire needs your confirmation.",
                },
              ].map((s, i) => (
                <div className="inclusion-step" key={s.title}>
                  <span className="step-number">0{i + 1}</span>
                  <div>
                    <h3>
                      {s.title}
                      <small className="bilingual-subtext">{s.hindi}</small>
                    </h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="border-t border-border bg-card">
          <div className="container py-6">
            <div className="between">
              <div>
                <strong className="small">Trust by design · भरोसे के साथ</strong>
                <p className="small muted mt-1">
                  LLM understands intent. Backend authorizes action.
                </p>
              </div>
              <Link to="/architecture" className="text-link">
                Our architecture <ArrowRight />
              </Link>
            </div>
            <p className="small muted mt-3">
              Phone OTP identity, role-based permissions, and your confirmation before any
              application or hire.
            </p>
            <ArchitectureStrip />
            <ChannelIcons />
            <p className="small muted mt-4">
              Phone and app channels are repository prototypes. WhatsApp is coming soon; no live
              integrations are connected here.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}