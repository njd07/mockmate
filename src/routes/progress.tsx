import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  Brain,
  TrendingUp,
  Target,
  ArrowRight,
  Code2,
  Server,
  Layers,
  Cpu,
  CheckCircle2,
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "@/components/GlowButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPlacementReadiness } from "@/lib/user.functions";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Placement Readiness Score — MockMate" },
      {
        name: "description",
        content: "Track your cross-session preparation, domain coverage, and placement readiness score.",
      },
    ],
  }),
  component: ProgressPage,
});

const DOMAIN_ICONS: Record<string, any> = {
  dsa: Code2,
  springboot: Server,
  system_design: Layers,
  lld: Cpu,
};

const DOMAIN_NAMES: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  springboot: "Spring Boot & Backend",
  system_design: "System Design (HLD)",
  lld: "Low-Level Design (LLD)",
};

function ProgressPage() {
  const { user, isPro } = useSession();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    readinessScore: number;
    totalSessions: number;
    domainStats: Record<string, { sessions: number; totalScore: number; avgScore: number }>;
    recentSessions: any[];
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    getPlacementReadiness({ data: { userId: user.id } })
      .then((res: any) => {
        setData(res);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user?.id, navigate]);

  const score = data?.readinessScore ?? 0;

  const getVerdict = (s: number) => {
    if (s >= 80) return { label: "Placement Ready", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (s >= 60) return { label: "Good Momentum", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" };
    if (s >= 35) return { label: "Foundational Progress", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Starting Out", color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20" };
  };

  const verdict = getVerdict(score);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Mock<span className="text-primary">Mate</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/dashboard">
              <GlowButton size="sm" variant="ghost">
                Dashboard
              </GlowButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
              <Award className="w-7 h-7 text-primary" /> Placement Readiness Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Cross-session evaluation tracking across the 4 canonical technical placement pillars.
            </p>
          </div>
          <Link to="/dashboard">
            <GlowButton size="sm" variant="primary">
              Practice Next Domain <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </GlowButton>
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Main Readiness Gauge */}
          <div className="glass-strong p-6 rounded-2xl flex flex-col items-center justify-center text-center border-primary/20">
            <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold mb-2">
              Overall Readiness
            </span>
            <div className="text-5xl sm:text-6xl font-black text-foreground mb-2 flex items-baseline">
              {score}
              <span className="text-xl text-primary font-normal">%</span>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${verdict.bg} ${verdict.color}`}>
              {verdict.label}
            </span>
            <p className="text-[11px] text-muted-foreground mt-3 max-w-xs">
              Based on multi-metric interview turns, accuracy on canonical quizzes, and coverage of all 4 domains.
            </p>
          </div>

          {/* Sessions Completed */}
          <div className="glass p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground mb-4">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold">Total Sessions</span>
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1">
                {data?.totalSessions ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Target: Complete at least 2 sessions per domain for reliable readiness estimation.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Plan tier:</span>
              <span className="font-semibold text-primary">{isPro ? "MockMate Pro (Unlimited)" : "Free Starter"}</span>
            </div>
          </div>

          {/* Momentum / Growth */}
          <div className="glass p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground mb-4">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold">Coverage Status</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              {data && (
                <div className="space-y-2 mb-2">
                  {Object.entries(data.domainStats).map(([dom, stats]) => (
                    <div key={dom} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{dom.replace("_", " ")}</span>
                      <span className={`font-mono font-medium ${stats.sessions > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {stats.sessions > 0 ? `${stats.sessions} done (${stats.avgScore} avg)` : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
              Evaluated with Groq & Edge TTS speech rubrics.
            </div>
          </div>
        </div>

        {/* Domain Breakdown Cards */}
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" /> Domain Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {data &&
            Object.entries(data.domainStats).map(([domKey, stats]) => {
              const Icon = DOMAIN_ICONS[domKey] || Code2;
              const name = DOMAIN_NAMES[domKey] || domKey;
              const hasData = stats.sessions > 0;

              return (
                <div key={domKey} className="glass p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-foreground">
                        {stats.sessions} session{stats.sessions !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{name}</h3>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-2xl font-bold text-foreground">
                        {hasData ? stats.avgScore : "—"}
                      </span>
                      {hasData && <span className="text-xs text-muted-foreground">/ 100</span>}
                    </div>
                  </div>

                  <Link
                    to="/domain/$domain"
                    params={{ domain: domKey }}
                    className="mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-primary flex items-center justify-between group"
                  >
                    <span>{hasData ? "Improve score" : "Start domain"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
        </div>

        {/* Recent Session History */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-base text-foreground mb-4">Recent Session History</h3>
          {data && data.recentSessions.length > 0 ? (
            <div className="divide-y divide-border/60">
              {data.recentSessions.map((s, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-primary uppercase font-semibold">
                      {s.domain.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground capitalize">
                      {s.session_type} mode
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-foreground">
                      Score: {s.scoreOverall ?? 80}/100
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(s.completed_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No sessions completed yet. Practice an interview or quiz to populate your diagnostic history!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
