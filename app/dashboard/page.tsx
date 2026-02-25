"use client";

import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, Layers, GitBranch, ArrowRight, BookOpen, Zap, Target, Brain, Baseline as ChartLine, Lightbulb, Sigma, Hexagon, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { FlipCard } from "@/components/flip-card";

const algorithms = [
  {
    id: "regression",
    title: "Linear Regression",
    subtitle: "Supervised Learning",
    description:
      "Learn how gradient descent optimizes a line to fit your data by minimizing the mean squared error.",
    icon: TrendingUp,
    href: "/dashboard/regression",
    color: "chart-1",
    concepts: ["Gradient Descent", "Loss Function", "Learning Rate"],
    difficulty: "Beginner",
  },
  {
    id: "clustering",
    title: "K-Means Clustering",
    subtitle: "Unsupervised Learning",
    description:
      "Watch clusters form as centroids iteratively move to minimize within-cluster variance.",
    icon: Layers,
    href: "/dashboard/clustering",
    color: "chart-2",
    concepts: ["Centroids", "Cluster Assignment", "Convergence"],
    difficulty: "Beginner",
  },
  {
    id: "tree",
    title: "Decision Tree",
    subtitle: "Supervised Learning",
    description:
      "Visualize how trees split data based on feature thresholds to make classification decisions.",
    icon: GitBranch,
    href: "/dashboard/clustering#decision-tree",
    color: "chart-3",
    concepts: ["Information Gain", "Gini Impurity", "Tree Depth"],
    difficulty: "Intermediate",
  },
  {
    id: "pca",
    title: "PCA",
    subtitle: "Dimensionality Reduction",
    description:
      "Extract the most informative direction and compress high-dimensional data safely.",
    icon: Sigma,
    href: "/dashboard/pca",
    color: "chart-4",
    concepts: ["Eigenvectors", "Variance", "Projection"],
    difficulty: "Intermediate",
  },
  {
    id: "dbscan",
    title: "DBSCAN",
    subtitle: "Density-Based",
    description:
      "Detect clusters of any shape and label noisy outliers without choosing k.",
    icon: Hexagon,
    href: "/dashboard/dbscan",
    color: "chart-5",
    concepts: ["Epsilon", "MinPts", "Noise"],
    difficulty: "Advanced",
  },
  {
    id: "gmm",
    title: "Gaussian Mixture",
    subtitle: "Probabilistic Models",
    description:
      "Soft-assign points to overlapping clusters using the EM algorithm.",
    icon: Orbit,
    href: "/dashboard/gmm",
    color: "chart-2",
    concepts: ["EM", "Likelihood", "Soft Clusters"],
    difficulty: "Advanced",
  },
];

const learningGoals = [
  {
    icon: Brain,
    title: "Understand the Process",
    description: "See algorithms evolve step-by-step, not just final results",
  },
  {
    icon: Zap,
    title: "Interactive Experimentation",
    description: "Adjust parameters and instantly see how results change",
  },
  {
    icon: Target,
    title: "Build Intuition",
    description: "Develop deep understanding through visual feedback",
  },
  {
    icon: Lightbulb,
    title: "Learn by Doing",
    description: "Experiment with different datasets and configurations",
  },
];

