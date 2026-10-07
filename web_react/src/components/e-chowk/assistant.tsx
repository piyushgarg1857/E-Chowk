import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mic,
  Phone,
  MessageCircle,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  UserRound,
  UsersRound,
  Clock3,
  Check,
  Volume2,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Tool, ToolHeader, ToolContent } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useDemo } from "@/lib/e-chowk/store";
import { mockMarketplaceService } from "@/lib/e-chowk/mock-service";
import {
  AppShell,
  PageHeading,
  Brand,
  Pill,
  IconBox,
  JobCard,
  Confirm,
  DemoNote,
  ArchitectureStrip,
} from "./shared";
import { toast } from "sonner";
export function VoiceExperience() {
  const { jobs } = useDemo();
  const [stage, setStage] = useState<"ready" | "listening" | "understood">("ready");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const [registration, setRegistration] = useState(false);
  const listen = () => {
    if (stage === "listening") {
      if (timer.current) clearTimeout(timer.current);
      setStage("ready");
      return;
    }
    setStage("listening");
    timer.current = setTimeout(() => {
      setStage("understood");
      toast.success("Sample Hindi request understood · no audio recorded");
    }, 2200);
  };
  return (
    <AppShell>
      <div className="voice-page">
        <div className="between">
          <Link to="/" className="text-link">
            ← Back to E-Chowk
          </Link>
          <Pill tone="neutral">VOICE EXPERIENCE · DEMO</Pill>
        </div>
        <div className="voice-main">
          <span className="section-kicker justify-center">
            <Languages className="h-4 w-4" />
            HINDI-FIRST. HUMAN-FIRST.
          </span>
          <h1>
            Voice AI<span className="bilingual-subtext">बोलकर काम</span>
          </h1>
          <p>
            {registration
              ? "Voice registration demo · “Mera naam Ramesh hai, main plumber hoon.”"
              : "Apni baat bolo. E-Chowk kaam samjhega."}
          </p>
          <Button
            aria-label={stage === "listening" ? "Stop demo listening" : "Start voice demo"}
            onClick={listen}
            className={`mic-button ${stage === "listening" ? "listening" : ""}`}
          >
            <Mic />
          </Button>
          <div
            className={`voice-wave ${stage === "listening" ? "listening" : ""}`}
            aria-hidden="true"
          >
            {Array.from({ length: 19 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <strong className="block small text-success" aria-live="polite">
            {stage === "listening"
              ? "Listening simulation… सुन रहा हूँ।"
              : stage === "understood"
                ? "Samajh gaya! Your request is understood."
                : "Tap to try the voice demo · बोल कर देखिए"}
          </strong>
          <p className="mt-2 text-xs!">No microphone recording. This plays a scripted example.</p>
          <div className="action-row voice-actions">
            <Confirm
              title="Request a call?"
              description="The phone AI pathway is a prototype. This action simulates a callback request; no phone call will be placed."
              trigger={
                <Button variant="outline" className="button-large">
                  <Phone />
                  Call me instead
                </Button>
              }
              label="Simulate callback"
              onConfirm={() => toast.success("Demo callback requested · no call placed")}
            />
            <Button asChild variant="outline" className="button-large">
              <Link to="/assistant">
                <MessageCircle />
                AI Assistant
              </Link>
            </Button>
          </div>
        </div>
        <section className="panel">
          <div className="panel-title">
            <h3>{registration ? "Voice registration example" : "A conversation, not a form."}</h3>
            <Pill tone="success">हिंदी + English</Pill>
          </div>
          <div className="voice-transcript">
            <div className="transcript-line">
              <span className="avatar">RK</span>
              <div>
                <strong>RAMESH · WORKER</strong>
                <p>
                  {registration
                    ? "“Mera naam Ramesh Kumar hai. Main Jaipur mein plumber hoon, 800 rupaye roz leta hoon.”"
                    : "“Bhai mujhe kal Jaipur mein plumber ka kaam chahiye.”"}
                </p>
              </div>
            </div>
            <div className="transcript-line">
              <span className="avatar tone-1">
                <Mic className="h-4 w-4" />
              </span>
              <div>
                <strong>E-CHOWK · AI UNDERSTANDING (SIMULATED)</strong>
                <p>
                  {stage === "listening"
                    ? "आपकी बात समझ रहा हूँ…"
                    : registration
                      ? "नमस्ते रमेश जी! I understood your name, skill, city, and wage. Please review your profile before confirming any change."
                      : "समझ गया, रमेश जी! You need plumber work in Jaipur tomorrow. Let’s look at your options — nothing will be applied to without your confirmation."}
                </p>
                <div className="intent-chips">
                  <Pill>intent: {registration ? "register_worker" : "find_job"}</Pill>
                  <Pill>skill: plumber</Pill>
                  <Pill>location: Jaipur</Pill>
                  <Pill tone="success">
                    {registration ? "daily_wage: ₹800" : "availability: tomorrow"}
                  </Pill>
                </div>
              </div>
            </div>
          </div>
          <hr className="rule" />
          <div className="flex-row small muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>
              AI understands your request → requests a backend action → backend validates
              permissions → returns a result.
            </span>
          </div>
        </section>
        {!registration && (
          <section className="mt-7">
            <div className="section-title">
              <div>
                <h2 className="text-xl!">Jobs from the sample request</h2>
                <p>Review the details before confirming an application.</p>
              </div>
              <Pill tone="neutral">Mock results</Pill>
            </div>
            <div className="grid-3">
              {jobs
                .filter((j) => j.status === "open" && j.required_skill === "Plumber")
                .slice(0, 3)
                .map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
            </div>
          </section>
        )}
        {registration && (
          <div className="mt-5">
            <Button asChild className="button-large">
              <Link to="/profile">
                Review sample profile <ArrowRight />
              </Link>
            </Button>
          </div>
        )}
        <details className="how-ai">
          <summary>How AI works · समझिए ई-चौक कैसे काम करता है</summary>
          <p>
            Speech/text → context & user memory → intent understanding → tool selection → backend
            validation → marketplace → result → AI response → speech/text. The LLM never accesses
            SQL or bypasses authorization.
          </p>
          <ArchitectureStrip />
          <p>
            Twilio, Groq, and Hindi voice flows exist as repository prototypes. Live telephony and
            production AI tool calling are not connected in this UI.
          </p>
          <Link to="/architecture" className="text-link mt-3">
            Explore the full architecture <ArrowRight />
          </Link>
        </details>
        <Button
          variant="link"
          onClick={() => {
            setRegistration(!registration);
            setStage("ready");
          }}
        >
          {registration ? "Try finding work instead" : "Prefer phone registration? Try the example"}
        </Button>
      </div>
    </AppShell>
  );
}
export function Assistant() {
  const { messages, setMessages, jobs, role, apply, live, sendAgentMessage } = useDemo();
  const [status, setStatus] = useState<"ready" | "submitted">("ready");
  const [input, setInput] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mounted = useRef(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    mounted.current = true;
    textarea.current?.focus();
    return () => {
      mounted.current = false;
    };
  }, []);
  async function send(text: string) {
    if (!text.trim() || status === "submitted") return;
    const msg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      parts: [{ type: "text" as const, text }],
    };
    setMessages((prev) => [...prev, msg]);
    setStatus("submitted");
    setInput("");
    textarea.current?.focus();
    try {
      if (live) {
        await sendAgentMessage(text);
      } else {
        const result = await mockMarketplaceService.understand(text, role, jobs);
        if (!mounted.current) return;
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", ...result }]);
      }
    } catch {
      if (mounted.current)
        toast.error("The assistant could not complete this request. Please try again.");
    } finally {
      if (mounted.current) {
        setStatus("ready");
        textarea.current?.focus();
      }
    }
  }
  const suggested = jobs.find((j) => j.status === "open" && j.required_skill === "Plumber");
  return (
    <AppShell>
      <PageHeading
        title="AI Assistant"
        hindi="Chat in Hindi or English · लिखकर अपनी बात कहिए"
        action={
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(!historyOpen)}>
            <Clock3 />
            Session history ({messages.filter((m) => m.role === "user").length})
          </Button>
        }
      />
      {historyOpen && (
        <div className="panel mb-5">
          <h3>This conversation</h3>
          <p className="small muted mt-2">
            Session-only history. A page refresh clears the demo conversation.
          </p>
          {messages.filter((m) => m.role === "user").length ? (
            messages
              .filter((m) => m.role === "user")
              .map((m) => (
                <p key={m.id} className="small mt-3">
                  {m.parts.map((p) => p.text).join(" ")}
                </p>
              ))
          ) : (
            <p className="small muted mt-3">Your messages will appear here.</p>
          )}
        </div>
      )}
      <div
        className={`chat-layout ${messages.some((m) => m.role === "user") ? "" : "chat-layout-empty"}`}
      >
        <section className="chat-main">
          <div className="chat-header">
            <div className="flex-row">
              <Brand compact />
              <span className="dot" />
            </div>
            <Pill tone="neutral">{live ? "Live AI assistant" : "Simulated assistant"}</Pill>
          </div>
          <Conversation
            className="chat-transcript"
            initial={messages.some((m) => m.role === "user") ? "smooth" : false}
            resize="smooth"
          >
            <ConversationContent className="chat-message-stack">
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    <>
                      {m.parts.map((part, i) =>
                        part.type === "text" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : null,
                      )}
                      {m.tool && (
                        <Tool defaultOpen={false} className="mt-4">
                          <ToolHeader
                            type="tool-marketplace"
                            state="output-available"
                            title="Marketplace action · simulated"
                          />
                          <ToolContent>
                            <div className="notice">
                              <ShieldCheck />
                              <span>{m.tool}</span>
                            </div>
                            <p className="small muted mt-3">
                              No direct database access. Backend permission checks are represented
                              here as a simulation.
                            </p>
                          </ToolContent>
                        </Tool>
                      )}
                      {m.tool?.includes("find_job") && suggested && (
                        <div className="mt-3">
                          <Link
                            to="/jobs/$jobId"
                            params={{ jobId: suggested.id }}
                            className="text-link"
                          >
                            Review {suggested.title} <ArrowRight />
                          </Link>
                          <div className="mt-3">
                            <Confirm
                              title="Apply for this sample job?"
                              description={`${suggested.title} · ₹${suggested.offered_wage}/day. The backend must check role, open status, and duplicates.`}
                              trigger={<Button size="sm">Confirm application</Button>}
                              onConfirm={() => apply(suggested)}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  </MessageContent>
                </Message>
              ))}
              {!messages.some((m) => m.role === "user") && (
                <div className="chat-starters">
                  <h3>What can we do today?</h3>
                  <p className="muted small">कैसे मदद करूँ?</p>
                  <div className="starter-grid">
                    {[
                      {
                        label: role === "employer" ? "Find workers" : "Find a job",
                        hindi: role === "employer" ? "कामगार ढूँढें" : "काम ढूँढें",
                        icon: role === "employer" ? UsersRound : BriefcaseBusiness,
                        prompt:
                          role === "employer"
                            ? "Find a plumber worker near Mansarovar."
                            : "Bhai mujhe kal Jaipur mein plumber ka kaam chahiye.",
                      },
                      {
                        label: "Update profile",
                        hindi: "प्रोफाइल बदलें",
                        icon: UserRound,
                        prompt: "Help me update my profile.",
                      },
                      {
                        label: "Check application",
                        hindi: "आवेदन की स्थिति",
                        icon: Clock3,
                        prompt: "Check my application status.",
                      },
                    ].map((starter) => (
                      <Button
                        key={starter.label}
                        variant="outline"
                        className="starter-prompt"
                        disabled={status === "submitted"}
                        onClick={() => void send(starter.prompt)}
                      >
                        <starter.icon />
                        <span>
                          {starter.label}
                          <small className="bilingual-subtext">{starter.hindi}</small>
                        </span>
                        <ArrowRight className="ml-auto" />
                      </Button>
                    ))}
                  </div>
                  <p className="starter-example">
                    {role === "employer"
                      ? "“Mansarovar mein kal ek plumber chahiye.”"
                      : "“Bhai, mujhe kal Jaipur mein plumber ka kaam chahiye.”"}
                  </p>
                </div>
              )}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>समझ रहा हूँ… Understanding your request</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            {messages.some((m) => m.role === "user") && <ConversationScrollButton />}
          </Conversation>
          <div className="chat-composer">
            <PromptInput onSubmit={(msg) => send(msg.text)}>
              <PromptInputTextarea
                ref={textarea}
                aria-label="Message E-Chowk"
                placeholder="Kaam ke baare mein bataiye… Type in Hindi or English"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <PromptInputFooter>
                <Button asChild variant="ghost" size="sm" title="Voice AI / बोलकर काम">
                  <Link to="/voice">
                    <Mic /> Voice AI
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">हिंदी / English</span>
                <PromptInputSubmit
                  status={status}
                  disabled={status === "submitted" || !input.trim()}
                  aria-label="Send message"
                />
              </PromptInputFooter>
            </PromptInput>
            <p className="chat-footnote">
              Mock AI responses · No live model calls. You confirm every consequential action.
            </p>
          </div>
        </section>
        <aside className="chat-aside">
          {messages.some((m) => m.role === "user") && (
            <section className="panel">
              <h3>What can we do today?</h3>
              <p>कैसे मदद करूँ?</p>
              <div className="context-actions">
                {[
                  {
                    text: "Find a job",
                    icon: BriefcaseBusiness,
                    prompt: "Bhai mujhe kal Jaipur mein plumber ka kaam chahiye.",
                  },
                  { text: "Update profile", icon: UserRound, prompt: "Help me update my profile." },
                  {
                    text: "Check application",
                    icon: Clock3,
                    prompt: "Check my application status.",
                  },
                  {
                    text: "Find workers",
                    icon: UsersRound,
                    prompt: "Find a plumber worker near Mansarovar.",
                  },
                ].map((c) => (
                  <Button
                    key={c.text}
                    disabled={status === "submitted"}
                    variant="outline"
                    onClick={() => void send(c.prompt)}
                  >
                    <c.icon />
                    {c.text}
                    <ArrowRight className="ml-auto" />
                  </Button>
                ))}
              </div>
            </section>
          )}
          <section className="panel">
            <IconBox tone="green">
              <ShieldCheck />
            </IconBox>
            <h3 className="mt-4">You stay in control.</h3>
            <p>
              AI interprets your request. The backend validates the action. You confirm before
              anything changes.
            </p>
            <Link to="/architecture" className="text-link mt-4">
              How AI works <ArrowRight />
            </Link>
          </section>
          <DemoNote>
            Advanced AI tool calling is coming soon. This conversation is a UI simulation with
            session-only history.
          </DemoNote>
        </aside>
      </div>
    </AppShell>
  );
}