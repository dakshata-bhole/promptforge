"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptComponent } from "@/lib/types";

interface ComponentManagerProps {
  components: PromptComponent[];
  onChange: (updatedComponents: PromptComponent[]) => void;
  disabled?: boolean;
}

export function ComponentManager({ components, onChange, disabled = false }: ComponentManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleComponent = (id: string) => {
    if (disabled) return;
    const updated = components.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    onChange(updated);
  };

  const updateContent = (id: string, newContent: string) => {
    const updated = components.map((c) =>
      c.id === id ? { ...c, content: newContent } : c
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Prompt Assembly Components
          </h3>
          <p className="text-xs text-[var(--color-muted)] opacity-80">
            Inspect, toggle, or tune individual structural building blocks.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--color-accent)] font-medium">
          Active: {components.filter((c) => c.enabled).length}/{components.length}
        </div>
      </div>

      <div className="space-y-2.5">
        {components.map((comp) => {
          const isEditing = editingId === comp.id;

          return (
            <motion.div
              key={comp.id}
              layout
              className={`rounded-xl border transition-all ${
                comp.enabled
                  ? "bg-white/90 border-[var(--color-surface-border)] shadow-xs"
                  : "bg-[var(--color-surface)]/60 border-dashed border-gray-300 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between p-3.5 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleComponent(comp.id)}
                    disabled={disabled || comp.isRequired}
                    className={`mt-0.5 relative flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      comp.enabled ? "bg-[var(--color-accent)]" : "bg-gray-300"
                    } ${comp.isRequired ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                        comp.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded">
                        {comp.label}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">
                        {comp.name}
                      </h4>
                      {comp.isRequired && (
                        <span className="text-[9px] font-medium uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-snug">
                      {comp.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[var(--color-muted)]">
                    ~{comp.tokenCount} tokens
                  </span>
                  {comp.enabled && (
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : comp.id)}
                      disabled={disabled}
                      className="text-xs font-medium text-[var(--color-accent)] hover:underline px-2 py-1 rounded bg-[var(--color-surface)]"
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  )}
                </div>
              </div>

              {/* EDITABLE CONTENT OR PREVIEW */}
              <AnimatePresence>
                {comp.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3.5 pb-3.5 pt-0 overflow-hidden"
                  >
                    {isEditing ? (
                      <textarea
                        value={comp.content}
                        onChange={(e) => updateContent(comp.id, e.target.value)}
                        rows={3}
                        className="w-full text-xs font-mono p-2.5 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                      />
                    ) : (
                      <div className="rounded-lg bg-[var(--color-surface)]/80 p-2.5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed border border-[var(--color-surface-border)]">
                        {comp.content}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
