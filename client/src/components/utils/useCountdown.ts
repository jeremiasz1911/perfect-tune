// src/components/utils/useCountdown.ts
import { useEffect, useMemo, useRef, useState } from "react";

export function useCountdown(target: Date | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  const targetMsRef = useRef<number | null>(target ? target.getTime() : null);

  useEffect(() => {
    targetMsRef.current = target ? target.getTime() : null;
  }, [target]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = useMemo(() => {
    const t = targetMsRef.current;
    if (!t) return 0;
    return Math.max(0, t - now);
  }, [now]);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return { d, h, m, s, done: diff === 0 };
}
