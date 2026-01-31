"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TopBar } from "@/components/top-bar";
import { ControlPanel } from "@/components/control-panel";
import { ExplanationPanel } from "@/components/explanation-panel";
import { StatsCard } from "@/components/stats-card";
import { RegressionChart } from "@/components/visualizations/regression-chart";
import { LossChart } from "@/components/visualizations/loss-chart";
import {
  generateLinearData,
  initializeRegression,
  gradientDescentStep,
  type Point,
  type RegressionState,
} from "@/lib/ml-algorithms";
import { TrendingDown, Hash, Percent, Target } from "lucide-react";

export default function RegressionPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [state, setState] = useState<RegressionState>(initializeRegression());
  const [isPlaying, setIsPlaying] = useState(false);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [maxIterations, setMaxIterations] = useState(100);
  const [dataset, setDataset] = useState("default");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    generateNewData(dataset);
  }, [dataset]);

  const generateNewData = (type: string) => {
    let noise = 15;
    let count = 30;

    switch (type) {
      case "sparse":
        count = 15;
        noise = 20;
        break;
      case "dense":
        count = 50;
        noise = 10;
        break;
      case "noisy":
        count = 30;
        noise = 30;
        break;
      default:
        count = 30;
        noise = 15;
    }

    setPoints(generateLinearData(count, noise));
    setState(initializeRegression());
    setIsPlaying(false);
  };

  const step = useCallback(() => {
    if (state.iteration >= maxIterations) {
      setIsPlaying(false);
      return;
    }
    setState((prev) => gradientDescentStep(points, prev, learningRate));
  }, [points, learningRate, maxIterations, state.iteration]);

  const play = () => {
    if (state.iteration >= maxIterations) {
      reset();
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setState(initializeRegression());
    setIsPlaying(false);
  };

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        step();
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, step]);

  // Stop when max iterations reached
  useEffect(() => {
    if (state.iteration >= maxIterations) {
      setIsPlaying(false);
    }
  }, [state.iteration, maxIterations]);

  // Generate explanation based on current state
  const getExplanation = () => {
    if (state.iteration === 0) {
      return {
        whatChanged: "Algorithm initialized with random slope and intercept values.",
        whyItChanged:
          "We start with random parameters because we don't know the optimal values yet.",
        conceptualMeaning:
          "The algorithm will now iteratively adjust these values to find the best-fit line.",
      };
    }

    const prevLoss = state.lossHistory[state.lossHistory.length - 2] || Infinity;
    const currentLoss = state.loss;
    const improvement = prevLoss - currentLoss;

    if (state.iteration < 10) {
      return {
        whatChanged: `Slope: ${state.slope.toFixed(4)}, Intercept: ${state.intercept.toFixed(4)}. Loss decreased by ${improvement.toFixed(4)}.`,
        whyItChanged:
          "Gradient descent calculated the direction of steepest descent and took a small step in that direction.",
        conceptualMeaning:
          "Early iterations show large improvements as the line quickly moves toward the data points.",
      };
    }

    if (improvement < 0.01) {
      return {
        whatChanged: `Loss is ${state.loss.toFixed(4)}. Change is very small (${improvement.toFixed(6)}).`,
        whyItChanged:
          "We're approaching the minimum of the loss function where gradients become smaller.",
        conceptualMeaning:
          "The algorithm is converging! The line has found a near-optimal fit to the data.",
      };
    }

    return {
      whatChanged: `Iteration ${state.iteration}: Loss = ${state.loss.toFixed(4)} (improved by ${improvement.toFixed(4)}).`,
      whyItChanged: `The gradient (partial derivatives) indicated moving slope by ${(learningRate * 1000).toFixed(3)} units.`,
      conceptualMeaning:
        "Each step brings us closer to the minimum error, where predictions best match actual values.",
    };
  };

  const explanation = getExplanation();

  return (
    <div className="min-h-screen">
      <TopBar
        title="Linear Regression"
        subtitle="Gradient descent visualization"
        showDatasetSelector
        dataset={dataset}
        onDatasetChange={setDataset}
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Iteration"
            value={state.iteration}
            unit={`/ ${maxIterations}`}
            icon={<Hash className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Current Loss"
            value={state.loss}
            icon={<TrendingDown className="h-5 w-5" />}
            trend={state.lossHistory.length > 1 ? "down" : "neutral"}
            color="default"
          />
          <StatsCard
            label="Slope"
            value={state.slope}
            icon={<Percent className="h-5 w-5" />}
            color="default"
          />
          <StatsCard
            label="Intercept"
            value={state.intercept}
            icon={<Target className="h-5 w-5" />}
            color="default"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Visualization - Takes 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            <RegressionChart points={points} state={state} width={700} height={400} />
            <LossChart lossHistory={state.lossHistory} width={700} height={200} />
          </div>

          {/* Controls & Explanation */}
          <div className="space-y-6">
            <ControlPanel
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              onStep={step}
              onReset={reset}
              disabled={points.length === 0}
              sliders={[
                {
                  label: "Learning Rate",
                  value: learningRate,
                  min: 0.00001,
                  max: 0.001,
                  step: 0.00001,
                  onChange: setLearningRate,
                  formatValue: (v) => v.toFixed(5),
                },
                {
                  label: "Max Iterations",
                  value: maxIterations,
                  min: 10,
                  max: 500,
                  step: 10,
                  onChange: setMaxIterations,
                },
              ]}
            />

            <ExplanationPanel
              title="What's Happening?"
              whatChanged={explanation.whatChanged}
              whyItChanged={explanation.whyItChanged}
              conceptualMeaning={explanation.conceptualMeaning}
              algorithmColor="regression"
            />
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            How Linear Regression Works
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium text-chart-1">1. Initialize</h4>
              <p className="text-sm text-muted-foreground">
                Start with random values for slope (m) and intercept (b) in the
                equation y = mx + b.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-chart-2">2. Calculate Loss</h4>
              <p className="text-sm text-muted-foreground">
                Measure how wrong our predictions are using Mean Squared Error
                (MSE): the average of squared differences between predicted and
                actual values.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-chart-3">3. Update Parameters</h4>
              <p className="text-sm text-muted-foreground">
                Use gradient descent to adjust slope and intercept in the
                direction that reduces the loss. The learning rate controls step
                size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
