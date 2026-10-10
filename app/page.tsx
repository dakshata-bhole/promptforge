"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { PromptWorkspace } from "@/components/PromptWorkspace";
import { TaskInput } from "@/components/TaskInput";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { usePromptHistory } from "@/lib/usePromptHistory";
import { understandTask } from "@/lib/prompt-engine/understand-task";
import { TaskUnderstanding } from "@/lib/types";

export default function Home() {
  const [understanding, setUnderstanding] = useState<TaskUnderstanding | null>(null);
  const [isUnderstanding, setIsUnderstanding] = useState(false);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const { history, savePromptToHistory, clearHistory } = usePromptHistory();

  const handleForge = async (rawTask: string) => {
    setIsUnderstanding(true);
    setLlmResponse(null);
    setLlmError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      setUnderstanding(understandTask(rawTask));
    } catch {
      setLlmError("The task could not be analyzed. Please try again.");
    } finally {
      setIsUnderstanding(false);
    }
  };

  const handleRunLLM = async (promptText: string) => {
    setIsLlmLoading(true);
    setLlmError(null);

    try {
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The LLM request failed.");
      }

      setLlmResponse(data.response);
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : "The LLM request failed.");
    } finally {
      setIsLlmLoading(false);
    }
  };

  const handleLoadHistoryItem = (item: (typeof history)[number]) => {
    const restored = understandTask(item.rawTask);
    setUnderstanding(restored);
    setLlmResponse(item.llmResponse || null);
    setLlmError(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text)]">
      <CursorGlow />
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-80" />
      <div className="pointer-events-none fixed -left-32 top-16 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 bottom-0 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />

      <header className="relative z-10 border-b border-[var(--color-surface-border)] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-sm font-black text-white shadow-lg shadow-[var(--color-accent)]/20">
              P
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">PromptForge</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">LLM prompt engineering</p>
            </div>
          </div>
          <HistoryDrawer
            history={history}
            onSelectHistoryItem={handleLoadHistoryItem}
            onClearHistory={clearHistory}
          />
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <AnimatePresence mode="wait">
          {!understanding ? (
            <motion.section
              key="task-input"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex min-h-[65vh] flex-col items-center justify-center"
            >
              <div className="mb-8 max-w-2xl text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Build better prompts</p>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Turn a task into a reliable LLM prompt.</h2>
                <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                  Analyze the task, choose an execution strategy, inspect the prompt assembly, and compare optimized variants before calling the model.
                </p>
              </div>
              <TaskInput onForge={handleForge} isLoading={isUnderstanding} />
            </motion.section>
          ) : (
            <motion.section
              key="workspace"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center"
            >
              <PromptWorkspace
                understanding={understanding}
                onRunLLM={handleRunLLM}
                onReset={() => setUnderstanding(null)}
                llmResponse={llmResponse}
                isLlmLoading={isLlmLoading}
                llmError={llmError}
                onSaveHistory={(finalPromptText, strategy, tokens) =>
                  savePromptToHistory({
                    rawTask: understanding.rawTask,
                    finalPromptText,
                    strategy,
                    tokens,
                    llmResponse: llmResponse ?? undefined,
                  })
                }
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
