"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ShieldCheck, Orbit } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { createAccount } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useScrollReveal();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Create account using localStorage
      const result = createAccount(name, email, password);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Don't auto sign in - redirect to login page
      setSuccessMessage(result.message + " Please sign in to continue.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 sm:px-6 py-4 sm:py-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[560px] w-[560px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/4 h-[260px] w-[260px] rounded-full bg-chart-3/10 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-6 sm:mb-8 text-center scroll-reveal" data-reveal>
          <div className="mx-auto mb-3 sm:mb-4 flex h-11 sm:h-12 w-11 sm:w-12 items-center justify-center rounded-xl bg-primary animate-float">
            <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Create your ML Simulator account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Sign up once, then log in to explore the full experience.
          </p>
        </div>

        <div className="glass-card mt-5 rounded-2xl p-5 sm:p-6 md:p-8 scroll-reveal" data-reveal>
          <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 sm:h-11 border-border text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground transition hover:border-primary/60 hover:shadow-[0_0_18px_rgba(var(--primary-rgb)_/_0.2)] focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 sm:h-11 border-border text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground transition hover:border-primary/60 hover:shadow-[0_0_18px_rgba(var(--primary-rgb)_/_0.2)] focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 sm:h-11 border-border text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground transition hover:border-primary/60 hover:shadow-[0_0_18px_rgba(var(--primary-rgb)_/_0.2)] focus:border-primary focus:ring-primary"
              />
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-primary">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 sm:h-11 w-full text-xs sm:text-sm bg-primary text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(var(--primary-rgb)_/_0.35)]"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-primary hover:underline"
            >
              Already have an account? Login
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>JWT secured</span>
              <Orbit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-2" />
              <span>Fast onboarding</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-auto w-full pb-6">
        <SiteFooter />
      </div>
    </div>
  );
}
