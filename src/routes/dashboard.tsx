import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Code2,
  Layers,
  Network,
  Boxes,
  Settings as SettingsIcon,
  LogOut,
  Brain,
  Zap,
  Award,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "@/components/GlowButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsModal } from "@/components/SettingsModal";
import { DOMAIN_META, type Domain } from "@/lib/knowledge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MockMate" }] }),
  component: Dashboard,
});

const ICONS: Record<Domain, React.ComponentType<{ className?: string }>> = {
  dsa: Code2,
  springboot: Layers,
  system_design: Network,
  lld: Boxes,
};

function Dashboard() {
  const { user, loading, isPro, freeSessionsUsed, remainingFree, signOut } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm font-medium text-primary animate-pulse flex items-center gap-2">
          <Brain className="w-5 h-5 animate-spin" /> Loading MockMate...
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Mock<span className="text-primary">Mate</span>
            </span>
          </Link>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Free Sessions / Pro Status Pill */}
            {isPro ? (
              <Link to="/pricing">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                  <Zap className="w-3.5 h-3.5 fill-primary" /> Pro Plan
                </span>
              </Link>
            ) : (
              <Link to="/pricing">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border hover:border-primary/40 transition-colors">
                  <span className="font-semibold text-primary">{remainingFree}/3</span> free sessions left
                </span>
              </Link>
            )}

            {/* Readiness Score Link */}
            <Link to="/progress">
              <GlowButton variant="ghost" size="sm" className="text-xs">
                <Award className="w-3.5 h-3.5 text-primary mr-1" />
                <span className="hidden md:inline">Readiness Score</span>
              </GlowButton>
            </Link>

            <ThemeToggle />

            <GlowButton variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} title="Settings">
              <SettingsIcon className="h-4 w-4" />
            </GlowButton>

            <GlowButton variant="ghost" size="sm" onClick={signOut} title="Sign Out">
              <LogOut className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Select Your Interview Track
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Welcome back, <span className="font-semibold text-foreground">{user.name || user.email}</span>. Choose a domain to begin an adaptive mock session.
            </p>
          </div>

          {!isPro && remainingFree <= 1 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {remainingFree === 0 ? "You've used all 3 free sessions." : "Only 1 free session remaining."}
              </span>
              <Link to="/pricing">
                <span className="font-bold underline cursor-pointer text-primary">Upgrade</span>
              </Link>
            </div>
          )}
        </div>

        {/* 4 Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(DOMAIN_META) as Domain[]).map((d) => {
            const Icon = ICONS[d];
            const meta = DOMAIN_META[d];
            return (
              <Link
                key={d}
                to="/domain/$domain"
                params={{ domain: d }}
                className="glass p-6 sm:p-7 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border/50">
                      Track {d.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {meta.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {meta.tagline}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Select Mode <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-muted-foreground">Voice Interview · Quiz</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
