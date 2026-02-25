"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { clearAuthToken } from "@/lib/auth-client";
import { navItems } from "@/components/navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-border bg-sidebar w-[80vw] sm:w-80 p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-3 sm:px-4 py-2.5 sm:py-3">
          <SheetTitle className="text-base sm:text-lg text-foreground">ML Simulator</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto px-2 py-2 sm:py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-colors",
                      isActive ? item.color : "group-hover:text-foreground"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-2 pt-2 sm:pt-3">
          <SheetClose asChild>
            <button
              onClick={() => {
                clearAuthToken();
                window.location.href = "/";
              }}
              className="flex w-full items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="text-xs sm:text-sm">Sign Out</span>
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
