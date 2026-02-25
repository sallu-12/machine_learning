"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database, Download, RefreshCw, BarChartBig as ChartBar, Clock, TrendingUp, Layers, GitBranch, Eye, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  generateLinearData,
  generateClusterData,
  generateClassificationData,
  type Point,
  type TreeDataPoint,
} from "@/lib/ml-algorithms";

interface ExperimentHistory {
  id: string;
  algorithm: string;
  dataset: string;
  iterations: number;
  finalMetric: number;
  timestamp: Date;
}

interface DatasetConfig {
  id: string;
  name: string;
  description: string;
  type: "regression" | "clustering" | "classification";
  samples: number;
  features: number;
  icon: typeof Database;
  color: string;
}

const datasets: DatasetConfig[] = [
  {
    id: "linear-default",
    name: "Linear Default",
    description: "Standard linear relationship with moderate noise",
    type: "regression",
    samples: 30,
    features: 1,
    icon: TrendingUp,
    color: "chart-1",
  },
  {
    id: "linear-sparse",
    name: "Linear Sparse",
    description: "Fewer data points with higher variance",
    type: "regression",
    samples: 15,
    features: 1,
    icon: TrendingUp,
    color: "chart-1",
  },
  {
    id: "linear-dense",
    name: "Linear Dense",
    description: "Many data points with lower noise",
    type: "regression",
    samples: 50,
    features: 1,
    icon: TrendingUp,
    color: "chart-1",
  },
  {
    id: "cluster-3",
    name: "3 Clusters",
    description: "Well-separated cluster formation",
    type: "clustering",
    samples: 45,
    features: 2,
    icon: Layers,
    color: "chart-2",
  },
  {
    id: "cluster-5",
    name: "5 Clusters",
    description: "More complex clustering scenario",
    type: "clustering",
    samples: 75,
    features: 2,
    icon: Layers,
    color: "chart-2",
  },
  {
    id: "classification",
    name: "Risk Classification",
    description: "Binary classification based on age and income",
    type: "classification",
    samples: 50,
    features: 2,
    icon: GitBranch,
    color: "chart-3",
  },
];

