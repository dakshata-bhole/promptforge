import {
  StrategyType,
  TaskUnderstanding,
  PromptComponent,
  ConstructedPrompt,
} from "@/lib/types";
import { STRATEGY_DEFINITIONS, estimateTokens } from "@/lib/prompt-engine/select-strategy";

export function buildComponentsForStrategy(
  task: string,
  strategy: StrategyType,
  understanding?: TaskUnderstanding
): PromptComponent[] {
  const effectiveStrategy =
    strategy === "auto"
      ? understanding?.recommendedStrategy || "zero_shot"
      : strategy;

  const components: PromptComponent[] = [];
  const isEducational = understanding?.isEducational || false;

  // 1. Role Component - ONLY included if role_based strategy OR specialized category (code/math/legal)
  if (effectiveStrategy === "role_based" || understanding?.category === "code_generation") {
    let roleText = "You are a Senior Subject Matter Expert.";
    if (understanding?.category === "code_generation") {
      roleText = "You are a Lead Software Architect.";
    } else if (isEducational) {
      roleText = "You are an Expert Educator specializing in clear, accessible explanations.";
    }

    components.push({
      id: "role",
      name: "Role & Persona",
      label: "ROLE",
      content: roleText,
      enabled: true,
      isRequired: false,
      description: "Establishes expert domain identity and scope bounds.",
      tokenCount: estimateTokens(roleText),
    });
  }

  // 2. Task Component - Always included
  const taskText = `Objective: ${task.trim()}`;
  components.push({
    id: "task",
    name: "Task Objective",
    label: "TASK",
    content: taskText,
    enabled: true,
    isRequired: true,
    description: "The core instruction or question to be executed.",
    tokenCount: estimateTokens(taskText),
  });

  // 3. Beginner-Friendly Teaching Guidelines (Included for all explanation/educational tasks)
  if (isEducational || understanding?.category === "educational_explanation") {
    const teachingText = 
      "- Assume no prior knowledge unless specified.\n" +
      "- Use simple, natural English.\n" +
      "- Explain every necessary technical term when first introduced.\n" +
      "- Do NOT talk down to the user or use childish analogies.\n" +
      "- Do NOT overload the initial response with advanced details.\n" +
      "- Teach progressively: basic core concept first, followed by deeper details.\n" +
      "- End by offering to explain the next level if the user wants to go deeper.";

    components.push({
      id: "educational_guidelines",
      name: "Progressive Teaching Protocol",
      label: "TEACHING",
      content: teachingText,
      enabled: true,
      isRequired: true,
      description: "Enforces clear, progressive, non-childish beginner explanations.",
      tokenCount: estimateTokens(teachingText),
    });
  }

  // 4. Context Component - ONLY included when context_grounded OR explicitly needed
  if (effectiveStrategy === "context_grounded") {
    const contextText = "STRICT CONTEXT BOUNDARY: Rely ONLY on verifiable factual context provided or standard universally accepted facts. If information is missing or unverified, state 'Insufficient Data' rather than making assumptions.";
    components.push({
      id: "context",
      name: "Context & Domain Scope",
      label: "CONTEXT",
      content: contextText,
      enabled: true,
      isRequired: false,
      description: "Prioritizes supplied information and prevents unsupported claims.",
      tokenCount: estimateTokens(contextText),
    });
  }

  // 5. Examples Component - ONLY included for Few Shot strategy
  if (effectiveStrategy === "few_shot") {
    const exampleText = 
      `Example 1:\nInput: "Extract key metrics from Q3 report"\nOutput: {"status": "success", "metrics": ["revenue", "growth"]}\n\n` +
      `Example 2:\nInput: "Check system health"\nOutput: {"status": "healthy", "latency": "12ms"}`;
    components.push({
      id: "examples",
      name: "In-Context Exemplars",
      label: "EXAMPLES",
      content: exampleText,
      enabled: true,
      isRequired: false,
      description: "Demonstration pairs guiding output pattern matching.",
      tokenCount: estimateTokens(exampleText),
    });
  }

  // 6. Reasoning Instructions Component - ONLY for Chain of Thought / genuinely complex tasks
  if (effectiveStrategy === "chain_of_thought") {
    const reasoningText = "Before outputting your final answer, outline your step-by-step reasoning clearly under a '<reasoning>' section. Analyze edge cases and verify each deduction step.";
    components.push({
      id: "reasoning_instructions",
      name: "Reasoning Pathway (CoT)",
      label: "REASONING",
      content: reasoningText,
      enabled: true,
      isRequired: false,
      description: "Requires transparent step-by-step reasoning before final conclusion.",
      tokenCount: estimateTokens(reasoningText),
    });
  }

  // 7. Relevant Anti-Hallucination Constraints - Minimal, task-relevant guardrails
  let constraintsText = "- Do NOT invent unverified facts, metrics, or claims.\n- If uncertain, clearly acknowledge limitations.";
  if (effectiveStrategy === "constraint_driven") {
    constraintsText += "\n- Adhere strictly to word boundaries and eliminate conversational preambles.";
  }
  
  components.push({
    id: "constraints",
    name: "Task Safeguards",
    label: "CONSTRAINTS",
    content: constraintsText,
    enabled: true,
    isRequired: true,
    description: "Relevant safeguards preventing hallucination without adding token bloat.",
    tokenCount: estimateTokens(constraintsText),
  });

  // 8. Output Format Component - Included for Structured strategy or structured tasks
  if (effectiveStrategy === "structured_json" || understanding?.requiresStructuredOutput) {
    const outputFormatText = "Return the final result strictly formatted as valid JSON matching the required schema. Do not enclose in conversational intros.";
    components.push({
      id: "output_format",
      name: "Output Formatting Schema",
      label: "FORMAT",
      content: outputFormatText,
      enabled: true,
      isRequired: false,
      description: "Organized requirements or JSON schema formatting.",
      tokenCount: estimateTokens(outputFormatText),
    });
  }

  return components;
}

export function compilePromptFromComponents(components: PromptComponent[]): string {
  return components
    .filter((c) => c.enabled && c.content.trim().length > 0)
    .map((c) => `### ${c.name.toUpperCase()}\n${c.content}`)
    .join("\n\n");
}

export function constructPrompt(
  task: string,
  strategy: StrategyType,
  understanding?: TaskUnderstanding
): ConstructedPrompt {
  const effectiveStrat =
    strategy === "auto"
      ? understanding?.recommendedStrategy || "zero_shot"
      : strategy;

  const components = buildComponentsForStrategy(task, effectiveStrat, understanding);
  const fullPromptText = compilePromptFromComponents(components);
  const tokenCount = estimateTokens(fullPromptText);
  const stratDef = STRATEGY_DEFINITIONS[effectiveStrat as Exclude<StrategyType, "auto">];

  return {
    rawTask: task,
    strategy: effectiveStrat,
    strategyName: stratDef?.name || "Standard Strategy",
    components,
    fullPromptText,
    tokenCount,
    constructedAt: Date.now(),
  };
}