import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLLM } from "./llm.functions";
import { knowledgeBase, type Domain } from "./knowledge";

const DomainSchema = z.enum(["dsa", "springboot", "system_design", "lld"]);

/**
 * Pick a random subset of questions from the knowledge base to inject.
 * This ensures the LLM sees different questions each session.
 */
/**
 * Pick a targeted or diverse subset of questions from the knowledge base to inject.
 * For DSA, it ensures candidates are assessed on Two Pointers, Sliding Window,
 * Hashing, and Monotonic Stack in early rounds before Trees/Graphs/DP.
 */
function getTargetedQuestionSubset(kb: string, domain: Domain, questionIndex: number): string {
  const lines = kb.split("\n");
  const questionBlocks: string[] = [];
  let currentBlock = "";
  let inQuestion = false;

  for (const line of lines) {
    if (line.match(/^### Q\d+\./)) {
      if (currentBlock.trim()) questionBlocks.push(currentBlock.trim());
      currentBlock = line + "\n";
      inQuestion = true;
    } else if (inQuestion) {
      if (line.match(/^##[^#]/) || line.match(/^---/)) {
        if (currentBlock.trim()) questionBlocks.push(currentBlock.trim());
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

  if (domain !== "dsa") {
    const shuffled = [...questionBlocks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6).join("\n\n");
  }

  // DSA pattern targeting per round
  let filterRegex: RegExp;
  if (questionIndex === 0) {
    filterRegex = /Two-pointer|Two Pointer|Sliding [Ww]indow|3Sum|Container With Most Water/i;
  } else if (questionIndex === 1) {
    filterRegex = /Hash|Map|Prefix [Ss]um|Consecutive Sequence|Anagram|Set/i;
  } else if (questionIndex === 2) {
    filterRegex = /Sliding [Ww]indow|Monotonic [Ss]tack|Deque|Next Greater|Temperature|Histogram/i;
  } else if (questionIndex === 3) {
    filterRegex = /Binary [Ss]earch|Tree|BST|Heap|Trie|LCA|Median/i;
  } else {
    filterRegex = /Graph|DP|Dynamic [Pp]rogramming|Dijkstra|Kruskal|Kahn|Topological|Subsequence|Cycle/i;
  }

  const matches = questionBlocks.filter((b) => filterRegex.test(b));
  const pool = matches.length >= 3 ? matches : questionBlocks;

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5).join("\n\n");
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

    // Pick a targeted set of reference concepts for the round
    const targetedQuestions = getTargetedQuestionSubset(fullKb, data.domain as Domain, data.questionIndex);

    const kbContext = `${topics}\n\n## Reference Technical Domain Concepts:\n${targetedQuestions}`;

    let dsaTopicDirective = "";
    if (data.domain === "dsa") {
      if (data.questionIndex === 0) {
        dsaTopicDirective = `\n- TOPIC REQUIREMENT FOR QUESTION 1: You MUST ask a scenario-based question testing the TWO POINTERS technique (e.g. 3Sum, Container With Most Water, Trapping Rain Water, or two pointers converging on a sorted array) OR SLIDING WINDOW (e.g. longest substring with distinct character limits). Do NOT ask about binary trees, dynamic programming, or graphs here.`;
      } else if (data.questionIndex === 1) {
        dsaTopicDirective = `\n- TOPIC REQUIREMENT FOR QUESTION 2: You MUST ask a scenario-based question testing HASHING, FREQUENCY MAPPING, OR PREFIX SUMS WITH HASH TABLES (e.g. Subarray Sum Equals K with negative numbers, Longest Consecutive Sequence in O(N) using HashSet, Group Anagrams, or 4Sum II). Do NOT ask about binary trees, dynamic programming, or graphs here.`;
      } else if (data.questionIndex === 2) {
        dsaTopicDirective = `\n- TOPIC REQUIREMENT FOR QUESTION 3: You MUST ask a scenario-based question testing SLIDING WINDOW (e.g. Minimum Window Substring, permutation string matching) OR MONOTONIC STACK / MONOTONIC DEQUE (e.g. Daily Temperatures / Next Greater Element, Sliding Window Maximum, Largest Rectangle in Histogram). Do NOT ask about binary trees or graphs here.`;
      } else if (data.questionIndex === 3) {
        dsaTopicDirective = `\n- TOPIC REQUIREMENT FOR QUESTION 4: You may ask a question testing BINARY SEARCH (e.g. rotated sorted array, search space reduction), HEAPS (e.g. Top K elements with min-heap, stream median with two heaps), TRIES, OR BINARY TREES (e.g. Lowest Common Ancestor).`;
      } else if (data.questionIndex === 4) {
        dsaTopicDirective = `\n- TOPIC REQUIREMENT FOR QUESTION 5: You may ask a question testing ADVANCED GRAPHS (e.g. Topological Sort / Kahn's algorithm for dependency scheduling, cycle detection, Dijkstra shortest paths) OR DYNAMIC PROGRAMMING (e.g. state transitions in Coin Change, Longest Increasing Subsequence, 0/1 knapsack).`;
      }
    }

    const persona = `You are a Principal Engineering Interviewer at a premier technology company (such as Microsoft, Amazon, or a top fintech engineering group). You are evaluating a technical candidate.

ROUND GUIDELINES:
- Every question must be in-depth, scenario-grounded, and conceptual.
- NEVER ask superficial definitions or questions that can be answered with a single word or short phrase.
- Challenge the candidate to explain real-world architectural design, trade-offs (space vs time, latency vs consistency, concurrency vs thread safety), internal mechanics of data structures/frameworks, and production edge cases.${dsaTopicDirective}
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
