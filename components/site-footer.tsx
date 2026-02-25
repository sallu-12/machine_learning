import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Heart, Code, Zap } from "lucide-react";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("w-full", className)}>
      <div className="mx-auto w-full max-w-full px-2 sm:max-w-5xl sm:px-6">
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/60 via-card/40 to-card/60 px-2.5 py-2.5 sm:px-6 sm:py-5 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
          {/* Animated gradient background */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 animate-gradient" />
          
          {/* Shimmer effect on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
          </div>
          
          {/* Glowing orbs */}
          <div className="pointer-events-none absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-accent/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
          
          <div className="relative flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-4">
            {/* Animated icons - Left */}
            <div className="flex items-center gap-1 animate-float-gentle sm:gap-2">
              <div className="relative">
                <Code className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 h-2.5 w-2.5 sm:h-4 sm:w-4 animate-ping text-primary opacity-0 transition-opacity group-hover:opacity-30">
                  <Code className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <Zap className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-accent transition-all duration-300 delay-75 group-hover:-rotate-12 group-hover:scale-110" />
            </div>
            
            <div className="flex flex-col items-center gap-0.5 text-center sm:flex-row sm:gap-2.5">
              <span className="group/text relative flex items-center gap-1.5 text-[10px] sm:text-sm font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text text-transparent transition-all duration-700 group-hover:animate-gradient group-hover:from-primary group-hover:via-accent group-hover:to-primary">
                  Made and designed by Rehan Sheikh
                </span>
                {/* Underline animation */}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" />
              </span>
              
              <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 sm:px-3 sm:py-1 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/5">
                <Heart className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-red-500 text-red-500 animate-pulse transition-transform duration-300 group-hover:scale-125" />
                <span className="text-[9px] sm:text-xs font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                  Product Designer
                </span>
              </div>
            </div>
            
            {/* Animated icons - Right */}
            <div className="flex items-center gap-1 animate-float-gentle delay-150 sm:gap-2">
              <Sparkles className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-accent transition-all duration-300 delay-75 group-hover:rotate-45 group-hover:scale-110" />
              <div className="relative">
                <Sparkles className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:-rotate-45 group-hover:scale-110" />
                <div className="absolute inset-0 h-2.5 w-2.5 sm:h-4 sm:w-4 animate-ping text-primary opacity-0 transition-opacity delay-150 group-hover:opacity-30">
                  <Sparkles className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Corner decorative dots */}
          <div className="pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-primary/40 transition-all duration-500 group-hover:scale-150 group-hover:bg-primary" />
          <div className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent/40 transition-all duration-500 delay-75 group-hover:scale-150 group-hover:bg-accent" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-accent/40 transition-all duration-500 delay-150 group-hover:scale-150 group-hover:bg-accent" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-primary/40 transition-all duration-500 delay-200 group-hover:scale-150 group-hover:bg-primary" />
        </div>
      </div>
    </footer>
  );
}
