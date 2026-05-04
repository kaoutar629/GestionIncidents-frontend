import { useCallback, useRef, useState } from "react";
import { classifyIncident } from "../services/AiService";

export const useAIClassifier = () => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const triggerAI = useCallback((title, description) => {
    clearTimeout(timerRef.current);

    if (!title || title.trim().length < 8) {
      setSuggestion(null);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      const result = await classifyIncident(title, description);
      setSuggestion(result);
      setLoading(false);
    }, 1000);
  }, []);

  const resetAI = () => {
    clearTimeout(timerRef.current);
    setSuggestion(null);
    setLoading(false);
  };

  return { suggestion, loading, triggerAI, resetAI };
};
