"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = ["sunset", "mint", "hyper"] as const;

export function ThemeCycle() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("ui-theme");
    const initialIndex = stored ? themes.indexOf(stored as (typeof themes)[number]) : 0;
    const nextIndex = initialIndex >= 0 ? initialIndex : 0;
    setIndex(nextIndex);
    
    // Only set if not already set by the script
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.dataset.theme = themes[nextIndex];
    }
    
    window.dispatchEvent(new Event("theme-change"));
  }, []);

  const cycle = () => {
    const nextIndex = (index + 1) % themes.length;
    setIndex(nextIndex);
    document.documentElement.dataset.theme = themes[nextIndex];
    localStorage.setItem("ui-theme", themes[nextIndex]);
    window.dispatchEvent(new Event("theme-change"));
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full border border-border bg-card/80 shadow-lg backdrop-blur" />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={cycle}
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full border-border bg-card/80 shadow-lg backdrop-blur hover:shadow-xl"
    >
      <Palette className="h-5 w-5 text-primary" />
      <span className="sr-only">Cycle theme</span>
    </Button>
  );
}
