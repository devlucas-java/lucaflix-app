import { useCallback, useState } from "react";

export const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const triggerVisibility = useCallback(() => {
    if (!hasTriggered) {
      setIsVisible(true);
      setHasTriggered(true);
    }
  }, [hasTriggered]);

  return [triggerVisibility, isVisible] as const;
};