"use client";

import React from "react";
import { motion } from "framer-motion";
import { StrategyType } from "@/lib/types";
import { STRATEGY_DEFINITIONS } from "@/lib/prompt-engine/select-strategy";

interface StrategySelectorProps {
  selectedStrategy: StrategyType;
  recommendedStrategy: StrategyType;
  onSelectStrategy: (strategy: StrategyType) => void;
  disabled?: boolean;
}

export function StrategySelector({
  selectedStrategy,
  recommendedStrategy,
  onSelectStrategy,
  disabled = false,
}: StrategySelectorProps) {
  const autoInfo = STRATEGY_DEFINITIONS[recommendedStrategy as Exclude<StrategyType, "auto">];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Prompt Engineering Strategy
          </h3>
          <p className="text-xs text-[var(--color-muted)] opacity-80">
            System automatically selects the optimal technique for the task. You can manually override below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* AUTO STRATEGY OPTION */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => onSelectStrategy("auto")}
          disabled={disabled}
          className={`relative flex flex-col justify-between rounded-xl p-4 text-left transition-all ${
            selectedStrategy === "auto"
              ? "bg-white shadow-md ring-2 ring-[var(--color-accent)]"
              : "bg-[var(--color-surface)] border border-[var(--color-surface-border)] opacity-85 hover:opacity-100"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                ✦ Auto Technique
              </span>
              {selectedStrategy === "auto" && (
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              )}
            </div>
            <div className="text-xs font-bold text-[var(--color-text)]">
              Recommended: {autoInfo?.name}
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-muted)] leading-relaxed">
              Auto-selected based on task requirements.
            </p>
          </div>
        </motion.button>

        {/* MANUAL STRATEGIES */}
        {(Object.keys(STRATEGY_DEFINITIONS) as Array<Exclude<StrategyType, "auto">>).map(
          (key) => {
            const strat = STRATEGY_DEFINITIONS[key];
            const isSelected = selectedStrategy === key;
            const isRecommended = recommendedStrategy === key;

            return (
              <motion.button
                key={key}
                whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                onClick={() => onSelectStrategy(key)}
                disabled={disabled}
                className={`relative flex flex-col justify-between rounded-xl p-4 text-left transition-all ${
                  isSelected
                    ? "bg-white shadow-md ring-2 ring-[var(--color-accent)]"
                    : "bg-[var(--color-surface)] border border-[var(--color-surface-border)] opacity-85 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
                      {strat.badge}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-semibold text-[var(--color-accent-emerald)] bg-[var(--color-accent-emerald)]/10 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">
                    {strat.name}
                  </div>
                </div>
              </motion.button>
            );
          }
        )}
      </div>
    </div>
  );
}
