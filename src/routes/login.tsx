import { createFileRoute, Navigate, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Brain, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "@/components/GlowButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — MockMate" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, setCustomUser } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
  const isClerkAvailable = Boolean(clerkKey && clerkKey.startsWith("pk_"));

  if (user) return <Navigate to="/dashboard" />;

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateName = name.trim() || "Candidate";
    const candidateEmail = email.trim() || "candidate@mockmate.ai";
    const id = "demo_" + Math.random().toString(36).substring(2, 9);

    setCustomUser({
      id,
      email: candidateEmail,
      name: candidateName,
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Brain className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-foreground">
            Mock<span className="text-primary">Mate</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to MockMate</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Sign in to track your placement readiness and interview sessions
            </p>
          </div>

          <div className="glass-strong p-6 sm:p-8 rounded-2xl border border-border">
            {isClerkAvailable ? (
              <div className="flex justify-center">
                <SignIn
                  routing="hash"
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none bg-transparent p-0 border-0",
                    },
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="mb-5 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Interactive Demo Mode · Fast 1-click sign in</span>
                </div>

                <form onSubmit={handleDemoSignIn} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full mt-1 px-3.5 py-2.5 bg-input rounded-lg text-sm border border-border focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">College Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aryan@college.edu"
                      className="w-full mt-1 px-3.5 py-2.5 bg-input rounded-lg text-sm border border-border focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>

                  <GlowButton type="submit" variant="primary" className="w-full mt-2" size="lg">
                    Sign In as Candidate <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                </form>
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-xs text-muted-foreground">
            Looking for curriculum overview?{" "}
            <Link to="/" className="text-primary font-medium hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        MockMate — AI Placement Platform
      </footer>
    </div>
  );
}
