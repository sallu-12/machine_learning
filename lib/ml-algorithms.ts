// ML Algorithm Implementations - Pure JavaScript/TypeScript

export interface Point {
  x: number;
  y: number;
  cluster?: number;
}

export interface RegressionState {
  slope: number;
  intercept: number;
  loss: number;
  iteration: number;
  predictions: number[];
  lossHistory: number[];
}

export interface ClusteringState {
  centroids: Point[];
  assignments: number[];
  iteration: number;
  converged: boolean;
  history: { centroids: Point[]; assignments: number[] }[];
}

export interface TreeNode {
  feature?: string;
  threshold?: number;
  value?: string;
  left?: TreeNode;
  right?: TreeNode;
  samples: number;
  depth: number;
  impurity: number;
}

export interface DecisionTreeState {
  root: TreeNode | null;
  currentDepth: number;
  maxDepth: number;
  nodes: TreeNode[];
  buildHistory: TreeNode[][];
}

// Linear Regression with Gradient Descent
export function initializeRegression(): RegressionState {
  return {
    slope: Math.random() * 2 - 1,
    intercept: Math.random() * 2 - 1,
    loss: Infinity,
    iteration: 0,
    predictions: [],
    lossHistory: [],
  };
}

export function calculateMSE(points: Point[], slope: number, intercept: number): number {
  if (points.length === 0) return 0;
  const sumSquaredErrors = points.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  return sumSquaredErrors / points.length;
}

export function gradientDescentStep(
  points: Point[],
  state: RegressionState,
  learningRate: number
): RegressionState {
  if (points.length === 0) return state;
  
  const n = points.length;

  // Sum gradients first (more numerically stable), then scale and clip to avoid divergence
  let slopeGradSum = 0;
  let interceptGradSum = 0;

  // Calculate gradient sums
  for (const point of points) {
    const predicted = state.slope * point.x + state.intercept;
    const error = predicted - point.y;
    slopeGradSum += error * point.x;
    interceptGradSum += error;
  }

  let slopeGradient = (2 / n) * slopeGradSum;
  let interceptGradient = (2 / n) * interceptGradSum;

  // Clip extremely large gradients to prevent NaN/Infinite updates
  const MAX_GRAD = 1e6;
  if (!Number.isFinite(slopeGradient)) slopeGradient = 0;
  if (!Number.isFinite(interceptGradient)) interceptGradient = 0;
  slopeGradient = Math.max(Math.min(slopeGradient, MAX_GRAD), -MAX_GRAD);
  interceptGradient = Math.max(Math.min(interceptGradient, MAX_GRAD), -MAX_GRAD);

  // Update parameters
  let newSlope = state.slope - learningRate * slopeGradient;
  let newIntercept = state.intercept - learningRate * interceptGradient;
  let newLoss = calculateMSE(points, newSlope, newIntercept);

  // Guard against NaN/Infinite loss (fall back to previous loss or recompute)
  if (!Number.isFinite(newLoss)) {
    const fallback = calculateMSE(points, state.slope, state.intercept);
    newLoss = Number.isFinite(fallback) ? fallback : (Number.isFinite(state.loss) ? state.loss : 0);
    // Revert parameter updates if loss is invalid
    if (!Number.isFinite(newSlope) || !Number.isFinite(newIntercept)) {
      newSlope = state.slope;
      newIntercept = state.intercept;
    }
  }
  
  const predictions = points.map(p => newSlope * p.x + newIntercept);
  
  return {
    slope: newSlope,
    intercept: newIntercept,
    loss: newLoss,
    iteration: state.iteration + 1,
    predictions,
    lossHistory: [...state.lossHistory, newLoss],
  };
}

// K-Means Clustering
export function initializeCentroids(points: Point[], k: number): Point[] {
  if (points.length === 0) return [];
  
  // K-Means++ initialization
  const centroids: Point[] = [];
  const usedIndices = new Set<number>();
  
  // First centroid - random
  let firstIdx = Math.floor(Math.random() * points.length);
  centroids.push({ x: points[firstIdx].x, y: points[firstIdx].y });
  usedIndices.add(firstIdx);
  
  // Remaining centroids - weighted by distance
  while (centroids.length < k && centroids.length < points.length) {
    const distances = points.map((point, idx) => {
      if (usedIndices.has(idx)) return 0;
      const minDist = Math.min(...centroids.map(c => 
        Math.sqrt(Math.pow(point.x - c.x, 2) + Math.pow(point.y - c.y, 2))
      ));
      return minDist * minDist;
    });
    
    const totalDist = distances.reduce((a, b) => a + b, 0);
    if (totalDist === 0) break;
    
    let random = Math.random() * totalDist;
    let nextIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        nextIdx = i;
        break;
      }
    }
    
    centroids.push({ x: points[nextIdx].x, y: points[nextIdx].y });
    usedIndices.add(nextIdx);
  }
  
  return centroids;
}

export function assignClusters(points: Point[], centroids: Point[]): number[] {
  return points.map(point => {
    let minDist = Infinity;
    let cluster = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = Math.sqrt(
        Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        cluster = idx;
      }
    });
    
    return cluster;
  });
}

export function updateCentroids(points: Point[], assignments: number[], k: number): Point[] {
  const newCentroids: Point[] = [];
  
  for (let i = 0; i < k; i++) {
    const clusterPoints = points.filter((_, idx) => assignments[idx] === i);
    
    if (clusterPoints.length === 0) {
      // Keep old centroid or random point
      newCentroids.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    } else {
      newCentroids.push({
        x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
        y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
      });
    }
  }
  
  return newCentroids;
}

