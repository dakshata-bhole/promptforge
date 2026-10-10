import { StrategyType, PromptStrategy, TaskUnderstanding } from "@/lib/types";

export const STRATEGY_DEFINITIONS: Record<Exclude<StrategyType, "auto">, PromptStrategy> = {
  zero_shot: {
    id: "zero_shot",
    name: "Zero Shot",
    badge: "Direct & Clear",
  },
  few_shot: {
    id: "few_shot",
    name: "Few Shot",
    badge: "Exemplar Guided",
  },
  role_based: {
    id: "role_based",
    name: "Role Based",
    badge: "Domain Expert",
  },
  structured_json: {
    id: "structured_json",
    name: "Structured Output",
    badge: "Schema Guarded",
  },
  context_grounded: {
    id: "context_grounded",
    name: "Context Grounded",
    badge: "Strict Citation",
  },
  constraint_driven: {
    id: "constraint_driven",
    name: "Constraint Based",
    badge: "Strict Guardrails",
  },
  chain_of_thought: {
    id: "chain_of_thought",
    name: "Reasoning",
    badge: "Step-by-Step",
  },
};

/**
 * Calculates accurate approximate LLM token count based on whitespace & word structure.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const cleaned = text.trim();
  const words = cleaned.split(/\s+/).length;
  const chars = cleaned.length;
  return Math.max(1, Math.round((words * 1.3 + chars / 4) / 2));
}

export function recommendStrategy(understanding: TaskUnderstanding): StrategyType {
  const { category, requiresReasoning, requiresFactualAccuracy, requiresStructuredOutput, isEducational, estimatedComplexity } = understanding;

  // Educational requests: recommend zero_shot for simple explanations, or role_based for technical topics
  if (isEducational) {
    return estimatedComplexity === "low" ? "zero_shot" : "role_based";
  }

  if (requiresStructuredOutput) return "structured_json";

  // Only recommend Reasoning (CoT) if task is genuinely complex (high complexity or explicitly requests logic/step-by-step)
  if (requiresReasoning || (category === "reasoning_or_math" && estimatedComplexity !== "low")) {
    return "chain_of_thought";
  }

  if (requiresFactualAccuracy || category === "factual_qa" || category === "extraction") {
    return "context_grounded";
  }

  if (category === "code_generation") return "role_based";
  if (category === "classification") return "few_shot";
  if (category === "summarization") return "constraint_driven";

  return "zero_shot";
}