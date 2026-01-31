"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TopBar } from "@/components/top-bar";
import { ControlPanel } from "@/components/control-panel";
import { ExplanationPanel } from "@/components/explanation-panel";
import { StatsCard } from "@/components/stats-card";
import { ClusteringChart } from "@/components/visualizations/clustering-chart";
import { DecisionTreeChart } from "@/components/visualizations/decision-tree-chart";
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

export default function ClusteringPage() {
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
  const kmeansIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const treeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // K-Means animation loop
  useEffect(() => {
    if (isPlayingKMeans && !clusterState.converged) {
      kmeansIntervalRef.current = setInterval(stepKMeans, 800);
    } else {
      if (kmeansIntervalRef.current) {
        clearInterval(kmeansIntervalRef.current);
        kmeansIntervalRef.current = null;
      }
    }
    return () => {
      if (kmeansIntervalRef.current) {
        clearInterval(kmeansIntervalRef.current);
      }
    };
  }, [isPlayingKMeans, stepKMeans, clusterState.converged]);

  // Reset K-Means when k changes
  useEffect(() => {
    generateNewClusterData();
  }, [kValue]);

  // Decision Tree functions
  const resetTree = () => {
    setTreeRoot(null);
    setTreeIteration(0);
    setIsPlayingTree(false);
  };

  const buildTree = useCallback(() => {
    if (treeData.length === 0) return;

    const features = ["age", "income"];
    let currentDepth = 0;

    const animateBuild = () => {
      if (currentDepth <= maxDepth) {
        const tree = buildTreeStep(treeData, features, 0, currentDepth);
        setTreeRoot(tree);
        setTreeIteration(currentDepth);
        currentDepth++;
        treeTimeoutRef.current = setTimeout(animateBuild, 1000);
      } else {
        setIsPlayingTree(false);
      }
    };

    animateBuild();
  }, [treeData, maxDepth]);

  const stepTree = () => {
    if (treeIteration > maxDepth) return;
    const features = ["age", "income"];
    const tree = buildTreeStep(treeData, features, 0, treeIteration + 1);
    setTreeRoot(tree);
    setTreeIteration((prev) => prev + 1);
  };

  // Tree animation
  useEffect(() => {
    if (isPlayingTree) {
      buildTree();
    } else {
      if (treeTimeoutRef.current) {
        clearTimeout(treeTimeoutRef.current);
        treeTimeoutRef.current = null;
      }
    }
    return () => {
      if (treeTimeoutRef.current) {
        clearTimeout(treeTimeoutRef.current);
      }
    };
  }, [isPlayingTree, buildTree]);

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

      <div className="p-6 space-y-8">
        <Tabs defaultValue="kmeans" className="w-full">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="kmeans" className="gap-2">
              <Layers className="h-4 w-4" />
              K-Means Clustering
            </TabsTrigger>
            <TabsTrigger value="tree" className="gap-2">
              <TreeDeciduous className="h-4 w-4" />
              Decision Tree
            </TabsTrigger>
          </TabsList>

          {/* K-Means Tab */}
          <TabsContent value="kmeans" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ClusteringChart
                  points={points}
                  state={clusterState}
                  width={600}
                  height={450}
                />

                {/* Cluster breakdown */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {clusterCounts.map((count, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card p-3 text-center"
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

              <div className="space-y-6">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                How K-Means Clustering Works
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium text-chart-1">1. Initialize</h4>
                  <p className="text-sm text-muted-foreground">
                    Place k centroids using K-Means++ for better starting positions.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-chart-2">2. Assign</h4>
                  <p className="text-sm text-muted-foreground">
                    Assign each point to its nearest centroid based on Euclidean distance.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-chart-3">3. Update</h4>
                  <p className="text-sm text-muted-foreground">
                    Move each centroid to the mean position of its assigned points.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Decision Tree Tab */}
          <TabsContent value="tree" className="space-y-6" id="decision-tree">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <DecisionTreeChart root={treeRoot} width={650} height={400} />

                {/* Feature importance */}
                <div className="mt-4 rounded-xl border border-border bg-card p-4">
                  <h4 className="mb-3 text-sm font-medium text-foreground">
                    Classification Task
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Predicting risk level based on <strong>Age</strong> and{" "}
                    <strong>Income</strong>. High-income older individuals or
                    very high-income younger individuals are classified as
                    {"High Risk"}.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                How Decision Trees Work
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium text-chart-1">1. Find Best Split</h4>
                  <p className="text-sm text-muted-foreground">
                    For each feature, find the threshold that best separates classes
                    using Gini impurity.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-chart-2">2. Split Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Divide data into left (less than threshold) and right (greater
                    than) branches.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-chart-3">3. Recurse or Stop</h4>
                  <p className="text-sm text-muted-foreground">
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
