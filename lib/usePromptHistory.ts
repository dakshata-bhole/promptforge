import { useState, useEffect } from "react";
import { PromptHistoryItem } from "@/lib/types";

const STORAGE_KEY = "promptforge_history_v1";

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load prompt history from localStorage", e);
    }
  }, []);

  const savePromptToHistory = (item: Omit<PromptHistoryItem, "id" | "timestamp">) => {
    const newItem: PromptHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((p) => p.finalPromptText !== item.finalPromptText)].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save prompt to localStorage", e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return { history, savePromptToHistory, clearHistory };
}
