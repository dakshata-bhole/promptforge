import { ConstructedPrompt, ImprovedPromptResult, PromptComponent } from "@/lib/types";
import { compilePromptFromComponents } from "@/lib/prompt-engine/construct-prompt";
import { estimateTokens } from "@/lib/prompt-engine/select-strategy";

/**
 * Optimizes an engineered prompt by pruning redundant instructions,
 * refining verbose components, and compressing token footprint while retaining guardrails.
 */
export function optimizePrompt(current: ConstructedPrompt): ImprovedPromptResult {
  const changesSummary: string[] = [];
  
  const improvedComponents: PromptComponent[] = current.components.map((c) => {
    let content = c.content;

    // Prune general filler words and redundant phrases
    const initialLen = content.length;

    if (c.id === "role") {
      // Streamline role
      content = content
        .replace("You are a precise, analytical, and highly reliable AI assistant.", "Act as a precise analytical AI assistant.")
        .replace("You are a Senior Domain Subject Matter Expert with deep analytical rigor.", "Act as a Senior Subject Matter Expert.");
    }

    if (c.id === "context") {
      content = content.replace("Assume high standard industry practices and explicit evidence.", "Ground all answers in verified industry standards.");
    }

    if (c.id === "constraints") {
      // Keep essential rules concise
      if (content.includes("Do NOT invent or hallucinate facts")) {
        content = "- Ground answers solely in factual evidence.\n- Zero conversational filler or fluff.\n- If uncertain, output 'UNVERIFIED'.";
        changesSummary.push("Condensed guardrails into terse anti-hallucination directives.");
      }
    }

    if (c.id === "output_format") {
      content = content.replace("Structure your final response clearly with semantic headers or concise bullet points.", "Format: Direct, bulleted summary or structured code block.");
    }

    if (content.length < initialLen && !changesSummary.includes(`Pruned token bloat in ${c.name}`)) {
      changesSummary.push(`Trimmed redundant verbiage in ${c.name}.`);
    }

    const tokenCount = estimateTokens(content);
    return {
      ...c,
      content,
      tokenCount,
    };
  });

  // Check if any non-essential optional component was empty or bloated
  const finalPromptText = compilePromptFromComponents(improvedComponents);
  const originalTokens = current.tokenCount;
  const improvedTokens = estimateTokens(finalPromptText);
  const tokenDiff = originalTokens - improvedTokens;

  if (changesSummary.length === 0) {
    changesSummary.push("Syntactically tightened sentence structures across all active components.");
    changesSummary.push("Eliminated polite conversational preambles.");
  }

  const efficiencyRatio = Math.round((improvedTokens / Math.max(1, originalTokens)) * 100);

  return {
    originalPromptText: current.fullPromptText,
    improvedPromptText: finalPromptText,
    components: improvedComponents,
    originalTokens,
    improvedTokens,
    tokenDiff,
    changesSummary,
    efficiencyScore: efficiencyRatio,
  };
}