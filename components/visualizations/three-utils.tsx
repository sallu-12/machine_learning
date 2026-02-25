"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, OrbitControls, Line, Html } from "@react-three/drei";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FALLBACK_RGB = {
  chart1: "56 189 248",
  chart2: "20 184 166",
  chart3: "250 204 21",
  chart4: "249 115 22",
  chart5: "217 70 239",
  primary: "56 189 248",
  accent: "250 204 21",
};

const COLOR_OPTIONS = [
  { key: "blue", label: "Blue", rgb: "56 189 248", background: "#0b1420" },
  { key: "teal", label: "Teal", rgb: "34 197 94", background: "#0b1714" },
  { key: "cyan", label: "Cyan", rgb: "34 211 238", background: "#07181b" },
  { key: "green", label: "Green", rgb: "74 222 128", background: "#0b1a12" },
  { key: "lime", label: "Lime", rgb: "163 230 53", background: "#141a08" },
  { key: "amber", label: "Amber", rgb: "250 204 21", background: "#1b1406" },
  { key: "orange", label: "Orange", rgb: "251 146 60", background: "#1c120a" },
  { key: "red", label: "Red", rgb: "248 113 113", background: "#1c0f12" },
  { key: "rose", label: "Rose", rgb: "244 114 182", background: "#1b0c14" },
  { key: "violet", label: "Violet", rgb: "168 85 247", background: "#140a1d" },
  { key: "indigo", label: "Indigo", rgb: "129 140 248", background: "#101322" },
  { key: "slate", label: "Slate", rgb: "148 163 184", background: "#0e1117" },
];

const COLOR_MAP = COLOR_OPTIONS.reduce<Record<string, { rgb: string; background: string }>>(
  (acc, option) => {
    acc[option.key] = { rgb: option.rgb, background: option.background };
    return acc;
  },
  {}
);

const parseRgb = (value: string) =>
  value
    .trim()
    .split(" ")
    .map((part) => Number(part || 0));

const mixRgb = (from: string, to: string, amount: number) => {
  const [r1, g1, b1] = parseRgb(from);
  const [r2, g2, b2] = parseRgb(to);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `${r} ${g} ${b}`;
};

const readRgbVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

