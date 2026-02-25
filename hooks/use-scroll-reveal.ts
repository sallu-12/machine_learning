"use client";

import { useEffect } from "react";

interface ScrollRevealOptions {
  selector?: string;
  rootMargin?: string;
  threshold?: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { selector = "[data-reveal]", rootMargin = "0px 0px -10% 0px", threshold = 0.2 } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin, threshold }
    );

    const observeElements = (root: ParentNode) => {
      const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
      elements.forEach((el) => observer.observe(el));
    };

    observeElements(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(selector)) {
            observer.observe(node);
          }
          observeElements(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [selector, rootMargin, threshold]);
}