export default function DatasetsPage() {
  useScrollReveal();

  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Point[] | TreeDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [experimentHistory, setExperimentHistory] = useState<ExperimentHistory[]>([]);

  // Simulate loading experiment history
  useEffect(() => {
    const mockHistory: ExperimentHistory[] = [
      {
        id: "1",
        algorithm: "Linear Regression",
        dataset: "linear-default",
        iterations: 100,
        finalMetric: 45.23,
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        algorithm: "K-Means",
        dataset: "cluster-3",
        iterations: 8,
        finalMetric: 0,
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: "3",
        algorithm: "Decision Tree",
        dataset: "classification",
        iterations: 3,
        finalMetric: 0.15,
        timestamp: new Date(Date.now() - 10800000),
      },
    ];
    
    // Simulate async loading
    setTimeout(() => {
      setExperimentHistory(mockHistory);
    }, 500);
  }, []);

  const handleDatasetSelect = async (datasetId: string) => {
    setIsLoading(true);
    setSelectedDataset(datasetId);

    // Simulate async data loading
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      let data: Point[] | TreeDataPoint[];
      
      switch (dataset.type) {
        case "regression":
          data = generateLinearData(dataset.samples, dataset.id.includes("sparse") ? 20 : 15);
          break;
        case "clustering":
          data = generateClusterData(dataset.samples, dataset.id.includes("5") ? 5 : 3);
          break;
        case "classification":
          data = generateClassificationData(dataset.samples);
          break;
        default:
          data = [];
      }
      
      setPreviewData(data);
    }

    setIsLoading(false);
  };

  const handleRegenerateAll = () => {
    // Clear current selection and regenerate
    setPreviewData([]);
    
    // If a dataset is currently selected, regenerate its data
    if (selectedDataset) {
      handleDatasetSelect(selectedDataset);
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      "chart-1": {
        bg: "bg-chart-1/10",
        border: "border-chart-1/30",
        text: "text-chart-1",
      },
      "chart-2": {
        bg: "bg-chart-2/10",
        border: "border-chart-2/30",
        text: "text-chart-2",
      },
      "chart-3": {
        bg: "bg-chart-3/10",
        border: "border-chart-3/30",
        text: "text-chart-3",
      },
    };
    return colors[color] || colors["chart-1"];
  };

  return (
    <div className="min-h-screen">
      <TopBar
        title="Datasets & Learning Insights"
        subtitle="Manage datasets and view experiment history"
      />

      <div className="p-2 sm:p-3 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
          <StatsCard
            label="Available Datasets"
            value={datasets.length}
            icon={<Database className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Total Experiments"
            value={experimentHistory.length}
            icon={<ChartBar className="h-5 w-5" />}
            color="accent"
          />
          <StatsCard
            label="Algorithms Used"
            value={3}
            icon={<TrendingUp className="h-5 w-5" />}
            color="default"
          />
          <StatsCard
            label="Session Duration"
            value="Active"
            icon={<Clock className="h-5 w-5" />}
            color="success"
          />
        </div>

        {/* Dataset Grid */}
        <section className="scroll-reveal" data-reveal>
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Available Datasets
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent"
              onClick={handleRegenerateAll}
              disabled={!selectedDataset}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {datasets.map((dataset) => {
              const colors = getColorClasses(dataset.color);
              const isSelected = selectedDataset === dataset.id;

              return (
                <div
                  key={dataset.id}
                  onClick={() => handleDatasetSelect(dataset.id)}
                  className={cn(
                    "fancy-card group relative cursor-pointer rounded-xl border p-5 transition-all duration-200",
                    isSelected
                      ? `${colors.border} ${colors.bg}`
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        colors.bg
                      )}
                    >
                      <dataset.icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <h4 className="mb-1 font-semibold text-foreground">
                    {dataset.name}
                  </h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {dataset.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {dataset.samples} samples
                    </span>
                    <span className="flex items-center gap-1">
                      <ChartBar className="h-3 w-3" />
                      {dataset.features} features
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        dataset.type === "regression" && "bg-chart-1/10 text-chart-1",
                        dataset.type === "clustering" && "bg-chart-2/10 text-chart-2",
                        dataset.type === "classification" && "bg-chart-3/10 text-chart-3"
                      )}
                    >
                      {dataset.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Preview */}
        {selectedDataset && (
          <section className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5 scroll-reveal" data-reveal>
            <div className="mb-4 flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Data Preview
              </h3>
            </div>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Index
                      </th>
                      {previewData.length > 0 && "x" in previewData[0] ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            X
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Y
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Age
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Income
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Label
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 transition-colors hover:bg-secondary/50"
                      >
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {idx + 1}
                        </td>
                        {"x" in item ? (
                          <>
                            <td className="px-4 py-3 font-mono text-foreground">
                              {(item as Point).x.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-mono text-foreground">
                              {(item as Point).y.toFixed(2)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-mono text-foreground">
                              {(item as TreeDataPoint).features.age.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 font-mono text-foreground">
                              ${(item as TreeDataPoint).features.income.toFixed(0)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-1 text-xs font-medium",
                                  (item as TreeDataPoint).label === "High Risk"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-green-500/10 text-green-500"
                                )}
                              >
                                {(item as TreeDataPoint).label}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Showing 10 of {previewData.length} samples
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Experiment History */}
        <section className="scroll-reveal" data-reveal>
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Recent Experiments
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
            {experimentHistory.map((experiment) => (
              <div
                key={experiment.id}
                className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {experiment.algorithm}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {datasets.find((d) => d.id === experiment.dataset)?.name ||
                        experiment.dataset}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(experiment.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Iterations: </span>
                    <span className="font-mono text-foreground">
                      {experiment.iterations}
                    </span>
                  </div>
                  {experiment.finalMetric > 0 && (
                    <div>
                      <span className="text-muted-foreground">Final Loss: </span>
                      <span className="font-mono text-foreground">
                        {experiment.finalMetric.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {experimentHistory.length === 0 && (
              <div className="col-span-3 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <h4 className="mb-1 font-medium text-foreground">
                  No experiments yet
                </h4>
                <p className="text-sm text-muted-foreground">
                  Run some algorithms to see your experiment history here
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Learning Tips */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 md:p-5 scroll-reveal" data-reveal>
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
            Learning Tips
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Start with Default Datasets
                </h4>
                <p className="text-sm text-muted-foreground">
                  Begin with clean, well-separated data to understand algorithm
                  behavior.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Experiment with Parameters
                </h4>
                <p className="text-sm text-muted-foreground">
                  Try extreme values to see how algorithms handle edge cases.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Compare Results
                </h4>
                <p className="text-sm text-muted-foreground">
                  Run the same algorithm on different datasets to build intuition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
