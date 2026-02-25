"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import { ExplanationPanel } from "@/components/explanation-panel";
import { DBSCANChart } from "@/components/visualizations/dbscan-chart";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { dbscanCluster, generateDBSCANData } from "@/lib/ml-algorithms";
import { Layers, MapPin, Radar, Sparkles } from "lucide-react";
import { FlipCard } from "@/components/flip-card";

export default function DBSCANPage() {
  useScrollReveal();

  const [pointsCount, setPointsCount] = useState(90);
  const [noisePoints, setNoisePoints] = useState(12);
  const [eps, setEps] = useState(12);
  const [minPts, setMinPts] = useState(5);
  const [points, setPoints] = useState(() => generateDBSCANData(pointsCount, 3, noisePoints));

  const snapToStep = (value: number, step: number) => Math.round(value / step) * step;
  const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

  const applyPreset = (preset: "tight" | "noisy" | "sparse") => {
    if (preset === "tight") {
      setEps(8);
      setMinPts(6);
      setPointsCount(90);
      setNoisePoints(6);
      return;
    }
    if (preset === "noisy") {
      setEps(14);
      setMinPts(4);
      setPointsCount(120);
      setNoisePoints(20);
      return;
    }
    setEps(10);
    setMinPts(8);
    setPointsCount(70);
    setNoisePoints(3);
  };

  const randomize = () => {
    setEps(snapToStep(randomBetween(6, 20), 1));
    setMinPts(snapToStep(randomBetween(3, 10), 1));
    setPointsCount(snapToStep(randomBetween(60, 140), 10));
    setNoisePoints(snapToStep(randomBetween(0, 25), 1));
  };

  useEffect(() => {
    setPoints(generateDBSCANData(pointsCount, 3, noisePoints));
  }, [pointsCount, noisePoints]);

  const result = useMemo(() => dbscanCluster(points, eps, minPts), [points, eps, minPts]);

  return (
    <div className="min-h-screen">
      <TopBar title="DBSCAN Lab" subtitle="Density-based clustering for messy data" />

      <div className="space-y-2 sm:space-y-3 md:space-y-6 p-2 sm:p-3 md:p-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
          <StatsCard
            label="Clusters"
            value={result.clusters}
            icon={<Layers className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Noise Points"
            value={result.noiseCount}
            icon={<MapPin className="h-5 w-5" />}
            color="warning"
          />
          <StatsCard
            label="Epsilon"
            value={eps}
            icon={<Radar className="h-5 w-5" />}
            color="accent"
          />
          <StatsCard
            label="Min Pts"
            value={minPts}
            icon={<Sparkles className="h-5 w-5" />}
            color="default"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3 scroll-reveal" data-reveal>
          <div className="xl:col-span-2 w-full overflow-x-hidden">
            <div className="w-full max-w-full overflow-hidden">
              <DBSCANChart points={points} assignments={result.assignments} />
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
                  onClick={() => applyPreset("tight")}
                  className="h-8"
                >
                  Tight Clusters
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("noisy")}
                  className="h-8"
                >
                  Noisy Swarm
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("sparse")}
                  className="h-8"
                >
                  Sparse Groups
                </Button>
              </div>

              <div className="mb-5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                Mini challenge: Find settings where noise points drop below 5 without merging clusters.
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Epsilon</label>
                    <span className="text-sm font-mono text-primary">{eps}</span>
                  </div>
                  <Slider
                    value={[eps]}
                    min={6}
                    max={20}
                    step={1}
                    onValueChange={([value]) => setEps(value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Min Pts</label>
                    <span className="text-sm font-mono text-primary">{minPts}</span>
                  </div>
                  <Slider
                    value={[minPts]}
                    min={3}
                    max={10}
                    step={1}
                    onValueChange={([value]) => setMinPts(value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Total Points</label>
                    <span className="text-sm font-mono text-primary">{pointsCount}</span>
                  </div>
                  <Slider
                    value={[pointsCount]}
                    min={60}
                    max={140}
                    step={10}
                    onValueChange={([value]) => setPointsCount(value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Noise Points</label>
                    <span className="text-sm font-mono text-primary">{noisePoints}</span>
                  </div>
                  <Slider
                    value={[noisePoints]}
                    min={0}
                    max={25}
                    step={1}
                    onValueChange={([value]) => setNoisePoints(value)}
                  />
                </div>
              </div>
            </div>

            <ExplanationPanel
              title="Why DBSCAN matters"
              whatChanged="DBSCAN finds clusters of any shape and labels noise explicitly."
              whyItChanged="It uses density (eps + minPts) instead of a fixed k."
              conceptualMeaning="Great for anomaly detection and irregular real-world data."
              algorithmColor="clustering"
            />
          </div>
        </div>

        <section className="scroll-reveal" data-reveal>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How To Use</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">DBSCAN step-by-step</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                Goal: clear clusters, low noise
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">1) Set eps</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Increase Epsilon to merge clusters; decrease it to split dense groups.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Find the smallest eps that keeps clusters connected but isolates noise.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">2) Set MinPts</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Higher MinPts reduces noise but can remove small clusters.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start with MinPts 4-6. Larger values enforce tighter density.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">3) Inspect outputs</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Watch Noise Points and cluster count to confirm clean grouping.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If clusters look fragmented, raise eps before lowering MinPts.
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
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">DBSCAN detailed guide</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                Great for irregular clusters and outlier detection
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      DBSCAN groups points by density and labels sparse points as noise.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Why it helps</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      It finds irregular shapes without knowing k and is strong against outliers.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">How it decides</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A core point has MinPts neighbors within Epsilon. Core points connect clusters.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Edge cases</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Border points can shift clusters quickly. Small eps exaggerates this effect.
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
                      <li>Density is meaningful</li>
                      <li>Single eps works</li>
                      <li>Metric matches shape</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">When it struggles</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Varying density in clusters can split or merge groups incorrectly.
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
                    <h3 className="text-sm font-semibold text-foreground">Parameter tips</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Raise eps to merge</li>
                      <li>Raise MinPts to reduce noise</li>
                      <li>Small eps = many outliers</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Quick test</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try eps 10-12 and MinPts 5, then adjust from there.
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
                      <li>Pros: no k needed</li>
                      <li>Cons: eps sensitive</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Alternate</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If density varies, consider HDBSCAN for adaptive clusters.
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
                      <li>Anomaly detection</li>
                      <li>Geospatial clustering</li>
                      <li>Customer segmentation</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Example</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cluster GPS points, then label sparse regions as outliers.
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
