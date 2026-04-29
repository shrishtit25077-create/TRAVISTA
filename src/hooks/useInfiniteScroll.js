import { useRef, useCallback } from "react";

export default function useInfiniteScroll(callback, hasMore) {
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (!hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      }, {
        rootMargin: "300px", // Preload earlier for a "limitless" feel
      });

      if (node) observer.current.observe(node);
    },
    [callback, hasMore]
  );

  return lastElementRef;
}
