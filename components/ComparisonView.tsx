"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConstructedPrompt, ImprovedPromptResult } from "@/lib/types";

interface ComparisonViewProps {
  original: ConstructedPrompt;
  improved: ImprovedPromptResult;
  onSelectPrompt: (promptText: string) => void;
}

export function ComparisonView({ original, improved, onSelectPrompt }: ComparisonViewProps) {
  const [selectedSide, setSelectedSide] = useState<"original" | "improved">("improved");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Prompt Engineering Comparison
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            Side-by-side structural comparison showing precision improvements and token reduction.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-surface-border)] bg-white/70 px-3 py-1.5 shadow-sm">
          <div className="text-right">
            <span className="block text-[10px] uppercase leading-none text-[var(--color-muted)]">Token Saving</span>
            <span className="font-mono text-xs font-bold text-[var(--color-accent-emerald)]">
              -{improved.tokenDiff} tokens ({100 - improved.efficiencyScore}%)
            </span>
          </div>
        </div>
      </div>

      {improved.changesSummary.length > 0 && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3.5">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            Key Engineering Modifications:
          </span>
          <ul className="space-y-1">
            {improved.changesSummary.map((summary, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-amber-900/75">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SIDE BY SIDE PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ORIGINAL PROMPT PANEL */}
        <div
          onClick={() => {
            setSelectedSide("original");
            onSelectPrompt(original.fullPromptText);
          }}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            selectedSide === "original"
              ? "border-[var(--color-accent)] bg-white shadow-md ring-2 ring-[var(--color-accent)]/15"
              : "border-[var(--color-surface-border)] bg-[var(--color-surface)]/70 hover:bg-white/70"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Original Prompt
            </span>
            <span className="rounded bg-[var(--color-surface-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-muted)]">
              {improved.originalTokens} tokens
            </span>
          </div>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--color-surface-border)] bg-[#f8fafc] p-3 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {original.fullPromptText}
          </pre>
        </div>

        {/* IMPROVED PROMPT PANEL */}
        <div
          onClick={() => {
            setSelectedSide("improved");
            onSelectPrompt(improved.improvedPromptText);
          }}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            selectedSide === "improved"
              ? "border-[var(--color-accent-emerald)] bg-white shadow-md ring-2 ring-[var(--color-accent-emerald)]/15"
              : "border-[var(--color-surface-border)] bg-[var(--color-surface)]/70 hover:bg-white/70"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]">
                Optimized Prompt
              </span>
              <span className="rounded bg-[var(--color-accent-emerald)] px-1.5 py-0.2 text-[10px] font-bold uppercase text-white">
                Recommended
              </span>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-accent-emerald)]">
              {improved.improvedTokens} tokens
            </span>
          </div>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-emerald-100 bg-emerald-50/45 p-3 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {improved.improvedPromptText}
          </pre>
        </div>
      </div>
    </div>
  );
}
