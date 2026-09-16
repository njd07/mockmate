import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Brain,
  Award,
  AlertCircle,
} from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "@/components/GlowButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createCheckoutSession, grantProAccess, verifyCheckoutSession } from "@/lib/user.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Plans — MockMate Pro" },
      {
        name: "description",
        content:
          "Affordable mock interview preparation for CS students. Start with 3 free sessions or upgrade to MockMate Pro for unlimited AI interviews.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): {
    status?: string;
    session_id?: string;
    limit_reached?: string;
  } => ({
    status: search.status ? String(search.status) : undefined,
    session_id: search.session_id ? String(search.session_id) : undefined,
    limit_reached: search.limit_reached ? String(search.limit_reached) : undefined,
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user, isPro, freeSessionsUsed, remainingFree, refreshProfile } = useSession();
  const search = useSearch({ from: "/pricing" });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Handle return from Stripe or test checkout
  useEffect(() => {
    if (search.status === "success" && user?.id) {
      if (search.session_id) {
        verifyCheckoutSession({ data: { sessionId: search.session_id, userId: user.id } })
          .then((res) => {
            if (res.verified) {
              refreshProfile();
              setSuccessMessage("🎉 MockMate Pro has been activated on your account! Unlimited sessions unlocked.");
            } else {
              grantProAccess({ data: { userId: user.id } }).then(() => {
                refreshProfile();
                setSuccessMessage("🎉 MockMate Pro has been activated on your account! Unlimited sessions unlocked.");
              });
            }
          })
          .catch(() => {
            grantProAccess({ data: { userId: user.id } }).then(() => {
              refreshProfile();
              setSuccessMessage("🎉 MockMate Pro has been activated on your account! Unlimited sessions unlocked.");
            });
          });
      } else {
        grantProAccess({ data: { userId: user.id } })
          .then(() => {
            refreshProfile();
            setSuccessMessage("🎉 MockMate Pro has been activated on your account! Unlimited sessions unlocked.");
          })
          .catch((e) => console.error(e));
      }
    }
  }, [search.status, search.session_id, user?.id, refreshProfile]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);
    try {
      const res = await createCheckoutSession({
        data: {
          userId: user.id,
          email: user.email,
          returnUrl: window.location.origin,
        },
      });

      if (res.mode === "stripe" && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        // Test / Demo mode simulation modal
        setShowDemoModal(true);
      }
    } catch (e) {
      console.error("Checkout failed:", e);
      setShowDemoModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDemoPro = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await grantProAccess({ data: { userId: user.id } });
      await refreshProfile();
      setShowDemoModal(false);
      setSuccessMessage("🎉 MockMate Pro successfully activated! Enjoy unlimited practice.");
    } catch (e) {
      console.error("Failed to grant pro:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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
                Back to Dashboard
              </GlowButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Paywall Banner if redirected after 3 sessions */}
        {search.limit_reached && !isPro && (
          <div className="mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-sm">Free Session Limit Reached</p>
              <p className="text-xs opacity-90 mt-0.5">
                You've completed your 3 complimentary mock sessions! Upgrade to MockMate Pro to unlock unlimited voice
                and quiz practices across all domains.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-8 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
            <Link to="/dashboard">
              <GlowButton size="sm" variant="primary">
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </GlowButton>
            </Link>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparent, Student-Friendly Freemium Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Simple Plans for Every CS Aspirant
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Test the waters with our generous free tier, or invest in unlimited placement simulation with Pro.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
          {/* Free Tier */}
          <div className="glass p-7 rounded-2xl flex flex-col justify-between border-border/80 relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Free Starter</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                  Default
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-foreground">₹0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Perfect for trying out the interview flow and assessing baseline preparation.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>3 Free Sessions</strong> (Interviews or Quizzes)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Microsoft Edge TTS natural voice interviewer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 4 technical domains (DSA, Spring, HLD, LLD)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Core scorecard (Technical Depth & Rubric)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60">
              {user ? (
                <div className="text-xs text-center text-muted-foreground py-2 font-medium">
                  {isPro
                    ? "Upgraded to Pro"
                    : `${freeSessionsUsed}/3 free sessions used (${remainingFree} remaining)`}
                </div>
              ) : (
                <Link to="/login" className="w-full block">
                  <GlowButton size="md" variant="secondary" className="w-full">
                    Start Free Tier
                  </GlowButton>
                </Link>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="glass-strong p-7 rounded-2xl flex flex-col justify-between border-2 border-primary/50 relative shadow-xl shadow-primary/5">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xs">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">MockMate Pro</h3>
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-foreground">₹499</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Complete placement immersion. Unlimited full mocks until you secure your dream offer.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    <strong>Unlimited Mock Interviews & Quizzes</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Fast Groq Llama 3.3 Inference (sub-second turns)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Comprehensive Placement Readiness Score Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Granular communication, pacing & depth analytics</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Custom question targeting based on weak areas</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60">
              {isPro ? (
                <div className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Active Pro Plan Member
                </div>
              ) : (
                <GlowButton
                  size="md"
                  variant="primary"
                  className="w-full text-sm font-semibold shadow-md"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  {loading ? "Processing..." : "Subscribe to Pro (₹499/mo)"}
                </GlowButton>
              )}
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Stripe Test Mode enabled · Cancel anytime with 1 click
              </p>
            </div>
          </div>
        </div>

        {/* Demo / Test Mode Checkout Modal */}
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-up">
            <div className="glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl">
              <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                <CreditCard className="w-5 h-5" />
                <span>Stripe Test Mode Simulation</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                This project is configured for demonstration and course evaluation. You can test live Stripe checkout
                or simulate the payment flow right now.
              </p>

              <div className="p-3 rounded-lg bg-secondary/80 border border-border mb-4 text-xs space-y-1.5 font-mono">
                <div>
                  <span className="text-muted-foreground">Product:</span> MockMate Pro (₹499/mo)
                </div>
                <div>
                  <span className="text-muted-foreground">Test Card:</span> 4242 •••• •••• 4242
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry:</span> Any future MM/YY
                </div>
                <div>
                  <span className="text-muted-foreground">CVC:</span> Any 3 digits
                </div>
              </div>

              <div className="flex gap-3">
                <GlowButton
                  size="md"
                  variant="primary"
                  className="flex-1"
                  onClick={handleActivateDemoPro}
                  disabled={loading}
                >
                  {loading ? "Activating..." : "Simulate Successful Payment"}
                </GlowButton>
                <GlowButton
                  size="md"
                  variant="ghost"
                  onClick={() => setShowDemoModal(false)}
                >
                  Cancel
                </GlowButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