const buildThemeColors = () => {
  const chart1 = readRgbVar("--chart-1-rgb", FALLBACK_RGB.chart1);
  const chart2 = readRgbVar("--chart-2-rgb", FALLBACK_RGB.chart2);
  const chart3 = readRgbVar("--chart-3-rgb", FALLBACK_RGB.chart3);
  const chart4 = readRgbVar("--chart-4-rgb", FALLBACK_RGB.chart4);
  const chart5 = readRgbVar("--chart-5-rgb", FALLBACK_RGB.chart5);
  const primary = readRgbVar("--primary-rgb", FALLBACK_RGB.primary);
  const accent = readRgbVar("--accent-rgb", FALLBACK_RGB.accent);

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("chart-color-keys");
      if (raw) {
        const parsed = JSON.parse(raw) as { chart?: string };
        if (parsed.chart && parsed.chart !== "default" && COLOR_MAP[parsed.chart]) {
          const override = COLOR_MAP[parsed.chart].rgb;
          return {
            chart1: override,
            chart2: override,
            chart3: override,
            chart4: override,
            chart5: override,
            primary,
            accent,
          };
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }

  return { chart1, chart2, chart3, chart4, chart5, primary, accent };
};

export function useThemeColors() {
  const [colors, setColors] = useState(buildThemeColors);

  useEffect(() => {
    const refresh = () => setColors(buildThemeColors());
    refresh();
    window.addEventListener("theme-change", refresh);
    window.addEventListener("chart-palette-sync", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("theme-change", refresh);
      window.removeEventListener("chart-palette-sync", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return colors;
}

export const scalePoint = (
  x: number,
  y: number,
  rangeX: [number, number],
  rangeY: [number, number],
  size = 45,
  clampToRange = true
) => {
  const dx = rangeX[1] - rangeX[0];
  const dy = rangeY[1] - rangeY[0];
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx === 0 || dy === 0) {
    return [0, 0, 0] as [number, number, number];
  }
  const rawX = (x - rangeX[0]) / dx;
  const rawY = (y - rangeY[0]) / dy;
  const nx = clampToRange ? Math.min(Math.max(rawX, 0), 1) : rawX;
  const ny = clampToRange ? Math.min(Math.max(rawY, 0), 1) : rawY;
  return [(nx - 0.5) * size * 2, (ny - 0.5) * size * 2, 0] as [number, number, number];
};

interface ChartShellProps {
  height?: number;
  className?: string;
  children: React.ReactNode;
  showControls?: boolean;
  axisSize?: number;
  axisInset?: number;
  showAxes?: boolean;
  showAxisLabels?: boolean;
  showZAxis?: boolean;
  axisLabels?: {
    x?: string;
    y?: string;
    z?: string;
  };
}

function AnimatedLight() {
  const lightRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.6;
    if (!lightRef.current) return;
    lightRef.current.position.x = Math.cos(t) * 60;
    lightRef.current.position.y = Math.sin(t) * 30;
    lightRef.current.position.z = 50 + Math.sin(t * 0.6) * 20;
    lightRef.current.intensity = 0.7 + Math.sin(t) * 0.2;
  });

  return <pointLight ref={lightRef} position={[40, 40, 60]} intensity={0.8} />;
}

export function ChartShell({
  height = 420,
  className,
  children,
  showControls = true,
  axisSize = 0.01,
  axisInset = 0.005,
  showAxes = true,
  showAxisLabels = true,
  showZAxis = false,
  axisLabels,
}: ChartShellProps) {
  const colors = useThemeColors();
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showFog, setShowFog] = useState(false);
  const [showShadows, setShowShadows] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cameraConfig = useMemo(() => {
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth < 1024;
    
    if (isMobile) {
      return { position: [0, 0, 160] as [number, number, number], fov: 75 };
    } else if (isTablet) {
      return { position: [0, 0, 145] as [number, number, number], fov: 55 };
    }
    return { position: [0, 0, 130] as [number, number, number], fov: 45 };
  }, [windowWidth]);
  const [paletteIndex, setPaletteIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem("chart-palette");
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  });
  const [applyChartColors, setApplyChartColors] = useState(() => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem("chart-palette-targets");
    if (!raw) return true;
    try {
      const parsed = JSON.parse(raw) as { chart?: boolean };
      return parsed.chart !== false;
    } catch {
      return true;
    }
  });
  const [applyGridColors, setApplyGridColors] = useState(() => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem("chart-palette-targets");
    if (!raw) return true;
    try {
      const parsed = JSON.parse(raw) as { grid?: boolean };
      return parsed.grid !== false;
    } catch {
      return true;
    }
  });
  const [applyBackground, setApplyBackground] = useState(() => {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem("chart-palette-targets");
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as { background?: boolean };
      return parsed.background === true;
    } catch {
      return false;
    }
  });
  const [chartColorKey, setChartColorKey] = useState<string>(() => {
    if (typeof window === "undefined") return "red";
    const raw = window.localStorage.getItem("chart-color-keys");
    if (!raw) return "red";
    try {
      const parsed = JSON.parse(raw) as { chart?: string };
      return parsed.chart || "red";
    } catch {
      return "red";
    }
  });
  const [gridColorKey, setGridColorKey] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    const raw = window.localStorage.getItem("chart-color-keys");
    if (!raw) return "default";
    try {
      const parsed = JSON.parse(raw) as { grid?: string };
      return parsed.grid || "default";
    } catch {
      return "default";
    }
  });
  const [backgroundColorKey, setBackgroundColorKey] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    const raw = window.localStorage.getItem("chart-color-keys");
    if (!raw) return "default";
    try {
      const parsed = JSON.parse(raw) as { background?: string };
      return parsed.background || "default";
    } catch {
      return "default";
    }
  });
  const basePaletteRef = useRef<null | { chart: string[]; chartRgb: string[] }>(null);
  const effectiveApplyChart = applyChartColors || chartColorKey !== "default";
  const effectiveApplyGrid = applyGridColors || gridColorKey !== "default";
  const effectiveApplyBackground = applyBackground || backgroundColorKey !== "default";
  const isSyncingRef = useRef(false);

  const customPalettes = useMemo(
    () => [
      {
        name: "Neon Wave",
        rgb: ["56 189 248", "34 197 94", "250 204 21", "248 113 113", "168 85 247"],
        background: "#0b1420",
      },
      {
        name: "Solar",
        rgb: ["251 146 60", "249 115 22", "253 224 71", "52 211 153", "59 130 246"],
        background: "#140d0b",
      },
    ],
    []
  );

  const colorOptions = useMemo(() => COLOR_OPTIONS, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (!basePaletteRef.current) {
      const styles = window.getComputedStyle(document.documentElement);
      basePaletteRef.current = {
        chart: [
          styles.getPropertyValue("--chart-1").trim(),
          styles.getPropertyValue("--chart-2").trim(),
          styles.getPropertyValue("--chart-3").trim(),
          styles.getPropertyValue("--chart-4").trim(),
          styles.getPropertyValue("--chart-5").trim(),
        ],
        chartRgb: [
          styles.getPropertyValue("--chart-1-rgb").trim(),
          styles.getPropertyValue("--chart-2-rgb").trim(),
          styles.getPropertyValue("--chart-3-rgb").trim(),
          styles.getPropertyValue("--chart-4-rgb").trim(),
          styles.getPropertyValue("--chart-5-rgb").trim(),
        ],
      };
    }
    if (!basePaletteRef.current) return;

    const applyPalette = (chartRgb: string[], chart: string[]) => {
      const pairs = [
        ["--chart-1", chart[0]],
        ["--chart-2", chart[1]],
        ["--chart-3", chart[2]],
        ["--chart-4", chart[3]],
        ["--chart-5", chart[4]],
        ["--chart-1-rgb", chartRgb[0]],
        ["--chart-2-rgb", chartRgb[1]],
        ["--chart-3-rgb", chartRgb[2]],
        ["--chart-4-rgb", chartRgb[3]],
        ["--chart-5-rgb", chartRgb[4]],
      ];
      pairs.forEach(([key, value]) => root.style.setProperty(key, value));
    };

    const totalPalettes = customPalettes.length + 1;
    const safeIndex = ((paletteIndex % totalPalettes) + totalPalettes) % totalPalettes;
    window.localStorage.setItem("chart-palette", String(safeIndex));
    window.localStorage.setItem(
      "chart-palette-targets",
      JSON.stringify({
        chart: effectiveApplyChart,
        grid: effectiveApplyGrid,
        background: effectiveApplyBackground,
      })
    );
    window.localStorage.setItem(
      "chart-color-keys",
      JSON.stringify({ chart: chartColorKey, grid: gridColorKey, background: backgroundColorKey })
    );
    window.dispatchEvent(new Event("chart-palette-sync"));

    const paletteRgb =
      safeIndex === 0
        ? basePaletteRef.current.chartRgb
        : customPalettes[safeIndex - 1].rgb;
    const paletteChart = paletteRgb.map((value) => `rgb(${value})`);

    if (effectiveApplyChart) {
      if (chartColorKey === "default") {
        applyPalette(paletteRgb, paletteChart);
      } else {
        const chosen = COLOR_MAP[chartColorKey] || COLOR_MAP.blue;
        const rgb = [chosen.rgb, chosen.rgb, chosen.rgb, chosen.rgb, chosen.rgb];
        const chart = rgb.map((value) => `rgb(${value})`);
        applyPalette(rgb, chart);
      }
    } else {
      applyPalette(basePaletteRef.current.chartRgb, basePaletteRef.current.chart);
    }

    window.dispatchEvent(new Event("theme-change"));
  }, [
    applyBackground,
    applyChartColors,
    applyGridColors,
    backgroundColorKey,
    chartColorKey,
    colorOptions,
    customPalettes,
    gridColorKey,
    paletteIndex,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        const storedPalette = Number(window.localStorage.getItem("chart-palette"));
        if (Number.isFinite(storedPalette)) {
          setPaletteIndex(storedPalette);
        }

        const targetRaw = window.localStorage.getItem("chart-palette-targets");
        if (targetRaw) {
          const parsed = JSON.parse(targetRaw) as { chart?: boolean; grid?: boolean; background?: boolean };
          if (typeof parsed.chart === "boolean") setApplyChartColors(parsed.chart);
          if (typeof parsed.grid === "boolean") setApplyGridColors(parsed.grid);
          if (typeof parsed.background === "boolean") setApplyBackground(parsed.background);
        }

        const keyRaw = window.localStorage.getItem("chart-color-keys");
        if (keyRaw) {
          const parsed = JSON.parse(keyRaw) as { chart?: string; grid?: string; background?: string };
          if (parsed.chart) setChartColorKey(parsed.chart);
          if (parsed.grid) setGridColorKey(parsed.grid);
          if (parsed.background) setBackgroundColorKey(parsed.background);
        }
      } catch {
        // Ignore malformed storage
      } finally {
        isSyncingRef.current = false;
      }
    };

    sync();
    window.addEventListener("chart-palette-sync", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("chart-palette-sync", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const activePaletteRgb = useMemo(() => {
    if (!basePaletteRef.current) return [colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5];
    const totalPalettes = customPalettes.length + 1;
    const safeIndex = ((paletteIndex % totalPalettes) + totalPalettes) % totalPalettes;
    return safeIndex === 0 ? basePaletteRef.current.chartRgb : customPalettes[safeIndex - 1].rgb;
  }, [colors, customPalettes, paletteIndex]);

  const gridColors = useMemo(() => {
    let base = "170 170 170";
    if (effectiveApplyGrid) {
      if (gridColorKey === "default") {
        base = activePaletteRgb[0];
      } else {
        const chosen = COLOR_MAP[gridColorKey] || COLOR_MAP.slate;
        base = chosen.rgb;
      }
    }
    const cell = mixRgb(base, "255 255 255", 0.5);
    const section = mixRgb(base, "255 255 255", 0.3);
    return { cell: `rgb(${cell})`, section: `rgb(${section})` };
  }, [activePaletteRgb, colorOptions, effectiveApplyGrid, gridColorKey]);

  const axisMetrics = useMemo(() => {
    const min = -axisSize + axisInset;
    const max = axisSize - axisInset;
    const length = Math.max(1, max - min);
    return { min, max, length };
  }, [axisInset, axisSize]);

  const axisColorX = useMemo(() => 
    applyGridColors ? gridColors.section : `rgb(${colors.chart1.replace(/ /g, ', ')})`,
    [applyGridColors, gridColors.section, colors.chart1]
  );
  const axisColorY = useMemo(() => 
    applyGridColors ? gridColors.section : `rgb(${colors.chart2.replace(/ /g, ', ')})`,
    [applyGridColors, gridColors.section, colors.chart2]
  );
  const axisColorZ = useMemo(() => 
    applyGridColors ? gridColors.section : `rgb(${colors.chart3.replace(/ /g, ', ')})`,
    [applyGridColors, gridColors.section, colors.chart3]
  );

  const labels = useMemo(() => ({
    x: axisLabels?.x ?? "X",
    y: axisLabels?.y ?? "Y",
    z: axisLabels?.z ?? "Z",
  }), [axisLabels]);
  const chartBackground = useMemo(() => {
    if (!effectiveApplyBackground) return "#0b0f1a";
    if (backgroundColorKey !== "default") {
      const chosen = COLOR_MAP[backgroundColorKey] || COLOR_MAP.slate;
      return chosen.background;
    }
    const totalPalettes = customPalettes.length + 1;
    const safeIndex = ((paletteIndex % totalPalettes) + totalPalettes) % totalPalettes;
    return safeIndex === 0 ? "#0b0f1a" : customPalettes[safeIndex - 1].background;
  }, [backgroundColorKey, colorOptions, customPalettes, effectiveApplyBackground, paletteIndex]);

  const gridConfig = useMemo(() => {
    const cellSize = Math.max(6, Math.round(axisSize / 6));
    const sectionSize = Math.max(cellSize * 4, Math.round(axisSize / 2));
    const fadeDistance = axisSize * 2.2;
    return { cellSize, sectionSize, fadeDistance };
  }, [axisSize]);

  const axisDepth = 0.6;

  const resetView = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
    controlsRef.current.update();
  };

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border p-2 shadow-[0_25px_80px_rgba(5,8,16,0.45)]",
        className
      )}
      style={{ backgroundColor: chartBackground, contain: 'layout paint' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(62,100,255,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,255,210,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27 viewBox=%270 0 160 160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%271%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E')" }} />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
      {showControls && (
        <>
          <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 md:right-3 md:top-3 z-10 flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate((prev) => !prev)}
              className="h-6 sm:h-7 md:h-8 border-border bg-white/10 text-[9px] sm:text-xs text-white hover:bg-white/15 px-1.5 sm:px-2 md:px-3"
            >
              {autoRotate ? "Auto: On" : "Auto: Off"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFog((prev) => !prev)}
              className="h-6 sm:h-7 md:h-8 border-border bg-white/10 text-[9px] sm:text-xs text-white hover:bg-white/15 px-1.5 sm:px-2 md:px-3"
            >
              {showFog ? "Fog: On" : "Fog: Off"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Color Picker - Change chart colors"
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-border bg-white/10 text-white hover:bg-white/15"
                >
                  <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Change</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={applyChartColors}
                  onCheckedChange={(value) => setApplyChartColors(Boolean(value))}
                >
                  Dots + Lines
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Default palette</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={String(paletteIndex)}
                  onValueChange={(value) => setPaletteIndex(Number(value))}
                >
                  <DropdownMenuRadioItem value="0">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-border bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3" />
                      <span>Default</span>
                    </div>
                  </DropdownMenuRadioItem>
                  {customPalettes.map((palette, idx) => (
                    <DropdownMenuRadioItem key={palette.name} value={String(idx + 1)}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 gap-0.5">
                          {palette.rgb.slice(0, 3).map((color, i) => (
                            <div 
                              key={i}
                              className="h-4 w-1.5 rounded-sm" 
                              style={{ backgroundColor: `rgb(${color})` }}
                            />
                          ))}
                        </div>
                        <span>{palette.name}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {applyChartColors && (
                  <>
                    <DropdownMenuLabel>Dots + Lines color</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={chartColorKey}
                      onValueChange={(value) => {
                        setApplyChartColors(true);
                        setChartColorKey(value);
                      }}
                    >
                      <DropdownMenuRadioItem value="default">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border border-border bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3" />
                          <span>Default</span>
                        </div>
                      </DropdownMenuRadioItem>
                      {colorOptions.map((option) => (
                        <DropdownMenuRadioItem key={`chart-${option.key}`} value={option.key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-4 w-4 rounded border border-border" 
                              style={{ backgroundColor: `rgb(${option.rgb})` }}
                            />
                            <span>{option.label}</span>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetView}
              className="h-6 sm:h-7 md:h-8 border-border bg-white/10 text-[9px] sm:text-xs text-white hover:bg-white/15 px-1.5 sm:px-2 md:px-3"
            >
              Reset View
            </Button>
          </div>
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-4 text-[8px] sm:text-[9px] md:text-xs text-white/60">
            <span className="hidden sm:inline">Drag to rotate, scroll to zoom</span>
            <span className="sm:hidden">Drag/Zoom</span>
          </div>
        </>
      )}
      <div className="h-full overflow-hidden rounded-xl" style={{ height: typeof height === 'number' ? `${Math.min(height, typeof window !== 'undefined' && window.innerWidth < 640 ? window.innerHeight * 0.4 : height)}px` : height, position: 'relative', minHeight: typeof window !== 'undefined' && window.innerWidth < 640 ? '250px' : '350px', maxHeight: typeof window !== 'undefined' && window.innerWidth < 640 ? '350px' : undefined, width: '100%' }}>
        <div className="absolute inset-0 overflow-visible rounded-xl" style={{ padding: '24px 20px 18px 22px' }}>
          <Canvas
            camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
            dpr={windowWidth < 640 ? [1, 1.5] : [1, 2]}
            shadows={showShadows}
            gl={{ 
              antialias: true,
              alpha: true,
              precision: 'highp',
              powerPreference: "high-performance",
              localClippingEnabled: true,
              logarithmicDepthBuffer: false
            }}
            frameloop="demand"
            style={{ display: 'block', width: 'calc(100% - 4px)', height: 'calc(100% - 4px)', borderRadius: '0.5rem', margin: '2px' }}
            onCreated={({ gl, size }) => {
              gl.setScissorTest(false);
              const maxDPR = windowWidth < 640 ? 1.5 : 2;
              gl.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
            }}
          >
          <color attach="background" args={[chartBackground]} />
          {showFog && <fog attach="fog" args={[chartBackground, 40, 190]} />}
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[30, 35, 35]}
            intensity={1.3}
            castShadow={showShadows}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <Environment preset="city" />
          <mesh position={[0, -65, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#0e1322" roughness={0.9} metalness={0} />
          </mesh>
          {showGrid && (
            <Grid
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              cellSize={gridConfig.cellSize}
              sectionSize={gridConfig.sectionSize}
              cellThickness={0.4}
              sectionThickness={0.8}
              fadeDistance={gridConfig.fadeDistance}
              fadeStrength={1}
              cellColor={gridColors.cell}
              sectionColor={gridColors.section}
            />
          )}
          {showShadows && (
            <ContactShadows position={[0, -65, 0]} opacity={0.45} blur={2.4} far={40} />
          )}
          {showAxes && (
            <>
              <Line
                points={[
                  [axisMetrics.min, axisMetrics.min, axisDepth],
                  [axisMetrics.max, axisMetrics.min, axisDepth],
                ]}
                color={axisColorX}
                lineWidth={3}
                transparent
                opacity={1}
              />
              <Line
                points={[
                  [axisMetrics.min, axisMetrics.min, axisDepth],
                  [axisMetrics.min, axisMetrics.max, axisDepth],
                ]}
                color={axisColorY}
                lineWidth={3}
                transparent
                opacity={1}
              />
              {showZAxis && (
                <Line
                  points={[
                    [axisMetrics.min, axisMetrics.min, axisDepth],
                    [axisMetrics.min, axisMetrics.min, axisMetrics.length + axisDepth],
                  ]}
                  color={axisColorZ}
                  lineWidth={3}
                  transparent
                  opacity={1}
                />
              )}
              {showAxisLabels && (
                <>
                  <Html position={[axisMetrics.max - 2, axisMetrics.min + 2, axisDepth]} center style={{ pointerEvents: 'none', userSelect: 'none' }} wrapperClass="overflow-visible">
                    <span className="rounded bg-black/70 px-2 py-1 text-[11px] sm:text-xs font-medium text-white/80 whitespace-nowrap">
                      {labels.x}
                    </span>
                  </Html>
                  <Html position={[axisMetrics.min + 2, axisMetrics.max - 2, axisDepth]} center style={{ pointerEvents: 'none', userSelect: 'none' }} wrapperClass="overflow-visible">
                    <span className="rounded bg-black/70 px-2 py-1 text-[11px] sm:text-xs font-medium text-white/80 whitespace-nowrap">
                      {labels.y}
                    </span>
                  </Html>
                  {showZAxis && (
                    <Html position={[axisMetrics.min + 2, axisMetrics.min + 2, axisMetrics.length + axisDepth - 2]} center style={{ pointerEvents: 'none', userSelect: 'none' }} wrapperClass="overflow-visible">
                      <span className="rounded bg-black/70 px-2 py-1 text-[11px] sm:text-xs font-medium text-white/80 whitespace-nowrap">
                        {labels.z}
                      </span>
                    </Html>
                  )}
                </>
              )}
            </>
          )}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            maxDistance={220}
            minDistance={60}
            enableDamping
            dampingFactor={0.15}
            autoRotate={autoRotate}
            autoRotateSpeed={0.65}
          />
          {children}
        </Canvas>
        </div>
      </div>
    </div>
  );
}
