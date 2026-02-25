"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/top-bar";
import { ControlPanel } from "@/components/control-panel";
import { ExplanationPanel } from "@/components/explanation-panel";
import { StatsCard } from "@/components/stats-card";

// Lazy load charts for better performance
const ClusteringChart = dynamic(
  () => import("@/components/visualizations/clustering-chart").then(mod => ({ default: mod.ClusteringChart })),
  { ssr: false, loading: () => <div className="h-96 bg-card rounded-xl animate-pulse" /> }
);
const DecisionTreeChart = dynamic(
  () => import("@/components/visualizations/decision-tree-chart").then(mod => ({ default: mod.DecisionTreeChart })),
  { ssr: false, loading: () => <div className="h-80 bg-card rounded-xl animate-pulse" /> }
);
import {
  generateClusterData,
  generateClassificationData,
  initializeCentroids,
  kMeansStep,
  buildTreeStep,
  type Point,
  type ClusteringState,
  type TreeNode,
  type TreeDataPoint,
} from "@/lib/ml-algorithms";
import { Layers, Hash, CheckCircle, GitBranch, TreeDeciduous } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function ClusteringPage() {
  useScrollReveal();

  // Track active tab
  const [activeTab, setActiveTab] = useState("kmeans");

  // K-Means State
  const [points, setPoints] = useState<Point[]>([]);
  const [clusterState, setClusterState] = useState<ClusteringState>({
    centroids: [],
    assignments: [],
    iteration: 0,
    converged: false,
    history: [],
  });
  const [kValue, setKValue] = useState(3);
  const [isPlayingKMeans, setIsPlayingKMeans] = useState(false);

  // Decision Tree State
  const [treeData, setTreeData] = useState<TreeDataPoint[]>([]);
  const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);
  const [maxDepth, setMaxDepth] = useState(3);
  const [isPlayingTree, setIsPlayingTree] = useState(false);
  const [treeIteration, setTreeIteration] = useState(0);

  const [dataset, setDataset] = useState("default");
  const kmeansFrameRef = useRef<number | null>(null);
  const treeFrameRef = useRef<number | null>(null);
  const kmeansLastStepRef = useRef<number>(0);
  const treeLastStepRef = useRef<number>(0);

  // Initialize K-Means data
  useEffect(() => {
    generateNewClusterData();
  }, [dataset]);

  // Initialize Decision Tree data
  useEffect(() => {
    setTreeData(generateClassificationData(50));
  }, []);

  const generateNewClusterData = () => {
    let count = 45;
    switch (dataset) {
      case "sparse":
        count = 25;
        break;
      case "dense":
        count = 80;
        break;
      case "noisy":
        count = 60;
        break;
    }
    const newPoints = generateClusterData(count, kValue);
    setPoints(newPoints);
    resetKMeans(newPoints);
  };

  const resetKMeans = (currentPoints?: Point[]) => {
    const pts = currentPoints || points;
    const centroids = initializeCentroids(pts, kValue);
    setClusterState({
      centroids,
      assignments: pts.map(() => 0),
      iteration: 0,
      converged: false,
      history: [],
    });
    setIsPlayingKMeans(false);
  };

  const stepKMeans = useCallback(() => {
    if (clusterState.converged) {
      setIsPlayingKMeans(false);
      return;
    }
    setClusterState((prev) => kMeansStep(points, prev, kValue));
  }, [points, kValue, clusterState.converged]);

  // Pause animations when switching tabs (performance optimization)
  useEffect(() => {
    if (activeTab !== "kmeans" && isPlayingKMeans) {
      setIsPlayingKMeans(false);
    }
  }, [activeTab, isPlayingKMeans]);

  useEffect(() => {
    if (activeTab !== "tree" && isPlayingTree) {
      setIsPlayingTree(false);
    }
  }, [activeTab, isPlayingTree]);

  // K-Means animation loop
  useEffect(() => {
    if (isPlayingKMeans && !clusterState.converged && activeTab === "kmeans") {
      kmeansLastStepRef.current = Date.now();
      const animate = () => {
        const now = Date.now();
        if (now - kmeansLastStepRef.current >= 800) {
          stepKMeans();
          kmeansLastStepRef.current = now;
        }
        kmeansFrameRef.current = requestAnimationFrame(animate);
      };
      kmeansFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (kmeansFrameRef.current) {
        cancelAnimationFrame(kmeansFrameRef.current);
        kmeansFrameRef.current = null;
      }
    }
    return () => {
      if (kmeansFrameRef.current) {
        cancelAnimationFrame(kmeansFrameRef.current);
      }
    };
  }, [isPlayingKMeans, stepKMeans, clusterState.converged, activeTab]);

  // Reset K-Means when k changes
  useEffect(() => {
    generateNewClusterData();
  }, [kValue]);

  // Decision Tree functions
  const resetTree = useCallback(() => {
    if (treeFrameRef.current) {
      cancelAnimationFrame(treeFrameRef.current);
      treeFrameRef.current = null;
    }
    setTreeRoot(null);
    setTreeIteration(0);
    setIsPlayingTree(false);
  }, []);

  const stepTree = useCallback(() => {
    setTreeIteration((prev) => {
      if (prev >= maxDepth) return prev;
      const nextDepth = prev + 1;
      const features = ["age", "income"];
      const tree = buildTreeStep(treeData, features, 0, nextDepth);
      setTreeRoot(tree);
      return nextDepth;
    });
  }, [treeData, maxDepth]);

  // Stop playing when tree is fully built
  useEffect(() => {
    if (treeIteration >= maxDepth && isPlayingTree) {
      setIsPlayingTree(false);
    }
  }, [treeIteration, maxDepth, isPlayingTree]);

  // Tree animation
  useEffect(() => {
    if (isPlayingTree && activeTab === "tree" && treeIteration < maxDepth) {
      treeLastStepRef.current = Date.now();
      const animate = () => {
        const now = Date.now();
        if (now - treeLastStepRef.current >= 1000) {
          stepTree();
          treeLastStepRef.current = now;
        }
        treeFrameRef.current = requestAnimationFrame(animate);
      };
      treeFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (treeFrameRef.current) {
        cancelAnimationFrame(treeFrameRef.current);
      }
    };
  }, [isPlayingTree, stepTree, treeIteration, maxDepth, activeTab]);

  // K-Means explanation
  const getKMeansExplanation = () => {
    if (clusterState.iteration === 0) {
      return {
        whatChanged: `Initialized ${kValue} centroids using K-Means++ algorithm.`,
        whyItChanged:
          "K-Means++ places initial centroids far apart to ensure better convergence.",
        conceptualMeaning:
          "Good initialization leads to faster convergence and avoids poor local minima.",
      };
    }

    if (clusterState.converged) {
      return {
        whatChanged: `Algorithm converged after ${clusterState.iteration} iterations.`,
        whyItChanged:
          "Centroids stopped moving because cluster assignments are stable.",
        conceptualMeaning:
          "The algorithm found a local optimum where each point is assigned to its nearest centroid.",
      };
    }

    return {
      whatChanged: `Iteration ${clusterState.iteration}: Reassigned points and updated centroid positions.`,
      whyItChanged:
        "Each point was assigned to its nearest centroid, then centroids moved to the center of their clusters.",
      conceptualMeaning:
        "This two-step process (assign, update) minimizes within-cluster variance iteratively.",
    };
  };

  // Tree explanation
  const getTreeExplanation = () => {
    if (!treeRoot) {
      return {
        whatChanged: "Tree not yet built. Press Play to start.",
        whyItChanged: "Decision trees are built by recursively splitting data.",
        conceptualMeaning:
          "Each split tries to separate classes as cleanly as possible.",
      };
    }

    if (treeIteration >= maxDepth) {
      return {
        whatChanged: `Tree built to maximum depth of ${maxDepth}.`,
        whyItChanged: "Depth limit prevents overfitting to training data.",
        conceptualMeaning:
          "A deeper tree memorizes data; a shallower tree generalizes better.",
      };
    }

    return {
      whatChanged: `Building tree at depth ${treeIteration}. Finding best splits.`,
      whyItChanged:
        "At each node, we find the feature and threshold that best separates the classes.",
      conceptualMeaning:
        "Gini impurity measures how mixed the classes are; lower is better.",
    };
  };

  const kmeansExplanation = getKMeansExplanation();
  const treeExplanation = getTreeExplanation();

  // Count points per cluster
  const clusterCounts = Array(kValue).fill(0);
  clusterState.assignments.forEach((a) => {
    if (a < kValue) clusterCounts[a]++;
  });

  return (
    <div className="min-h-screen">
      <TopBar
        title="Clustering & Trees Lab"
        subtitle="K-Means clustering and Decision Tree visualization"
        showDatasetSelector
        dataset={dataset}
        onDatasetChange={setDataset}
      />

      <div className="p-2 sm:p-3 md:p-6 space-y-2 sm:space-y-3 md:space-y-6">
        <Tabs defaultValue="kmeans" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2 sm:mb-3 md:mb-6 bg-secondary grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="kmeans" className="gap-2 text-xs sm:text-sm">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              K-Means Clustering
            </TabsTrigger>
            <TabsTrigger value="tree" className="gap-2 text-xs sm:text-sm">
              <TreeDeciduous className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Decision Tree
            </TabsTrigger>
          </TabsList>

          {/* K-Means Tab */}
          <TabsContent value="kmeans" className="space-y-2 sm:space-y-3 md:space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
              <StatsCard
                label="Iteration"
                value={clusterState.iteration}
                icon={<Hash className="h-5 w-5" />}
                color="primary"
              />
              <StatsCard
                label="Clusters (k)"
                value={kValue}
                icon={<Layers className="h-5 w-5" />}
                color="accent"
              />
              <StatsCard
                label="Data Points"
                value={points.length}
                icon={<GitBranch className="h-5 w-5" />}
                color="default"
              />
              <StatsCard
                label="Converged"
                value={clusterState.converged ? "Yes" : "No"}
                icon={<CheckCircle className="h-5 w-5" />}
                color={clusterState.converged ? "success" : "default"}
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-6 xl:grid-cols-3 scroll-reveal" data-reveal>
              <div className="xl:col-span-2 space-y-2 sm:space-y-3 md:space-y-6 w-full overflow-x-hidden">
                <div className="w-full max-w-full overflow-hidden">
                  <ClusteringChart
                    points={points}
                    state={clusterState}
                    width={600}
                    height={350}
                  />
                </div>

                {/* Cluster breakdown */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
                  {clusterCounts.map((count, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card p-2 sm:p-3 text-center"
                    >
                      <div
                        className="mx-auto mb-2 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            idx === 0
                              ? "oklch(0.65 0.2 265)"
                              : idx === 1
                                ? "oklch(0.55 0.18 170)"
                                : "oklch(0.7 0.18 80)",
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cluster {idx + 1}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {count} points
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 md:space-y-6">
                <ControlPanel
                  isPlaying={isPlayingKMeans}
                  onPlay={() => setIsPlayingKMeans(true)}
                  onPause={() => setIsPlayingKMeans(false)}
                  onStep={stepKMeans}
                  onReset={() => resetKMeans()}
                  disabled={clusterState.converged}
                  sliders={[
                    {
                      label: "Number of Clusters (k)",
                      value: kValue,
                      min: 2,
                      max: 5,
                      step: 1,
                      onChange: setKValue,
                    },
                  ]}
                />

                <ExplanationPanel
                  title="What's Happening?"
                  whatChanged={kmeansExplanation.whatChanged}
                  whyItChanged={kmeansExplanation.whyItChanged}
                  conceptualMeaning={kmeansExplanation.conceptualMeaning}
                  algorithmColor="clustering"
                />
              </div>
            </div>

            {/* Algorithm explanation */}
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5 scroll-reveal" data-reveal>
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
                How K-Means Clustering Works
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-1">1. Initialize</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Place k centroids using K-Means++ for better starting positions.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-2">2. Assign</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Assign each point to its nearest centroid based on Euclidean distance.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-3">3. Update</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Move each centroid to the mean position of its assigned points.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Decision Tree Tab */}
          <TabsContent value="tree" className="space-y-2 sm:space-y-3 md:space-y-6" id="decision-tree">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
              <StatsCard
                label="Current Depth"
                value={treeIteration}
                unit={`/ ${maxDepth}`}
                icon={<Hash className="h-5 w-5" />}
                color="primary"
              />
              <StatsCard
                label="Max Depth"
                value={maxDepth}
                icon={<TreeDeciduous className="h-5 w-5" />}
                color="accent"
              />
              <StatsCard
                label="Training Samples"
                value={treeData.length}
                icon={<GitBranch className="h-5 w-5" />}
                color="default"
              />
              <StatsCard
                label="Features"
                value={2}
                unit="(Age, Income)"
                icon={<Layers className="h-5 w-5" />}
                color="default"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3 scroll-reveal" data-reveal>
              <div className="xl:col-span-2 space-y-2 sm:space-y-3 md:space-y-6">
                <div className="w-full max-w-full overflow-hidden">
                  <DecisionTreeChart root={treeRoot} width={650} height={300} />
                </div>

                {/* Feature importance */}
                <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <h4 className="mb-2 sm:mb-3 text-sm font-medium text-foreground">
                    Classification Task
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Predicting risk level based on <strong>Age</strong> and{" "}
                    <strong>Income</strong>. The model outputs
                    {" Low Risk"}, {" Medium Risk"}, or {" High Risk"}
                    based on these thresholds.
                  </p>
                  <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground">
                    Labels: <strong>H</strong> = High Risk, <strong>M</strong> = Medium Risk,
                    <strong> L</strong> = Low Risk.
                  </p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 md:space-y-6">
                <ControlPanel
                  isPlaying={isPlayingTree}
                  onPlay={() => setIsPlayingTree(true)}
                  onPause={() => setIsPlayingTree(false)}
                  onStep={stepTree}
                  onReset={resetTree}
                  disabled={treeIteration >= maxDepth}
                  sliders={[
                    {
                      label: "Max Tree Depth",
                      value: maxDepth,
                      min: 1,
                      max: 5,
                      step: 1,
                      onChange: (v) => {
                        setMaxDepth(v);
                        resetTree();
                      },
                    },
                  ]}
                />

                <ExplanationPanel
                  title="What's Happening?"
                  whatChanged={treeExplanation.whatChanged}
                  whyItChanged={treeExplanation.whyItChanged}
                  conceptualMeaning={treeExplanation.conceptualMeaning}
                  algorithmColor="tree"
                />
              </div>
            </div>

            {/* Algorithm explanation */}
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5 scroll-reveal" data-reveal>
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
                How Decision Trees Work
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-1">1. Find Best Split</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    For each feature, find the threshold that best separates classes
                    using Gini impurity.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-2">2. Split Data</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Divide data into left (less than threshold) and right (greater
                    than) branches.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-chart-3">3. Recurse or Stop</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Repeat for each branch until max depth or pure nodes (single
                    class) are reached.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
