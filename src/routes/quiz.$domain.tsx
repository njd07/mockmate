import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Check, X, Sparkles } from "lucide-react";
import { useSession } from "@/store/session";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { DOMAIN_META, type Domain } from "@/lib/knowledge";
import { generateQuiz, judgeFreeAnswer, type QuizQuestion } from "@/lib/quiz.functions";
import { completeSession } from "@/lib/user.functions";

export const Route = createFileRoute("/quiz/$domain")({
  head: () => ({ meta: [{ title: "Quiz — MockMate" }] }),
  component: QuizPage,
});

type Result = {
  question: QuizQuestion;
  pickedIndex: number | null;
  freeAnswer: string;
  judged?: { score: number; verdict: "correct" | "partial" | "incorrect"; feedback: string };
};

function QuizPage() {
  const { user, loading, settings, refreshProfile } = useSession();
  const { domain } = Route.useParams();
  const d = domain as Domain;
  const genQuiz = useServerFn(generateQuiz);
  const judge = useServerFn(judgeFreeAnswer);

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"mcq" | "free">("mcq");
  const [picked, setPicked] = useState<number | null>(null);
  const [free, setFree] = useState("");
  const [judging, setJudging] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [currentJudge, setCurrentJudge] = useState<Result["judged"] | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (questions && i >= questions.length && user?.id && !recordedRef.current) {
      recordedRef.current = true;
      const mcqCorrect = results.filter((r) => r.pickedIndex !== null && r.pickedIndex === r.question.correctIndex).length;
      const freeScore = results.filter((r) => r.judged).reduce((a, r) => a + (r.judged?.score || 0), 0);
      const total = mcqCorrect * 10 + freeScore;
      const max = results.length * 10;
      const pct = Math.round((total / max) * 100);

      completeSession({
        data: {
          userId: user.id,
          domain: d,
          sessionType: "quiz",
          score: { score: pct, mcqCorrect, totalQuestions: results.length },
        },
      }).catch(console.error);
      refreshProfile().catch(console.error);
    }
  }, [i, questions, user?.id, d, results, refreshProfile]);

  useEffect(() => {
    if (loading || !user) return;
    void (async () => {
      const r = await genQuiz({ data: {
        domain: d, count: 5,
        groqApiKey: settings.groqApiKey || undefined,
        geminiApiKey: settings.geminiApiKey || undefined,
        useOllama: settings.useOllama,
        ollamaUrl: settings.ollamaUrl,
        ollamaModel: settings.ollamaModel,
      } });
      if (!r.ok) setError(r.error);
      else setQuestions(r.questions);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  const meta = DOMAIN_META[d];
  if (!meta) return <Navigate to="/dashboard" />;

  async function submit() {
    if (!questions) return;
    const q = questions[i];
    if (mode === "mcq") {
      if (picked === null) return;
      setRevealed(true);
    } else {
      if (!free.trim()) return;
      setJudging(true);
      const r = await judge({ data: {
        domain: d, question: q.question, userAnswer: free,
        referenceExplanation: q.explanation,
        groqApiKey: settings.groqApiKey || undefined,
        geminiApiKey: settings.geminiApiKey || undefined,
        useOllama: settings.useOllama,
        ollamaUrl: settings.ollamaUrl,
        ollamaModel: settings.ollamaModel,
      } });
      setJudging(false);
      if (!r.ok) { setError(r.error); return; }
      setCurrentJudge({ score: r.score, verdict: r.verdict, feedback: r.feedback });
      setRevealed(true);
    }
  }

  function next() {
    if (!questions) return;
    const q = questions[i];
    const result: Result = { question: q, pickedIndex: mode === "mcq" ? picked : null, freeAnswer: mode === "free" ? free : "", judged: currentJudge ?? undefined };
    const nextResults = [...results, result];
    setResults(nextResults);
    setPicked(null); setFree(""); setRevealed(false); setCurrentJudge(null); setMode("mcq");
    if (i + 1 >= questions.length) {
      setI(i + 1);
    } else { setI(i + 1); }
  }

  // Results screen
  if (questions && i >= questions.length) {
    const mcqCorrect = results.filter((r) => r.pickedIndex !== null && r.pickedIndex === r.question.correctIndex).length;
    const freeScore = results.filter((r) => r.judged).reduce((a, r) => a + (r.judged?.score || 0), 0);
    const freeCount = results.filter((r) => r.judged).length;
    const total = mcqCorrect * 10 + freeScore;
    const max = results.length * 10;
    const pct = Math.round((total / max) * 100);
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-3xl mx-auto animate-fade-up">
          <div className="font-mono text-xs text-muted-foreground mb-2">// quiz complete</div>
          <h1 className="font-mono text-4xl font-bold mb-4">Score: <span className="text-[var(--cyan)]">{pct}%</span></h1>
          <p className="text-muted-foreground mb-6 font-mono text-sm">
            MCQ: {mcqCorrect}/{results.length - freeCount} correct · Free-form: {freeScore}/{freeCount * 10}
          </p>
          <div className="space-y-3 mb-6">
            {results.map((r, idx) => {
              const correct = r.pickedIndex !== null ? r.pickedIndex === r.question.correctIndex : (r.judged?.verdict === "correct");
              return (
                <GlassCard key={idx} className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${correct ? "bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]" : "bg-destructive/15 text-destructive"}`}>
                      {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold">{r.question.question}</div>
                      {r.pickedIndex !== null ? (
                        <div className="text-xs mt-1 text-muted-foreground">
                          Your pick: {r.question.options[r.pickedIndex]} · Correct: <span className="text-[var(--cyan)]">{r.question.options[r.question.correctIndex]}</span>
                        </div>
                      ) : (
                        <div className="text-xs mt-1 text-muted-foreground">
                          Score: <span className="text-[var(--cyan)]">{r.judged?.score}/10</span> · {r.judged?.feedback}
                        </div>
                      )}
                      <div className="text-xs mt-2 text-muted-foreground italic">{r.question.explanation}</div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard"><GlowButton variant="ghost">Dashboard</GlowButton></Link>
            <Link to="/domain/$domain" params={{ domain: d }}><GlowButton>Try Again</GlowButton></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <Link to="/domain/$domain" params={{ domain: d }} className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-[var(--cyan)] mb-6">
        <ArrowLeft className="h-4 w-4" /> exit
      </Link>
      <div className="max-w-3xl mx-auto">
        <div className="font-mono text-xs text-muted-foreground mb-3 flex justify-between items-center">
          <span className="uppercase tracking-wider font-semibold text-primary">{meta.title} Diagnostic Quiz</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">Question {i + 1} of {questions?.length || 5}</span>
        </div>

        {!questions && !error && (
          <GlassCard className="text-center py-16 animate-fade-up">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Generating technical scenario questions...</p>
          </GlassCard>
        )}

        {error && (
          <GlassCard className="border-destructive/40 p-6">
            <p className="text-sm text-destructive">{error}</p>
            <Link to="/domain/$domain" params={{ domain: d }}><GlowButton className="mt-4">Back to Track</GlowButton></Link>
          </GlassCard>
        )}

        {questions && (
          <GlassCard className="animate-fade-up p-6 sm:p-8" key={i}>
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed mb-5">{questions[i].question}</h2>

            <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-lg w-fit border border-border">
              {(["mcq", "free"] as const).map((m) => (
                <button key={m} onClick={() => { if (!revealed) setMode(m); }} disabled={revealed}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    mode === m ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                  }`}>{m === "mcq" ? "Multiple Choice" : "Write Your Own"}</button>
              ))}
            </div>

            {mode === "mcq" ? (
              <div className="space-y-3">
                {questions[i].options.map((opt, oi) => {
                  const isCorrect = revealed && oi === questions[i].correctIndex;
                  const isWrong = revealed && picked === oi && oi !== questions[i].correctIndex;
                  return (
                    <button key={oi} onClick={() => !revealed && setPicked(oi)} disabled={revealed}
                      className={`w-full text-left p-4 rounded-xl border text-sm leading-relaxed transition-all cursor-pointer flex items-start gap-3 ${
                        isCorrect ? "border-emerald-500 bg-emerald-500/15 text-foreground font-medium shadow-xs"
                          : isWrong ? "border-destructive bg-destructive/15 text-foreground"
                          : picked === oi ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                          : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                      }`}>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        picked === oi ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>{String.fromCharCode(65 + oi)}</span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea value={free} onChange={(e) => setFree(e.target.value)} disabled={revealed} rows={6}
                placeholder="Write your comprehensive technical answer explaining the tradeoffs and mechanisms..."
                className="w-full p-4 bg-card rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none leading-relaxed" />
            )}

            {revealed && (
              <div className="mt-6 p-4 rounded-xl glass border-l-4 border-primary animate-fade-up">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> {mode === "free" && currentJudge ? `${currentJudge.verdict.toUpperCase()} · Score: ${currentJudge.score}/10` : "Technical Explanation & Rubric"}
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  {mode === "free" && currentJudge ? currentJudge.feedback : questions[i].explanation}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/60">
              {!revealed ? (
                <GlowButton onClick={submit} disabled={judging || (mode === "mcq" ? picked === null : !free.trim())}>
                  {judging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </GlowButton>
              ) : (
                <GlowButton variant="violet" onClick={next}>
                  {i + 1 >= (questions?.length || 0) ? "See Results" : "Next →"}
                </GlowButton>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
