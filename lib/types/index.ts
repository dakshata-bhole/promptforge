// Expanded prompt engineering domain models and types

export type TaskCategory =
  | "factual_qa"
  | "educational_explanation"
  | "creative_writing"
  | "code_generation"
  | "summarization"
  | "reasoning_or_math"
  | "classification"
  | "extraction"
  | "general";

export type StrategyType =
  | "auto"
  | "zero_shot"
  | "few_shot"
  | "role_based"
  | "structured_json"
  | "context_grounded"
  | "constraint_driven"
  | "chain_of_thought";

export type TaskUnderstanding = {
  rawTask: string;
  category: TaskCategory;
  requiresReasoning: boolean;
  requiresFactualAccuracy: boolean;
  requiresStructuredOutput: boolean;
  requiresCreativity: boolean;
  isEducational: boolean;
  estimatedComplexity: "low" | "medium" | "high";
  recommendedStrategy: StrategyType;
  rationale: string;
};

export type ComponentType =
  | "role"
  | "task"
  | "context"
  | "examples"
  | "constraints"
  | "reasoning_instructions"
  | "educational_guidelines"
  | "output_format";

export type PromptComponent = {
  id: ComponentType;
  name: string;
  label: string;
  content: string;
  enabled: boolean;
  isRequired: boolean;
  description: string;
  tokenCount: number;
};

export type PromptStrategy = {
  id: StrategyType;
  name: string;
  badge: string;
};

export type ConstructedPrompt = {
  rawTask: string;
  strategy: StrategyType;
  strategyName: string;
  components: PromptComponent[];
  fullPromptText: string;
  tokenCount: number;
  constructedAt: number;
};

export type ImprovedPromptResult = {
  originalPromptText: string;
  improvedPromptText: string;
  components: PromptComponent[];
  originalTokens: number;
  improvedTokens: number;
  tokenDiff: number;
  changesSummary: string[];
  efficiencyScore: number; // calculated ratio
};

export type PromptHistoryItem = {
  id: string;
  timestamp: number;
  rawTask: string;
  strategy: StrategyType;
  finalPromptText: string;
  tokens: number;
  llmResponse?: string;
};