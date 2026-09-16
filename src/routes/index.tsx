import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Brain,
  Mic,
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  Code2,
  Server,
  Layers,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useSession } from "@/store/session";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlowButton } from "@/components/GlowButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MockMate — AI Mock Interview Platform for Tech Placements" },
      {
        name: "description",
        content:
          "Ace your campus tech placements. Practice voice mock interviews and quizzes in DSA, Spring Boot, System Design, and LLD with instant AI rubrics.",
      },
    ],
  }),
  component: LandingPage,
});

const DOMAINS = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    short: "DSA",
    icon: Code2,
    color: "from-blue-500/20 to-indigo-500/20",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "Binary Trees, Dynamic Programming, Graphs, Two Pointers, and optimal space-time complexities.",
    topics: ["Tree Traversals", "DP Memoization", "Graph BFS/DFS", "Sliding Window"],
  },
  {
    id: "springboot",
    name: "Spring Boot & Java Backend",
    short: "Spring Boot",
    icon: Server,
    color: "from-emerald-500/20 to-teal-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    description: "IoC & Dependency Injection, JPA / Hibernate, REST API design, Microservices, and transaction management.",
    topics: ["Bean Lifecycles", "JPA N+1 Problem", "@Transactional", "Actuator & Security"],
  },
  {
    id: "system_design",
    name: "System Design (HLD)",
    short: "System Design",
    icon: Layers,
    color: "from-purple-500/20 to-violet-500/20",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    description: "Horizontal scaling, Caching strategies, Message queues (Kafka), Load balancers, and CAP theorem.",
    topics: ["Consistent Hashing", "Cache Invalidation", "Rate Limiting", "Database Sharding"],
  },
  {
    id: "lld",
    name: "Low-Level Design (LLD)",
    short: "LLD & OOP",
    icon: Cpu,
    color: "from-amber-500/20 to-orange-500/20",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    description: "SOLID principles, Design Patterns (Factory, Strategy, Observer, Decorator), and schema design.",
    topics: ["Design Patterns", "UML Modeling", "SOLID Rules", "Clean Architecture"],
  },
];

const FEATURES = [
  {
    icon: Mic,
    title: "Realistic Voice Interviews",
    description:
      "Powered by Microsoft Edge TTS for human-like natural interviewer voice narration, with zero server latency.",
  },
  {
    icon: Zap,
    title: "3-Tier Fast AI Engine",
    description:
      "Instant feedback powered by Groq Llama 3.3 (500 tokens/sec), offline Ollama support, and Gemini 2.0 fallback.",
  },
  {
    icon: Award,
    title: "Placement Readiness Score",
    description:
      "Measure your readiness across all four core domains with comprehensive diagnostic rubrics and trend charts.",
  },
  {
    icon: ShieldCheck,
    title: "Curated Indian Fresher Rubrics",
    description:
      "Questions and evaluation standards matched to top campus recruiters: Amazon, TCS Digital, Infosys SP, and startups.",
  },
];

function LandingPage() {
  const { user } = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
                Mock<span className="text-primary">Mate</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                  AI
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#domains" className="hover:text-foreground transition-colors">
              Domains
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <Link to="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            {user && (
              <Link to="/progress" className="hover:text-foreground transition-colors">
                Readiness Score
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard">
                <GlowButton size="sm" variant="primary">
                  Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </GlowButton>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <GlowButton size="sm" variant="ghost">
                    Sign In
                  </GlowButton>
                </Link>
                <Link to="/dashboard">
                  <GlowButton size="sm" variant="primary">
                    Try Free Demo
                  </GlowButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6 animate-fade-up">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Indian CS Freshers & Tech Placement Season</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
          Crack Your Placement Interviews With{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Real-Time AI Mock Sessions
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Practice adaptive conversational voice interviews in DSA, Spring Boot, System Design, and LLD. Get instant
          multi-metric scorecards and track your placement readiness.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <GlowButton
            size="lg"
            variant="primary"
            className="w-full sm:w-auto text-base px-8 py-3.5 shadow-md shadow-primary/20"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Start Free Practice <ArrowRight className="w-4 h-4 ml-1" />
          </GlowButton>
          <Link to="/pricing" className="w-full sm:w-auto">
            <GlowButton size="lg" variant="secondary" className="w-full text-base px-6 py-3.5">
              View Pricing (Free Tier)
            </GlowButton>
          </Link>
        </div>

        {/* Micro Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>3 Free full mock sessions included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Human-like Edge TTS Voice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No credit card required to start</span>
          </div>
        </div>
      </section>

      {/* Core Domains Grid */}
      <section id="domains" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-primary font-semibold mb-2">
            Targeted Curriculum
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            The 4 Pillars of Tech Campus Hiring
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Deep question banks with 15+ canonical problems each, structured strictly on standard campus interview rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <div
                key={domain.id}
                className="glass p-6 sm:p-7 rounded-2xl hover:border-primary/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${domain.badgeColor}`}>
                      {domain.short}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {domain.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {domain.description}
                  </p>

                  {/* Topic Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {domain.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-md bg-secondary/80 text-secondary-foreground border border-border/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to="/domain/$domain"
                    params={{ domain: domain.id }}
                    className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Start practicing <ChevronRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-muted-foreground">Voice & Quiz modes</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-primary font-semibold mb-2">
            Why MockMate
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Engineered For Differentiated Preparation
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass p-6 rounded-2xl flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{f.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="glass-strong p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden border border-primary/20">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to Ace Your Next Tech Interview?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of engineering students mastering technical rounds before placement season kicks off.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <GlowButton size="lg" variant="primary" className="px-8 shadow-md">
                  Get Started For Free <ArrowRight className="w-4 h-4 ml-1" />
                </GlowButton>
              </Link>
              <Link to="/pricing">
                <GlowButton size="lg" variant="secondary">
                  Explore MockMate Pro
                </GlowButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">MockMate</span>
            <span>— AI Placement Interview Coach</span>
          </div>
          <div>Built for Technology Entrepreneurship & CS Placements</div>
        </div>
      </footer>
    </div>
  );
}