export function kMeansStep(
  points: Point[],
  state: ClusteringState,
  k: number
): ClusteringState {
  const assignments = assignClusters(points, state.centroids);
  const newCentroids = updateCentroids(points, assignments, k);
  
  // Check convergence
  const converged = state.centroids.every((c, i) => {
    const nc = newCentroids[i];
    return Math.abs(c.x - nc.x) < 0.001 && Math.abs(c.y - nc.y) < 0.001;
  });
  
  return {
    centroids: newCentroids,
    assignments,
    iteration: state.iteration + 1,
    converged,
    history: [...state.history, { centroids: newCentroids, assignments }],
  };
}

// Decision Tree
export interface TreeDataPoint {
  features: Record<string, number>;
  label: string;
}

export function calculateGini(labels: string[]): number {
  if (labels.length === 0) return 0;
  
  const counts: Record<string, number> = {};
  for (const label of labels) {
    counts[label] = (counts[label] || 0) + 1;
  }
  
  let gini = 1;
  for (const count of Object.values(counts)) {
    const prob = count / labels.length;
    gini -= prob * prob;
  }
  
  return gini;
}

export function findBestSplit(
  data: TreeDataPoint[],
  features: string[]
): { feature: string; threshold: number; gain: number } | null {
  if (data.length < 2) return null;
  
  let bestGain = 0;
  let bestFeature = '';
  let bestThreshold = 0;
  
  const currentGini = calculateGini(data.map(d => d.label));
  
  for (const feature of features) {
    const values = [...new Set(data.map(d => d.features[feature]))].sort((a, b) => a - b);
    
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      
      const left = data.filter(d => d.features[feature] <= threshold);
      const right = data.filter(d => d.features[feature] > threshold);
      
      if (left.length === 0 || right.length === 0) continue;
      
      const leftGini = calculateGini(left.map(d => d.label));
      const rightGini = calculateGini(right.map(d => d.label));
      
      const weightedGini = 
        (left.length / data.length) * leftGini +
        (right.length / data.length) * rightGini;
      
      const gain = currentGini - weightedGini;
      
      if (gain > bestGain) {
        bestGain = gain;
        bestFeature = feature;
        bestThreshold = threshold;
      }
    }
  }
  
  return bestGain > 0 ? { feature: bestFeature, threshold: bestThreshold, gain: bestGain } : null;
}

export function buildTreeStep(
  data: TreeDataPoint[],
  features: string[],
  depth: number,
  maxDepth: number
): TreeNode {
  const labels = data.map(d => d.label);
  const impurity = calculateGini(labels);
  
  // Leaf node conditions
  if (depth >= maxDepth || data.length < 2 || impurity === 0) {
    const labelCounts: Record<string, number> = {};
    for (const label of labels) {
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
    const majorityLabel = Object.entries(labelCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      value: majorityLabel,
      samples: data.length,
      depth,
      impurity,
    };
  }
  
  const bestSplit = findBestSplit(data, features);
  
  if (!bestSplit) {
    const labelCounts: Record<string, number> = {};
    for (const label of labels) {
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
    const majorityLabel = Object.entries(labelCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      value: majorityLabel,
      samples: data.length,
      depth,
      impurity,
    };
  }
  
  const leftData = data.filter(d => d.features[bestSplit.feature] <= bestSplit.threshold);
  const rightData = data.filter(d => d.features[bestSplit.feature] > bestSplit.threshold);
  
  return {
    feature: bestSplit.feature,
    threshold: bestSplit.threshold,
    samples: data.length,
    depth,
    impurity,
    left: buildTreeStep(leftData, features, depth + 1, maxDepth),
    right: buildTreeStep(rightData, features, depth + 1, maxDepth),
  };
}

// Dataset generators
export function generateLinearData(n: number, noise: number = 10): Point[] {
  const points: Point[] = [];
  const trueSlope = 1.5;
  const trueIntercept = 20;
  
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100;
    const y = trueSlope * x + trueIntercept + (Math.random() - 0.5) * noise * 2;
    points.push({ x, y });
  }
  
  return points;
}

export function generateClusterData(n: number, k: number): Point[] {
  const points: Point[] = [];
  const centers = [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 50, y: 75 },
    { x: 25, y: 75 },
    { x: 75, y: 75 },
  ].slice(0, k);
  
  for (let i = 0; i < n; i++) {
    const center = centers[i % k];
    const spread = 15;
    points.push({
      x: center.x + (Math.random() - 0.5) * spread * 2,
      y: center.y + (Math.random() - 0.5) * spread * 2,
    });
  }
  
  return points;
}

export function generateClassificationData(n: number): TreeDataPoint[] {
  const data: TreeDataPoint[] = [];
  
  for (let i = 0; i < n; i++) {
    const age = 20 + Math.random() * 50;
    const income = 20000 + Math.random() * 80000;
    
    // Simple decision boundary
    const label = (age > 35 && income > 50000) || (age <= 35 && income > 70000)
      ? 'High Risk'
      : 'Low Risk';
    
    data.push({
      features: { age, income },
      label,
    });
  }
  
  return data;
}

// Cluster colors
export const CLUSTER_COLORS = [
  'oklch(0.65 0.2 265)',   // Primary blue
  'oklch(0.55 0.18 170)',  // Teal/Cyan
  'oklch(0.7 0.18 80)',    // Yellow/Gold
  'oklch(0.6 0.2 320)',    // Pink
  'oklch(0.65 0.22 30)',   // Orange
];
