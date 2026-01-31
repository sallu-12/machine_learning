"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, TrendingUp, Layers, GitBranch } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background Gradient Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                           linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl items-center gap-20 px-8">
        {/* Left Side - Branding */}
        <div className="hidden flex-1 lg:block">
          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary animate-pulse-glow">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
              ML Algorithm
              <br />
              <span className="gradient-text">Simulator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Understand machine learning through interactive visualization
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3">
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Linear Regression"
              description="Watch gradient descent minimize loss in real-time"
              color="chart-1"
            />
            <FeatureCard
              icon={<Layers className="h-5 w-5" />}
              title="K-Means Clustering"
              description="See clusters form and centroids converge"
              color="chart-2"
            />
            <FeatureCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Decision Trees"
              description="Visualize data splits and tree growth"
              color="chart-3"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">ML Simulator</h2>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-xl font-semibold text-foreground">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to continue learning
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              disabled={isLoading}
              className="h-11 w-full border-border bg-secondary/50 text-foreground hover:bg-secondary"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  Try Demo Access
                </>
              )}
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    "chart-1": "bg-chart-1/10 text-chart-1 border-chart-1/20",
    "chart-2": "bg-chart-2/10 text-chart-2 border-chart-2/20",
    "chart-3": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02]",
        colorClasses[color]
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/50">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
