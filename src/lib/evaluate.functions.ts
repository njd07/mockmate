import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLLM } from "./llm.functions";
import { knowledgeBase, type Domain } from "./knowledge";

const DomainSchema = z.enum(["dsa", "springboot", "system_design", "lld"]);

/**
 * Pick a random subset of questions from the knowledge base to inject.
 * This ensures the LLM sees different questions each session.
 */
function getRandomQuestionSubset(kb: string, count: number = 8): string {
  // Extract all Q&A blocks from the knowledge base
  const questionBlocks: string[] = [];
  const lines = kb.split("\n");
  let currentBlock = "";
  let inQuestion = false;

  for (const line of lines) {
    if (line.match(/^### Q\d+\./)) {
      if (currentBlock.trim()) {
        questionBlocks.push(currentBlock.trim());
      }
      currentBlock = line + "\n";
      inQuestion = true;
    } else if (inQuestion) {
      if (line.match(/^##[^#]/) || line.match(/^---/)) {
        if (currentBlock.trim()) {
          questionBlocks.push(currentBlock.trim());
        }
        currentBlock = "";
        inQuestion = false;
      } else {
        currentBlock += line + "\n";
      }
    }
  }
  if (currentBlock.trim() && inQuestion) {
    questionBlocks.push(currentBlock.trim());
  }

  if (questionBlocks.length <= count) return questionBlocks.join("\n\n");

  // Fisher-Yates shuffle and pick `count` questions
  const shuffled = [...questionBlocks];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).join("\n\n");
}

/**
 * Extract only the "Core Topics" + "Complexity Cheatsheet" sections (lightweight context).
 */
function getTopicsOnly(kb: string): string {
  const lines = kb.split("\n");
  const result: string[] = [];
  let capture = false;

  for (const line of lines) {
    if (line.match(/^## (Core Topics|Complexity Cheatsheet)/)) {
      capture = true;
      result.push(line);
    } else if (line.match(/^## /) && capture) {
      capture = false;
    } else if (capture) {
      result.push(line);
    }
  }
  return result.join("\n");
}

// Generate the next interviewer question for a voice/text interview
const NextQInput = z.object({
  domain: DomainSchema,
  history: z.array(z.object({ role: z.enum(["interviewer", "candidate"]), content: z.string() })),
  questionIndex: z.number().int().min(0),
  groqApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  // Ollama pass-through
  useOllama: z.boolean().optional(),
  ollamaUrl: z.string().optional(),
  ollamaModel: z.string().optional(),
});

export const nextInterviewerTurn = createServerFn({ method: "POST" })
  .validator((d: unknown) => NextQInput.parse(d))
  .handler(async ({ data }) => {
    const fullKb = knowledgeBase[data.domain as Domain];
    const topics = getTopicsOnly(fullKb);

    // Pick a diverse set of reference topics/questions
    const randomQuestions = data.questionIndex === 0
      ? getRandomQuestionSubset(fullKb, 8)
      : getRandomQuestionSubset(fullKb, 5);

    const kbContext = `${topics}\n\n## Reference Technical Domain Concepts:\n${randomQuestions}`;
    const randomSeed = Math.floor(Math.random() * 1000);

    const persona = `You are a Principal Engineering Interviewer at a premier technology company (such as Microsoft, Amazon, or a top fintech engineering group). You are evaluating a technical candidate.

ROUND GUIDELINES:
- Every question must be in-depth, scenario-grounded, and conceptual.
- NEVER ask superficial definitions or questions that can be answered with a single word or short phrase.
- Challenge the candidate to explain real-world architectural design, trade-offs (space vs time, latency vs consistency, concurrency vs thread safety), internal mechanics of data structures/frameworks, and production edge cases.
- If the candidate answered a previous question: provide a professional 1-sentence assessment of their response (acknowledging sound logic or noting missed nuances), then transition directly into your next question.
- CRITICAL: Never reveal the answer or hint away the solution. Let the candidate lead the reasoning.
- DO NOT USE ANY MARKDOWN FORMATTING (no asterisks **, no hashtags #, no backticks \`, no bullet symbols). Write clean, natural conversational spoken English paragraphs so that voice synthesis speaks clearly and authentically.
- This is question #${data.questionIndex + 1} of 5. Calibrate depth appropriately.
- Do NOT repeat questions already asked in the transcript.
- If questionIndex is 5 (after 5 full questions), conclude gracefully: "Thank you for walking me through your technical approach across each round. That brings us to the end of our technical interview. Let's look at your detailed performance scorecard."`;

    const messages = [
      { role: "system" as const, content: `${persona}\n\nKNOWLEDGE BASE:\n${kbContext}` },
      ...data.history.map((h) => ({
        role: (h.role === "interviewer" ? "assistant" : "user") as "assistant" | "user",
        content: h.content,
      })),
      { role: "user" as const, content: data.history.length === 0
          ? "Start the interview with a warm one-line greeting and the first question."
          : "Continue the interview with the next question." },
    ];

    const res = await callLLM({
      data: {
        messages,
        temperature: 0.8,
        groqApiKey: data.groqApiKey,
        geminiApiKey: data.geminiApiKey,
        useOllama: data.useOllama,
        ollamaUrl: data.ollamaUrl,
        ollamaModel: data.ollamaModel,
      },
    });
    if (!res.ok) return { ok: false as const, error: res.message };
    return { ok: true as const, text: res.text };
  });

// Final evaluation
const EvalInput = z.object({
  domain: DomainSchema,
  transcript: z.array(z.object({ role: z.enum(["interviewer", "candidate"]), content: z.string() })),
  groqApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  // Ollama pass-through
  useOllama: z.boolean().optional(),
  ollamaUrl: z.string().optional(),
  ollamaModel: z.string().optional(),
});

export type Evaluation = {
  overallScore: number;
  technicalDepth: number;
  communication: number;
  problemSolving: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
};

export const evaluateInterview = createServerFn({ method: "POST" })
  .validator((d: unknown) => EvalInput.parse(d))
  .handler(async ({ data }) => {
    const transcriptText = data.transcript
      .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
      .join("\n");

    const prompt = `Analyze the following technical interview transcript for a candidate in the domain: ${data.domain}.
Carefully evaluate the candidate's answers for correctness, clarity, and depth.

TRANSCRIPT:
${transcriptText}

Based on the transcript, you MUST calculate actual, realistic scores from 0 to 100.
Do not use placeholder numbers. Actually evaluate the candidate's performance.
- If they gave bad or no answers, give them a low score (e.g. 20-40).
- If they gave good answers, give them a high score (e.g. 80-95).
Provide specific strengths, weaknesses, and recommendations based ONLY on what was said.

Return STRICT JSON only, no markdown fences, no prose. Use this exact schema:
{
  "overallScore": 85,
  "technicalDepth": 80,
  "communication": 90,
  "problemSolving": 85,
  "strengths": ["Clear explanation of X", "Good understanding of Y"],
  "weaknesses": ["Missed the edge case in Z"],
  "recommendations": ["Review topic W"],
  "summary": "Overall a strong performance with minor gaps in..."
}`;

    const res = await callLLM({
      data: {
        messages: [
          { role: "system", content: "You output strict JSON only. No markdown fences, no prose, just valid JSON." },
          { role: "user", content: prompt },
        ],
        jsonMode: true,
        temperature: 0.3,
        groqApiKey: data.groqApiKey,
        geminiApiKey: data.geminiApiKey,
        useOllama: data.useOllama,
        ollamaUrl: data.ollamaUrl,
        ollamaModel: data.ollamaModel,
      },
    });
    if (!res.ok) return { ok: false as const, error: res.message };

    try {
      const raw = res.text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
      const j = JSON.parse(raw);
      return { ok: true as const, evaluation: j as Evaluation };
    } catch {
      return { ok: false as const, error: "Failed to parse evaluation" };
    }
  });