export default function ExplorerDashboard() {
  useScrollReveal();

  return (
    <div className="min-h-screen">
      <TopBar
        title="Algorithm Explorer"
        subtitle="Select an algorithm to start learning"
      />

      <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-8">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 sm:p-6 md:p-8 scroll-reveal animate-glow-pulse"
          data-reveal
          style={{
            background: 'linear-gradient(135deg, oklch(0.78 0.25 150 / 0.15), oklch(0.72 0.22 200 / 0.12), oklch(0.84 0.26 90 / 0.1))',
            animation: 'gradient-wave 8s ease infinite, glow-pulse 5s ease-in-out infinite'
          }}
        >
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">
                Interactive Learning Platform
              </span>
            </div>
            <h2 className="mb-3 text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Master Machine Learning
              <br />
              <span className="gradient-text">Through Visualization</span>
            </h2>
            <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">
              Stop memorizing formulas. Start understanding how machine learning
              algorithms actually work by watching them learn in real-time.
            </p>
          </div>
          {/* Decorative Elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animation: 'floatY 6s ease-in-out infinite, color-shift 8s ease-in-out infinite' }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animation: 'floatY 8s ease-in-out infinite reverse, color-shift 10s ease-in-out infinite' }} />
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 scroll-reveal" data-reveal>
          <StatsCard
            label="Algorithms"
            value={6}
            icon={<ChartLine className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Interactive Controls"
            value={12}
            icon={<Zap className="h-5 w-5" />}
            color="accent"
          />
          <StatsCard
            label="Datasets"
            value={4}
            icon={<Layers className="h-5 w-5" />}
            color="default"
          />
          <StatsCard
            label="Concepts Covered"
            value={15}
            icon={<Brain className="h-5 w-5" />}
            color="default"
          />
        </section>

        {/* Learning Goals */}
        <section className="scroll-reveal" data-reveal>
          <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-foreground">
            Learning Goals
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learningGoals.map((goal) => (
              <div
                key={goal.title}
                className="rounded-xl border border-border bg-card p-3 sm:p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:scale-105"
                style={{
                  animation: 'glow-pulse 6s ease-in-out infinite',
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                <div className="mb-2 sm:mb-3 flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg bg-primary/10 animate-pulse"
                  style={{ animation: 'color-shift 5s ease-in-out infinite' }}
                >
                  <goal.icon className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                </div>
                <h4 className="mb-1 text-sm sm:text-base font-medium text-foreground">{goal.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Algorithm Cards */}
        <section className="scroll-reveal" data-reveal>
          <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-foreground">
            Choose an Algorithm
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {algorithms.map((algo) => (
              <AlgorithmCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 scroll-reveal" data-reveal>
          <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-foreground">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <Step
              number={1}
              title="Select Algorithm"
              description="Choose from Linear Regression, K-Means, or Decision Trees"
            />
            <Step
              number={2}
              title="Adjust Parameters"
              description="Use sliders to control learning rate, iterations, and more"
            />
            <Step
              number={3}
              title="Watch & Learn"
              description="See the algorithm evolve and read dynamic explanations"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function AlgorithmCard({
  algorithm,
}: {
  algorithm: (typeof algorithms)[0];
}) {
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    "chart-1": {
      bg: "bg-chart-1/10",
      border: "border-chart-1/30 hover:border-chart-1/50",
      text: "text-chart-1",
    },
    "chart-2": {
      bg: "bg-chart-2/10",
      border: "border-chart-2/30 hover:border-chart-2/50",
      text: "text-chart-2",
    },
    "chart-3": {
      bg: "bg-chart-3/10",
      border: "border-chart-3/30 hover:border-chart-3/50",
      text: "text-chart-3",
    },
    "chart-4": {
      bg: "bg-chart-4/10",
      border: "border-chart-4/30 hover:border-chart-4/50",
      text: "text-chart-4",
    },
    "chart-5": {
      bg: "bg-chart-5/10",
      border: "border-chart-5/30 hover:border-chart-5/50",
      text: "text-chart-5",
    },
  };

  const colors = colorClasses[algorithm.color];

  return (
    <Link href={algorithm.href} className="block">
      <FlipCard
        className="algo-card-size"
        front={
          <div
            className={cn(
              "algo-card group relative h-full overflow-hidden rounded-2xl border p-3 sm:p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
              colors.border,
              "bg-card"
            )}
          >
            <div
              className={cn(
                "mb-3 sm:mb-4 flex h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                colors.bg
              )}
            >
              <algorithm.icon className={cn("h-5 sm:h-5.5 md:h-6 w-5 sm:w-5.5 md:w-6", colors.text)} />
            </div>
            <div className="mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {algorithm.subtitle}
              </span>
              <h4 className="mt-1 text-base sm:text-lg md:text-xl font-semibold text-foreground">
                {algorithm.title}
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                {algorithm.description}
              </p>
            </div>
            <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
              {algorithm.concepts.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full bg-secondary px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs text-muted-foreground"
                >
                  {concept}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-medium",
                  algorithm.difficulty === "Beginner"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                )}
              >
                {algorithm.difficulty}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-0.5 sm:gap-1 transition-all text-xs sm:text-sm group-hover:gap-1.5 sm:group-hover:gap-2", colors.text)}
              >
                <span className="hidden sm:inline">Start Learning</span>
                <span className="sm:hidden">Learn</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
                colors.bg
              )}
            />
            <div className="algo-card-sheen" />
          </div>
        }
        back={
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-background/80 p-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">What you will learn</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {algorithm.concepts.map((concept) => (
                  <li key={concept}>- {concept}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Flip to preview details</span>
              <Button size="sm" className="bg-primary text-primary-foreground">
                Open Lab
              </Button>
            </div>
          </div>
        }
      />
    </Link>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-2 sm:gap-4">
      <div className="flex h-7 sm:h-8 w-7 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs sm:text-sm font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-medium text-foreground">{title}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
