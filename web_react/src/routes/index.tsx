import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import workersPhoto from "@/assets/workers-hero.svg";
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
  const { jobs, setRole } = useDemo();
  const [skill, setSkill] = useState("All");
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