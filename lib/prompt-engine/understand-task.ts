import { TaskCategory, TaskUnderstanding, StrategyType } from "@/lib/types";
import { recommendStrategy, STRATEGY_DEFINITIONS } from "@/lib/prompt-engine/select-strategy";

const CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  educational_explanation: [
    "explain",
    "what is",
    "how does",
    "teach me",
    "intro to",
    "introduction",
    "concept of",
    "help me understand",
    "basics of",
  ],
  code_generation: [
    "code",
    "function",
    "script",
    "program",
    "debug",
    "class",
    "algorithm",
    "api client",
    "rust",
    "python",
    "javascript",
    "typescript",
  ],
  reasoning_or_math: [
    "calculate",
    "solve",
    "prove",
    "equation",
    "step by step",
    "math",
    "quantum key distribution",
  ],
  creative_writing: [
    "story",
    "poem",
    "write a story",
    "creative",
    "fiction",
    "narrative",
    "essay",
  ],
  summarization: ["summarize", "summary", "condense", "tl;dr", "shorten"],
  extraction: ["extract", "pull out", "list all", "find every", "identify the"],
  classification: ["classify", "categorize", "label", "is this", "which type"],
  factual_qa: ["who is", "when did", "define", "where is"],
  general: [],
};

function detectCategory(task: string): TaskCategory {
  const lower = task.toLowerCase();

  let bestCategory: TaskCategory = "general";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as TaskCategory;
    }
  }

  return bestCategory;
}

function detectEducational(task: string, category: TaskCategory): boolean {
  const lower = task.toLowerCase();
  return (
    category === "educational_explanation" ||
    /explain|what is|how does|teach|basics|overview|understand/.test(lower)
  );
}

function detectReasoning(task: string): boolean {
  const lower = task.toLowerCase();
  // Only detect reasoning if step by step, complex math/logic or proof is explicitly needed
  return /step by step reasoning|prove|calculate logic|complex math|quantum algorithm/.test(lower);
}

function detectFactualAccuracy(category: TaskCategory, task: string): boolean {
  const lower = task.toLowerCase();
  return (
    category === "factual_qa" ||
    category === "extraction" ||
    /accurate|fact|correct|precise|exact|legal|clause|nda/.test(lower)
  );
}

function detectStructuredOutput(task: string): boolean {
  const lower = task.toLowerCase();
  return /json|table|schema|structured output/.test(lower);
}

function detectCreativity(category: TaskCategory): boolean {
  return category === "creative_writing";
}

function estimateComplexity(
  task: string,
  requiresReasoning: boolean
): "low" | "medium" | "high" {
  const wordCount = task.trim().split(/\s+/).length;

  if (requiresReasoning && wordCount > 15) return "high";
  if (wordCount > 30) return "high";
  if (wordCount > 12 || requiresReasoning) return "medium";
  return "low";
}

export function understandTask(rawTask: string): TaskUnderstanding {
  const category = detectCategory(rawTask);
  const isEducational = detectEducational(rawTask, category);
  const requiresReasoning = detectReasoning(rawTask);
  const requiresFactualAccuracy = detectFactualAccuracy(category, rawTask);
  const requiresStructuredOutput = detectStructuredOutput(rawTask);
  const requiresCreativity = detectCreativity(category);
  const estimatedComplexity = estimateComplexity(rawTask, requiresReasoning);

  const base: Omit<TaskUnderstanding, "recommendedStrategy" | "rationale"> = {
    rawTask,
    category,
    requiresReasoning,
    requiresFactualAccuracy,
    requiresStructuredOutput,
    requiresCreativity,
    isEducational,
    estimatedComplexity,
  };

  const recommendedStrategy = recommendStrategy(base as TaskUnderstanding);
  const stratKey = recommendedStrategy as Exclude<StrategyType, "auto">;
  const strategyInfo = STRATEGY_DEFINITIONS[stratKey];

  let rationale = `Selected ${strategyInfo.name} because task `;
  if (isEducational) rationale += "requests an explanation, best served by progressive beginner-friendly teaching.";
  else if (requiresStructuredOutput) rationale += "demands clean structured formatting.";
  else if (requiresReasoning) rationale += "involves multi-step deduction and complex logic.";
  else if (requiresFactualAccuracy) rationale += "requires strict factual grounding to minimize hallucination risk.";
  else if (category === "code_generation") rationale += "is a technical engineering task benefiting from role precision.";
  else rationale += "is direct and clear, ideal for efficient zero-shot execution.";

  return {
    ...base,
    recommendedStrategy,
    rationale,
  };
}