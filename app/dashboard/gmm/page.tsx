"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { StatsCard } from "@/components/stats-card";
import { ControlPanel } from "@/components/control-panel";
import { ExplanationPanel } from "@/components/explanation-panel";
import { GMMChart } from "@/components/visualizations/gmm-chart";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { generateGMMData, gmmStep, initializeGMM, type Point, type GMMState } from "@/lib/ml-algorithms";
import { Brain, Sparkles, Target, Waves } from "lucide-react";
import { FlipCard } from "@/components/flip-card";

export default function GMMPage() {
  useScrollReveal();

  const [points, setPoints] = useState<Point[]>(() => generateGMMData(90, 3));
  const [components, setComponents] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [state, setState] = useState<GMMState>(() => initializeGMM(points, components));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
  const snapToStep = (value: number, step: number) => Math.round(value / step) * step;

  const applyPreset = (preset: "balanced" | "dense" | "spread") => {
    if (preset === "balanced") {
      setComponents(3);
      return;
    }
    if (preset === "dense") {
      setComponents(4);
      return;
    }
    setComponents(2);
  };

  const randomize = () => {
    setComponents(snapToStep(randomBetween(2, 5), 1));
  };

  useEffect(() => {
    setPoints(generateGMMData(90, components));
  }, [components]);

  useEffect(() => {
    setState(initializeGMM(points, components));
    setIsPlaying(false);
  }, [points, components]);

  const step = useCallback(() => {
    setState((prev) => gmmStep(points, prev));
  }, [points]);

  // Optimized animation loop
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let lastStepTime = Date.now();
    const stepDelay = 700; // ms between steps
    let frameId: number | null = null;

    const animate = () => {
      const now = Date.now();
      if (now - lastStepTime >= stepDelay) {
        step();
        lastStepTime = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, step]);

  return (
    <div className="min-h-screen">
      <TopBar title="GMM Lab" subtitle="Gaussian Mixture Models with EM" />

      <div className="space-y-2 sm:space-y-3 md:space-y-6 p-2 sm:p-3 md:p-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 scroll-reveal" data-reveal>
          <StatsCard
            label="Components"
            value={components}
            icon={<Target className="h-5 w-5" />}
            color="primary"
          />
          <StatsCard
            label="Iteration"
            value={state.iteration}
            icon={<Waves className="h-5 w-5" />}
            color="accent"
          />
          <StatsCard
            label="Log Likelihood"
            value={state.logLikelihood}
            icon={<Brain className="h-5 w-5" />}
            color="default"
          />
          <StatsCard
            label="Samples"
            value={points.length}
            icon={<Sparkles className="h-5 w-5" />}
            color="default"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3 scroll-reveal" data-reveal>
          <div className="xl:col-span-2 w-full overflow-x-hidden">
            <div className="w-full max-w-full overflow-hidden">
              <GMMChart points={points} state={state} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-6">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Lab
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
                  onClick={() => applyPreset("balanced")}
                  className="h-8"
                >
                  Balanced Mix
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("dense")}
                  className="h-8"
                >
                  Dense Clusters
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset("spread")}
                  className="h-8"
                >
                  Wide Spread
                </Button>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                Mini challenge: Increase log-likelihood in 5 steps without changing k.
              </div>
            </div>

            <ControlPanel
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStep={step}
              onReset={() => {
                setState(initializeGMM(points, components));
                setIsPlaying(false);
              }}
              sliders={[
                {
                  label: "Components (k)",
                  value: components,
                  min: 2,
                  max: 5,
                  step: 1,
                  onChange: setComponents,
                },
              ]}
            />

            <ExplanationPanel
              title="Why GMM matters"
              whatChanged="GMM assigns soft probabilities to each cluster using EM."
              whyItChanged="Each EM step improves likelihood by refining means and variances."
              conceptualMeaning="Useful for overlapping clusters and probabilistic modeling."
              algorithmColor="tree"
            />
          </div>
        </div>

        <section className="scroll-reveal" data-reveal>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How To Use</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">GMM step-by-step</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                Goal: stabilize log-likelihood
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">1) Choose k</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start with 2-3 components. Too many can overfit and slow convergence.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Watch how clusters overlap. If they bleed too much, raise k.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[170px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">2) Run EM</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Use Play to iterate. Step mode helps see how clusters shift each round.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If EM stalls early, hit Reset to randomize and re-run.
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
                      Log Likelihood should increase then stabilize. Reset if it stalls.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro tip</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Stable likelihood means clusters found a good probability fit.
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
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">GMM in detail</h2>
              </div>
              <div className="rounded-full border border-border bg-secondary px-4 py-1 text-xs text-muted-foreground">
                EM optimization with soft assignments
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      GMM models data as a weighted sum of Gaussians using EM.
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Why it works</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Soft assignments allow overlap where k-means fails.
                    </p>
                  </div>
                }
              />
              <FlipCard
                className="min-h-[190px]"
                front={
                  <div className="h-full rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Core equation</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      p(x) = sum_k pi_k * N(x | mu_k, Sigma_k)
                    </p>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">EM flow</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      E-step: responsibilities. M-step: update means, variances, weights.
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
                      <li>Gaussian clusters</li>
                      <li>k is fixed</li>
                      <li>Continuous data</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">When it fails</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Poor initialization can trap EM. Reset or reduce k.
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
                      <li>Higher k captures complexity</li>
                      <li>Too much k can overfit</li>
                      <li>Reset if it stalls</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Quick test</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try k=3 then compare log-likelihood improvements.
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
                      <li>Pros: soft clusters</li>
                      <li>Cons: needs k</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Alternate</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      For unknown k, combine with BIC or AIC selection.
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
                      <li>Speaker clustering</li>
                      <li>Anomaly scoring</li>
                      <li>Density estimation</li>
                    </ul>
                  </div>
                }
                back={
                  <div className="h-full rounded-xl border border-border/60 bg-background/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Example</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Estimate distribution then sample new points from the model.
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
