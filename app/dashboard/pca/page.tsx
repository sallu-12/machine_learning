"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import { ExplanationPanel } from "@/components/explanation-panel";
import { PCAChart } from "@/components/visualizations/pca-chart";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { computePCA, generatePCAData } from "@/lib/ml-algorithms";
import { BarChart3, Sparkles, SlidersHorizontal } from "lucide-react";
import { FlipCard } from "@/components/flip-card";

export default function PCAPage() {
  useScrollReveal();

  const [pointsCount, setPointsCount] = useState(80);
  const [angle, setAngle] = useState(25);
  const [noise, setNoise] = useState(8);
  const [points, setPoints] = useState(() => generatePCAData(pointsCount, angle, noise));

  const snapToStep = (value: number, step: number) => Math.round(value / step) * step;
  const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

  const applyPreset = (preset: "clean" | "noisy" | "diagonal") => {
    if (preset === "clean") {
      setPointsCount(90);
      setAngle(10);
      setNoise(3);
      return;
    }
    if (preset === "noisy") {
      setPointsCount(110);
      setAngle(0);
      setNoise(16);
      return;
    }
    setPointsCount(70);
    setAngle(40);
    setNoise(6);
  };

  const randomize = () => {
    setPointsCount(snapToStep(randomBetween(50, 140), 10));
    setAngle(snapToStep(randomBetween(-45, 45), 5));
    setNoise(snapToStep(randomBetween(2, 18), 1));
  };

  useEffect(() => {
    setPoints(generatePCAData(pointsCount, angle, noise));
  }, [pointsCount, angle, noise]);

  const pcaResult = useMemo(() => computePCA(points), [points]);

  return (
    <div className="min-h-screen">
      <TopBar title="PCA Lab" subtitle="Principal Component Analysis in action" />

      <div className="space-y-2 sm:space-y-3 md:space-y-6 p-2 sm:p-3 md:p-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
          <StatsCard
            label="Samples"
            value={points.length}
            icon={<Sparkles className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Variance (PC1)"
            value={pcaResult.varianceRatio * 100}
            unit="%"
            icon={<BarChart3 className="h-5 w-5" />}
            color="accent"
          />
          <StatsCard
            label="Noise"
            value={noise}
            icon={<SlidersHorizontal className="h-5 w-5" />}
            color="default"
          />
          <StatsCard
            label="Angle"
            value={angle}
            unit="deg"
            icon={<SlidersHorizontal className="h-5 w-5" />}
            color="default"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3 scroll-reveal" data-reveal>
          <div className="xl:col-span-2 w-full overflow-x-hidden">
            <div className="w-full max-w-full overflow-hidden">
              <PCAChart points={points} result={pcaResult} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-6">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Controls
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomize}
                  className="h-8 border-border bg-secondary/60 text-xs"
                >
                  Surprise me
                </Button>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("clean")}
                  className="h-8"
                >
                  Clean Line
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("noisy")}
                  className="h-8"
                >
                  Noisy Cloud
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("diagonal")}
                  className="h-8"
                >
                  Diagonal Drift
                </Button>
              </div>

              <div className="mb-5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                Mini challenge: Push PC1 variance above 85% with the smallest number of points.
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Points</label>
                    <span className="text-sm font-mono text-primary">{pointsCount}</span>
                  </div>
                  <Slider
                    value={[pointsCount]}
                    min={40}
                    max={140}
                    step={10}
                    onValueChange={([value]) => setPointsCount(value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Angle</label>
                    <span className="text-sm font-mono text-primary">{angle}°</span>
                  </div>
                  <Slider
                    value={[angle]}
                    min={-45}
                    max={45}
                    step={5}
                    onValueChange={([value]) => setAngle(value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Noise</label>
                    <span className="text-sm font-mono text-primary">{noise}</span>
                  </div>
                  <Slider
                    value={[noise]}
                    min={2}
                    max={18}
                    step={1}
                    onValueChange={([value]) => setNoise(value)}
                  />
                </div>
              </div>
            </div>

            <ExplanationPanel
              title="Why PCA matters"
              whatChanged="PCA projects high-dimensional data onto a single direction (PC1)."
              whyItChanged="That direction captures the maximum variance in your data."
              conceptualMeaning="Use PCA for compression, noise reduction, and faster models."
              algorithmColor="regression"
            />
          </div>
        </div>

        <section className="scroll-reveal" data-reveal>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How To Use</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">PCA step-by-step</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                Goal: maximize variance on PC1
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">1) Shape the data</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Move Angle to rotate the dominant direction. Increase Points for stability.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A clear diagonal line makes PC1 lock-in faster. Try 25-40 degrees for a clean sweep.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">2) Tune noise</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Raise Noise to watch variance drop. Lower it to make PC1 more confident.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Noise 2-6 gives strong variance. Noise 12+ shows why PCA is sensitive to messy data.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">3) Read the stats</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aim for high Variance (PC1). Use presets to see extremes quickly.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hit 85%+ variance, then reduce points to see how sample size affects stability.
                    </p>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section className="scroll-reveal" data-reveal>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Deep Dive</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">PCA explained with details</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                Best for compression, denoising, and feature engineering
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      PCA finds directions with maximum variance and projects data to reduce dimensions.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Why it works</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      PCs are orthogonal, so each new axis captures fresh information without overlap.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Core formula</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Compute covariance matrix Sigma, then eigenvectors of Sigma become components.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Projection</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Z = X * W_k. You keep only the strongest k components to compress data.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Assumptions</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Linear structure dominates</li>
                      <li>Mean-centered data</li>
                      <li>Variance = information</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">When it fails</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Strong non-linear patterns need kernel PCA or autoencoders instead.
                    </p>
                  </div>
                }
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">What to watch</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Noise lowers variance</li>
                      <li>Angle rotates the axis</li>
                      <li>More points stabilize</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Debug tips</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If variance is low, reduce noise first, then increase point count.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pros / Cons</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Pros: fast, interpretable</li>
                      <li>Cons: linear only</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Best practice</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Standardize features so variance reflects signal, not scale.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Real use cases</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Compression, denoising</li>
                      <li>Clustering prep</li>
                      <li>Visualization</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Example</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Reduce image features to 10 PCs, then cluster with k-means.
                    </p>
                  </div>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
