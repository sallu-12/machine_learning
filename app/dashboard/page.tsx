"use client";

import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, Layers, GitBranch, ArrowRight, BookOpen, Zap, Target, Brain, Baseline as ChartLine, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="min-h-screen">
      <TopBar
        title="Algorithm Explorer"
        subtitle="Select an algorithm to start learning"
      />

      <div className="p-6 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Interactive Learning Platform
              </span>
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Master Machine Learning
              <br />
              <span className="gradient-text">Through Visualization</span>
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Stop memorizing formulas. Start understanding how machine learning
              algorithms actually work by watching them learn in real-time.
            </p>
          </div>
          {/* Decorative Elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Algorithms"
            value={3}
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
            value={9}
            icon={<Brain className="h-5 w-5" />}
            color="default"
          />
        </section>

        {/* Learning Goals */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Learning Goals
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learningGoals.map((goal) => (
              <div
                key={goal.title}
                className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <goal.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mb-1 font-medium text-foreground">{goal.title}</h4>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Algorithm Cards */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Choose an Algorithm
          </h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {algorithms.map((algo) => (
              <AlgorithmCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
  };

  const colors = colorClasses[algorithm.color];

  return (
    <Link href={algorithm.href}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-xl",
          colors.border,
          "bg-card"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            colors.bg
          )}
        >
          <algorithm.icon className={cn("h-6 w-6", colors.text)} />
        </div>

        {/* Content */}
        <div className="mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {algorithm.subtitle}
          </span>
          <h4 className="mt-1 text-xl font-semibold text-foreground">
            {algorithm.title}
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {algorithm.description}
          </p>
        </div>

        {/* Concepts */}
        <div className="mb-4 flex flex-wrap gap-2">
          {algorithm.concepts.map((concept) => (
            <span
              key={concept}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
            >
              {concept}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
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
            className={cn("gap-1 transition-all group-hover:gap-2", colors.text)}
          >
            Start Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Hover Glow */}
        <div
          className={cn(
            "pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
            colors.bg
          )}
        />
      </div>
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
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
