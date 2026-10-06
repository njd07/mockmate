import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Mic, ListChecks, ArrowLeft, Brain, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "@/components/GlowButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DOMAIN_META, type Domain } from "@/lib/knowledge";

export const Route = createFileRoute("/domain/$domain")({
  head: () => ({ meta: [{ title: "Select Mode — MockMate" }] }),
  component: DomainPage,
});

function DomainPage() {
  const { user, loading, isPro, remainingFree, freeSessionsUsed } = useSession();
  const { domain } = Route.useParams();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  const d = domain as Domain;
  const meta = DOMAIN_META[d];
  if (!meta) return <Navigate to="/dashboard" />;

  const canStart = isPro || remainingFree > 0;

  const handleStartMode = (targetPath: string) => {
    if (!canStart) {
      navigate({ to: "/pricing", search: { limit_reached: "true" } });
    } else {
      navigate({ to: targetPath as any });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isPro ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-primary" /> Pro
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                <strong className="text-primary">{remainingFree}</strong> free session{remainingFree !== 1 ? "s" : ""} left
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col justify-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
            <span>Track: {d.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {meta.tagline} · Choose your practice mode below
          </p>
        </div>

        {/* Limit Reached Warning */}
        {!canStart && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Free Interview Limit Reached ({freeSessionsUsed}/3 used)</h4>
                <p className="text-xs opacity-90 mt-0.5">
                  You have completed your 3 free voice mock interviews. You can still practice unlimited <strong>Concept &amp; MCQ Quizzes</strong> below, or upgrade to Pro for unlimited AI voice interviews.
                </p>
              </div>
            </div>
            <Link to="/pricing">
              <GlowButton size="sm" variant="primary" className="shrink-0">
                Unlock Pro (₹199 · 70% OFF)
              </GlowButton>
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mock Interview */}
          <div
            onClick={() => handleStartMode(`/interview/${d}`)}
            className="glass p-7 rounded-2xl cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mic className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary font-semibold">
                  {isPro ? "Pro Unlimited" : `${remainingFree} of 3 Free Left`}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                Voice Mock Interview
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                5 conversational turns with real-time Microsoft Edge TTS narration. Speak your answers or type them, followed by an in-depth scorecard.
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <GlowButton
                variant={canStart ? "primary" : "secondary"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartMode(`/interview/${d}`);
                }}
              >
                {canStart ? "Start Interview →" : "Upgrade to Pro"}
              </GlowButton>
              <span className="text-xs text-muted-foreground">~10 minutes</span>
            </div>
          </div>

          {/* MCQ Quiz (Unlimited & Free) */}
          <div
            onClick={() => navigate({ to: `/quiz/${d}` as any })}
            className="glass p-7 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ListChecks className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Always Free &amp; Unlimited
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Concept &amp; MCQ Quiz
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                In-depth technical scenarios and conceptual multiple-choice questions. Does not consume your mock interview quota. Practice anytime!
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <GlowButton
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: `/quiz/${d}` as any });
                }}
              >
                Launch Quiz →
              </GlowButton>
              <span className="text-xs text-muted-foreground">Unlimited Practice</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
