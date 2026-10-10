"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";

interface TaskInputProps {
  onForge: (task: string) => void;
  isLoading?: boolean;
}

export function TaskInput({ onForge, isLoading = false }: TaskInputProps) {
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim().length > 0) {
      onForge(task.trim());
    }
  };

  const sampleTasks = [
    "Explain API",
    "Design a scalable rate limiting middleware in Rust with Redis fallback.",
    "Draft a non-disclosure agreement clause for cross-border software IP transfer.",
  ];

  return (
    <div className="w-full max-w-3xl">
      <TiltCard className="glass-depth-card w-full rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--color-accent)]/10 blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4 flex items-center justify-between">
            <label
              htmlFor="task"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_4px_rgba(51,120,201,0.10)]" />
              Raw Task Specification
            </label>
            <span className="font-mono text-[11px] text-[var(--color-muted)]">
              {task.length} chars
            </span>
          </div>

          <textarea
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want the LLM to do..."
            rows={5}
            className="w-full resize-none rounded-xl border border-[var(--color-surface-border)] bg-white/55 px-4 py-4 text-base leading-7 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/55 outline-none transition-all focus:border-[var(--color-accent)]/45 focus:bg-white focus:ring-4 focus:ring-[var(--color-accent)]/10"
          />

          <div className="mt-5 flex flex-col gap-4 border-t border-[var(--color-surface-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-xs font-medium text-[var(--color-muted)]">Quick examples:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleTasks.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTask(sample)}
                    className="rounded-lg border border-[var(--color-surface-border)] bg-white/65 px-2.5 py-1 text-[11px] text-[var(--color-muted)] transition-all hover:border-[var(--color-accent)]/35 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                  >
                    Ex {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={task.trim().length === 0 || isLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/15 transition-all hover:bg-[#2866b0] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing Task...
                </>
              ) : (
                <>
                  Forge Engineered Prompt
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </TiltCard>
    </div>
  );
}