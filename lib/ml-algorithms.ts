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

export interface PCAResult {
  mean: Point;
  direction: Point;
  varianceRatio: number;
  projected: Point[];
}

export interface DBSCANResult {
  assignments: number[];
  clusters: number;
  noiseCount: number;
}

export interface GMMState {
  means: Point[];
  variances: Point[];
  weights: number[];
  assignments: number[];
  logLikelihood: number;
  iteration: number;
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
    
    // Simple 3-class boundary for Low/Medium/High risk
    const label = (age > 45 && income > 65000) || (age <= 30 && income > 80000)
      ? 'High Risk'
      : (age > 35 && income > 45000) || (age > 25 && income > 60000)
        ? 'Medium Risk'
        : 'Low Risk';
    
    data.push({
      features: { age, income },
      label,
    });
  }
  
  return data;
}

function randomNormal(mean = 0, stdDev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

// PCA
export function generatePCAData(n: number, angleDeg = 25, noise = 8): Point[] {
  const points: Point[] = [];
  const angle = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  const orthoX = -dirY;
  const orthoY = dirX;

  for (let i = 0; i < n; i++) {
    const t = randomNormal(0, 30);
    const n1 = randomNormal(0, noise);
    const x = 50 + dirX * t + orthoX * n1;
    const y = 50 + dirY * t + orthoY * n1;
    points.push({ x, y });
  }

  return points;
}

export function computePCA(points: Point[]): PCAResult {
  if (points.length === 0) {
    return {
      mean: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      varianceRatio: 0,
      projected: [],
    };
  }

  const mean = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  mean.x /= points.length;
  mean.y /= points.length;

  let covXX = 0;
  let covYY = 0;
  let covXY = 0;
  points.forEach((p) => {
    const dx = p.x - mean.x;
    const dy = p.y - mean.y;
    covXX += dx * dx;
    covYY += dy * dy;
    covXY += dx * dy;
  });
  covXX /= points.length;
  covYY /= points.length;
  covXY /= points.length;

  const trace = covXX + covYY;
  const det = covXX * covYY - covXY * covXY;
  const temp = Math.sqrt(Math.max(0, (trace * trace) / 4 - det));
  const lambda1 = trace / 2 + temp;
  const lambda2 = trace / 2 - temp;

  let dir = { x: 1, y: 0 };
  if (Math.abs(covXY) > 1e-6) {
    dir = { x: lambda1 - covYY, y: covXY };
  } else if (covXX < covYY) {
    dir = { x: 0, y: 1 };
  }

  const norm = Math.sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
  dir = { x: dir.x / norm, y: dir.y / norm };

  const varianceRatio = trace > 0 ? lambda1 / trace : 0;

  const projected = points.map((p) => {
    const dx = p.x - mean.x;
    const dy = p.y - mean.y;
    const scalar = dx * dir.x + dy * dir.y;
    return { x: mean.x + dir.x * scalar, y: mean.y + dir.y * scalar };
  });

  return {
    mean,
    direction: dir,
    varianceRatio,
    projected,
  };
}

// DBSCAN
export function generateDBSCANData(n: number, clusters = 3, noisePoints = 12): Point[] {
  const points: Point[] = [];
  const centers = [
    { x: 25, y: 30 },
    { x: 75, y: 30 },
    { x: 50, y: 70 },
    { x: 25, y: 70 },
  ].slice(0, clusters);

  for (let i = 0; i < n; i++) {
    const center = centers[i % centers.length];
    points.push({
      x: center.x + randomNormal(0, 8),
      y: center.y + randomNormal(0, 8),
    });
  }

  for (let i = 0; i < noisePoints; i++) {
    points.push({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });
  }

  return points;
}

export function dbscanCluster(points: Point[], eps: number, minPts: number): DBSCANResult {
  const assignments = Array(points.length).fill(-1);
  const visited = Array(points.length).fill(false);
  let clusterId = 0;

  const distance = (a: Point, b: Point) =>
    Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const regionQuery = (index: number) => {
    const neighbors: number[] = [];
    points.forEach((p, idx) => {
      if (distance(points[index], p) <= eps) neighbors.push(idx);
    });
    return neighbors;
  };

  const expandCluster = (index: number, neighbors: number[]) => {
    assignments[index] = clusterId;

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIdx = neighbors[i];

      if (!visited[neighborIdx]) {
        visited[neighborIdx] = true;
        const neighborNeighbors = regionQuery(neighborIdx);
        if (neighborNeighbors.length >= minPts) {
          neighbors.push(...neighborNeighbors.filter((n) => !neighbors.includes(n)));
        }
      }

      if (assignments[neighborIdx] === -1) {
        assignments[neighborIdx] = clusterId;
      }
    }
  };

  for (let i = 0; i < points.length; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const neighbors = regionQuery(i);

    if (neighbors.length < minPts) {
      assignments[i] = -1;
    } else {
      expandCluster(i, neighbors);
      clusterId++;
    }
  }

  const noiseCount = assignments.filter((a) => a === -1).length;

  return {
    assignments,
    clusters: clusterId,
    noiseCount,
  };
}

