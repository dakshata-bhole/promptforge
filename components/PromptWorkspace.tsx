"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TaskUnderstanding,
  StrategyType,
  ConstructedPrompt,
  ImprovedPromptResult,
  PromptComponent,
} from "@/lib/types";
import { StrategySelector } from "@/components/StrategySelector";
import { ComponentManager } from "@/components/ComponentManager";
import { ComparisonView } from "@/components/ComparisonView";
import { constructPrompt, compilePromptFromComponents } from "@/lib/prompt-engine/construct-prompt";
import { optimizePrompt } from "@/lib/prompt-engine/optimize";
import { estimateTokens, STRATEGY_DEFINITIONS } from "@/lib/prompt-engine/select-strategy";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface PromptWorkspaceProps {
  understanding: TaskUnderstanding;
  onRunLLM: (promptText: string) => void;
  onReset: () => void;
  llmResponse: string | null;
  isLlmLoading: boolean;
  llmError: string | null;
  onSaveHistory: (finalPromptText: string, strategy: StrategyType, tokens: number) => void;
}

export function PromptWorkspace({
  understanding,
  onRunLLM,
  onReset,
  llmResponse,
  isLlmLoading,
  llmError,
  onSaveHistory,
}: PromptWorkspaceProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>("auto");
  const [activeTab, setActiveTab] = useState<"workspace" | "compare">("workspace");

  // Initial prompt construction state
  const [constructed, setConstructed] = useState<ConstructedPrompt>(() =>
    constructPrompt(understanding.rawTask, "auto", understanding)
  );

  // Improved prompt state
  const [improvedResult, setImprovedResult] = useState<ImprovedPromptResult | null>(null);
  
  // Copy state feedback
  const [copied, setCopied] = useState(false);

  // Strategy change handler
  const handleStrategyChange = (newStrat: StrategyType) => {
    setSelectedStrategy(newStrat);
    const newPrompt = constructPrompt(understanding.rawTask, newStrat, understanding);
    setConstructed(newPrompt);
    setImprovedResult(null); // Reset comparison when strategy changes
  };

  // Component edit / toggle handler
  const handleComponentsChange = (updatedComponents: PromptComponent[]) => {
    const newText = compilePromptFromComponents(updatedComponents);
    const newTokens = estimateTokens(newText);

    setConstructed((prev) => ({
      ...prev,
      components: updatedComponents,
      fullPromptText: newText,
      tokenCount: newTokens,
    }));
    setImprovedResult(null);
  };

  // Improve Prompt trigger
  const handleImprove = () => {
    const result = optimizePrompt(constructed);
    setImprovedResult(result);
  };

  // Active working prompt text (use improved text if available and in compare tab or selected)
  const currentPromptText = improvedResult ? improvedResult.improvedPromptText : constructed.fullPromptText;
  const currentTokenCount = improvedResult ? improvedResult.improvedTokens : constructed.tokenCount;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const exportData = {
      rawTask: understanding.rawTask,
      category: understanding.category,
      strategy: constructed.strategy,
      tokenCount: currentTokenCount,
      fullPromptText: currentPromptText,
      components: constructed.components,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-forge-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = () => {
    onRunLLM(currentPromptText);
    onSaveHistory(currentPromptText, constructed.strategy, currentTokenCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-6xl space-y-6 pb-16"
    >
      {/* NAVIGATION BAR & TASK SUMMARY */}
      <div className="glass-depth-card flex flex-col items-start justify-between gap-4 rounded-2xl p-6 md:flex-row md:items-center">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onReset}
              className="soft-focus flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              ← Edit Raw Task
            </button>
            <span className="text-[10px] text-[var(--color-muted)]/60">•</span>
            <span className="rounded bg-[var(--color-accent-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              {understanding.category.replace("_", " ")}
            </span>
          </div>
          <h2 className="line-clamp-1 text-lg font-semibold text-[var(--color-text)]">
            "{understanding.rawTask}"
          </h2>
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            Rationale: <span className="font-medium text-[var(--color-text-secondary)]">{understanding.rationale}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--color-surface-border)] bg-white/60 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "workspace"
                ? "bg-white text-[var(--color-text)] shadow-xs"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Engineering Workspace
          </button>
          <button
            onClick={() => {
              if (!improvedResult) handleImprove();
              setActiveTab("compare");
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "compare"
                ? "bg-white text-[var(--color-text)] shadow-xs"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Strategy Comparison
            {improvedResult && (
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-emerald)]" />
            )}
          </button>
        </div>
      </div>

      {/* STRATEGY SELECTOR */}
      <div className="glass-depth-card rounded-2xl p-6 shadow-xl">
        <StrategySelector
          selectedStrategy={selectedStrategy}
          recommendedStrategy={understanding.recommendedStrategy}
          onSelectStrategy={handleStrategyChange}
        />
      </div>

      {/* TAB CONTENT: WORKSPACE vs COMPARISON */}
      <AnimatePresence mode="wait">
        {activeTab === "workspace" ? (
          <motion.div
            key="workspace-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT: COMPONENT MANAGER */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-depth-card rounded-2xl p-5 shadow-xl space-y-4">
                <ComponentManager
                  components={constructed.components}
                  onChange={handleComponentsChange}
                />

                <div className="pt-2 border-t border-[var(--color-surface-border)]">
                  <button
                    onClick={handleImprove}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-700/30 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ✨ Optimize Prompt (Reduce Bloat)
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: CONSTRUCTED PROMPT PREVIEW & LLM EXECUTION */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-depth-card rounded-2xl p-6 shadow-xl space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      Engineered Prompt Output
                    </h3>
                    <span className="rounded bg-[var(--color-accent-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-accent)]">
                      {currentTokenCount} tokens
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="soft-focus rounded px-2.5 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)]"
                    >
                      {copied ? "✓ Copied!" : "Copy Prompt"}
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="soft-focus rounded px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                    >
                      Export
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[var(--color-surface-border)] bg-[#f8fafc] p-4 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)] shadow-inner">
                  {currentPromptText}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-surface-border)] pt-3">
                  <span className="text-xs text-[var(--color-muted)]">
                    Model target: <strong className="font-semibold text-[var(--color-text-secondary)]">Gemini 3.5 Flash</strong>
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExecute}
                    disabled={isLlmLoading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[var(--color-accent)]/15 hover:bg-[#2866b0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLlmLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Generating Response...
                      </>
                    ) : (
                      <>
                        Execute Prompt with LLM
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* LLM RESPONSE DISPLAY CARD */}
              <AnimatePresence>
                {(llmResponse || isLlmLoading || llmError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-depth-card rounded-2xl p-6 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text)]">
                          LLM Output Response
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">
                        {llmResponse ? `~${estimateTokens(llmResponse)} tokens` : "Processing..."}
                      </span>
                    </div>

                    {isLlmLoading && (
                      <div className="py-8 flex flex-col items-center justify-center space-y-2 text-xs text-[var(--color-muted)]">
                        <span className="h-6 w-6 rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] animate-spin" />
                        <p>Awaiting model generation stream...</p>
                      </div>
                    )}

                    {llmResponse && !isLlmLoading && (
                      <div className="max-h-96 overflow-y-auto rounded-xl border border-[var(--color-surface-border)] bg-white/75 p-4 shadow-sm">
                        <MarkdownRenderer content={llmResponse} />
                      </div>
                    )}


                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compare-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="glass-depth-card rounded-2xl p-6 shadow-xl"
          >
            {improvedResult ? (
              <ComparisonView
                original={constructed}
                improved={improvedResult}
                onSelectPrompt={(text) => {
                  setConstructed((prev) => ({
                    ...prev,
                    fullPromptText: text,
                    tokenCount: estimateTokens(text),
                  }));
                  setActiveTab("workspace");
                }}
              />
            ) : (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs text-[var(--color-muted)]">No comparison generated yet.</p>
                <button
                  onClick={handleImprove}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-xs font-medium text-white shadow-xs"
                >
                  Generate Optimization Comparison
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
