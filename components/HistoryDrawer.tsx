"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptHistoryItem } from "@/lib/types";

interface HistoryDrawerProps {
  history: PromptHistoryItem[];
  onSelectHistoryItem: (item: PromptHistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryDrawer({ history, onSelectHistoryItem, onClearHistory }: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="soft-focus inline-flex items-center gap-2 rounded-full border border-[var(--color-surface-border)] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text)] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
      >
        <svg className="h-3.5 w-3.5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History ({history.length})
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-[#f8fafc]/95 shadow-2xl border-l border-[var(--color-surface-border)] flex flex-col justify-between backdrop-blur-xl"
              >
                <div className="p-5 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-white/70">
                  <div>
                    <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text)]">
                      Engineering History
                    </h2>
                    <p className="text-xs text-[var(--color-muted)]">Previously forged prompts & responses</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="soft-focus rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                    aria-label="Close history"
                  >
                    ✕
                  </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[var(--color-muted)]">
                      No saved prompts yet. Forged prompts will be logged here automatically.
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectHistoryItem(item);
                          setIsOpen(false);
                        }}
                        className="cursor-pointer rounded-xl border border-[var(--color-surface-border)] bg-white/75 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]/35 hover:bg-white hover:shadow-md"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                            {item.strategy}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-muted)]">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed text-[var(--color-text)] line-clamp-2">
                          "{item.rawTask}"
                        </p>
                        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-surface-border)] pt-2 font-mono text-[11px] text-[var(--color-muted)]">
                          <span>~{item.tokens} tokens</span>
                          {item.llmResponse && <span className="font-semibold text-[var(--color-accent-emerald)]">Response Logged</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {history.length > 0 && (
                  <div className="p-4 border-t border-[var(--color-surface-border)] bg-white/50 flex justify-end">
                    <button
                      onClick={onClearHistory}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Clear History
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
