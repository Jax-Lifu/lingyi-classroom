import { useEffect, useState } from "react";

function readReducedMotion() {
  if (typeof document !== "undefined" && document.documentElement.dataset.reduceMotion === "true") {
    return true;
  }
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(readReducedMotion);

  useEffect(() => {
    const sync = () => setReduced(readReducedMotion());
    const mq =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    mq?.addEventListener?.("change", sync);
    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(sync)
        : null;
    if (observer && typeof document !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-reduce-motion"],
      });
    }
    sync();
    return () => {
      mq?.removeEventListener?.("change", sync);
      observer?.disconnect();
    };
  }, []);

  return reduced;
}
