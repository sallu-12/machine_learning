"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, LogOut, Moon, Sun } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { clearAuthToken, getUserProfile } from "@/lib/auth-client";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showDatasetSelector?: boolean;
  dataset?: string;
  onDatasetChange?: (value: string) => void;
}

export function TopBar({
  title,
  subtitle,
  showDatasetSelector = false,
  dataset,
  onDatasetChange,
}: TopBarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setProfile(getUserProfile());
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Listen for theme changes
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('theme-change', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "GU";

  const handleSignOut = () => {
    clearAuthToken();
    // Force a hard navigation to clear all state
    window.location.href = "/";
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
      setIsDark(true);
    } else {
      html.classList.remove('dark');
      setIsDark(false);
    }
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new Event('theme-change'));
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-2 border-b border-border bg-background/80 px-2 sm:px-3 md:px-6 py-2 sm:py-3 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:h-16">
      {/* Left Section - Menu + Title */}
      <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <MobileNav />
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Icons for Mobile */}
        <div className="flex shrink-0 sm:hidden items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 inline-flex transition active:scale-95 hover:bg-secondary/70"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 min-w-8 shrink-0 rounded-full border border-border/60 bg-primary text-primary-foreground shadow-sm transition active:scale-95 hover:bg-primary/90"
                aria-label="Profile"
              >
                <span className="text-[11px] font-semibold">{initials}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-sm font-semibold text-foreground">
                  {profile?.name || "Guest"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile?.email || "guest@devnotch.io"}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right Section - Dataset Selector + Icons (Desktop) */}
      <div className="flex w-full flex-wrap items-center gap-1.5 sm:gap-2 sm:w-auto sm:ml-auto sm:flex-nowrap sm:justify-end">
        {showDatasetSelector && onDatasetChange && (
          <Select value={dataset} onValueChange={onDatasetChange}>
            <SelectTrigger className="flex-1 bg-secondary border-border text-xs sm:text-sm sm:flex-none sm:w-40">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sparse">Sparse</SelectItem>
              <SelectItem value="dense">Dense</SelectItem>
              <SelectItem value="noisy">Noisy</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Icons for Desktop/Tablet */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 inline-flex transition active:scale-95 hover:bg-secondary/70"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-w-9 shrink-0 rounded-full border border-border/60 bg-primary text-primary-foreground shadow-sm transition active:scale-95 hover:bg-primary/90"
                aria-label="Profile"
              >
                <span className="text-xs font-semibold">{initials}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-sm font-semibold text-foreground">
                  {profile?.name || "Guest"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile?.email || "guest@devnotch.io"}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