// GMM (EM)
export function generateGMMData(n: number, components = 3): Point[] {
  const points: Point[] = [];
  const centers = [
    { x: 25, y: 30 },
    { x: 70, y: 35 },
    { x: 50, y: 75 },
    { x: 30, y: 70 },
  ].slice(0, components);

  for (let i = 0; i < n; i++) {
    const center = centers[i % centers.length];
    points.push({
      x: center.x + randomNormal(0, 10),
      y: center.y + randomNormal(0, 10),
    });
  }

  return points;
}

export function initializeGMM(points: Point[], k: number): GMMState {
  const means: Point[] = [];
  const variances: Point[] = [];
  const weights = Array(k).fill(1 / k);

  for (let i = 0; i < k; i++) {
    const p = points[Math.floor(Math.random() * points.length)] || { x: 50, y: 50 };
    means.push({ x: p.x, y: p.y });
    variances.push({ x: 120, y: 120 });
  }

  return {
    means,
    variances,
    weights,
    assignments: Array(points.length).fill(0),
    logLikelihood: 0,
    iteration: 0,
  };
}

export function gmmStep(points: Point[], state: GMMState): GMMState {
  const k = state.means.length;
  const responsibilities: number[][] = Array(points.length)
    .fill(0)
    .map(() => Array(k).fill(0));

  const gaussian = (point: Point, mean: Point, variance: Point) => {
    const varX = Math.max(variance.x, 10);
    const varY = Math.max(variance.y, 10);
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    const coef = 1 / (2 * Math.PI * Math.sqrt(varX * varY));
    const expTerm = Math.exp(-(dx * dx) / (2 * varX) - (dy * dy) / (2 * varY));
    return coef * expTerm;
  };

  let logLikelihood = 0;
  const assignments = Array(points.length).fill(0);

  points.forEach((point, i) => {
    let total = 0;
    for (let c = 0; c < k; c++) {
      const prob = state.weights[c] * gaussian(point, state.means[c], state.variances[c]);
      responsibilities[i][c] = prob;
      total += prob;
    }

    if (total === 0) total = 1e-12;
    logLikelihood += Math.log(total);

    let maxIdx = 0;
    let maxVal = 0;
    for (let c = 0; c < k; c++) {
      responsibilities[i][c] /= total;
      if (responsibilities[i][c] > maxVal) {
        maxVal = responsibilities[i][c];
        maxIdx = c;
      }
    }
    assignments[i] = maxIdx;
  });

  const newMeans: Point[] = Array(k).fill(0).map(() => ({ x: 0, y: 0 }));
  const newVariances: Point[] = Array(k).fill(0).map(() => ({ x: 0, y: 0 }));
  const newWeights = Array(k).fill(0);

  for (let c = 0; c < k; c++) {
    let weightSum = 0;
    points.forEach((p, i) => {
      const r = responsibilities[i][c];
      weightSum += r;
      newMeans[c].x += r * p.x;
      newMeans[c].y += r * p.y;
    });

    if (weightSum === 0) {
      newMeans[c] = { ...state.means[c] };
      newVariances[c] = { ...state.variances[c] };
      newWeights[c] = state.weights[c];
      continue;
    }

    newMeans[c].x /= weightSum;
    newMeans[c].y /= weightSum;
    newWeights[c] = weightSum / points.length;

    points.forEach((p, i) => {
      const r = responsibilities[i][c];
      const dx = p.x - newMeans[c].x;
      const dy = p.y - newMeans[c].y;
      newVariances[c].x += r * dx * dx;
      newVariances[c].y += r * dy * dy;
    });

    newVariances[c].x = newVariances[c].x / weightSum + 10;
    newVariances[c].y = newVariances[c].y / weightSum + 10;
  }

  return {
    means: newMeans,
    variances: newVariances,
    weights: newWeights,
    assignments,
    logLikelihood,
    iteration: state.iteration + 1,
  };
}

// Cluster colors
export const CLUSTER_COLORS = [
  'oklch(0.74 0.2 210)',   // Bright blue
  'oklch(0.7 0.2 165)',    // Teal
  'oklch(0.82 0.22 80)',   // Gold
  'oklch(0.72 0.2 20)',    // Orange
  'oklch(0.66 0.2 310)',   // Magenta
];
