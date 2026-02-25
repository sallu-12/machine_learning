"use client";

import { useMemo, useRef, useState } from "react";
import { Line, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";
import type { Point, RegressionState } from "@/lib/ml-algorithms";

interface RegressionChartProps {
  points: Point[];
  state: RegressionState;
  width?: number;
  height?: number;
}

export function RegressionChart({
  points,
  state,
  width = 600,
  height = 400,
}: RegressionChartProps) {
  const colors = useThemeColors();

  const ranges = useMemo(() => {
    if (points.length === 0) {
      return {
        rangeX: [0, 100] as [number, number],
        rangeY: [0, 180] as [number, number],
      };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    const lineY1 = state.slope * minX + state.intercept;
    const lineY2 = state.slope * maxX + state.intercept;
    minY = Math.min(minY, lineY1, lineY2);
    maxY = Math.max(maxY, lineY1, lineY2);

    const padX = Math.max(8, (maxX - minX) * 0.08);
    const padY = Math.max(12, (maxY - minY) * 0.1);
    return {
      rangeX: [minX - padX, maxX + padX] as [number, number],
      rangeY: [minY - padY, maxY + padY] as [number, number],
    };
  }, [points, state.intercept, state.slope]);

  const pointVectors = useMemo(
    () => points.map((point) => scalePoint(point.x, point.y, ranges.rangeX, ranges.rangeY, 50)),
    [points, ranges]
  );

  const regressionLine = useMemo(() => {
    const xMin = ranges.rangeX[0];
    const xMax = ranges.rangeX[1];
    const y1 = state.slope * xMin + state.intercept;
    const y2 = state.slope * xMax + state.intercept;
    return [
      scalePoint(xMin, y1, ranges.rangeX, ranges.rangeY, 50),
      scalePoint(xMax, y2, ranges.rangeX, ranges.rangeY, 50),
    ];
  }, [ranges, state]);

  const residualLines = useMemo(() => {
    if (state.iteration === 0) return [] as Array<[[number, number, number], [number, number, number]]>;
    return points.map((point) => {
      const predicted = state.slope * point.x + state.intercept;
      return [
        scalePoint(point.x, point.y, ranges.rangeX, ranges.rangeY, 50),
        scalePoint(point.x, predicted, ranges.rangeX, ranges.rangeY, 50),
      ];
    });
  }, [points, ranges, state]);

  const chart1 = `rgb(${colors.chart1.replace(/ /g, ', ')})`;
  const chart2 = `rgb(${colors.chart2.replace(/ /g, ', ')})`;
  const chart4 = `rgb(${colors.chart4.replace(/ /g, ', ')})`;

  return (
    <div className="space-y-3">
      <ChartShell height={height} axisSize={48} showAxes={true} showAxisLabels={true} axisLabels={{ x: "X", y: "Y" }}>
        <RegressionContent
          points={points}
          pointVectors={pointVectors}
          regressionLine={regressionLine}
          residualLines={residualLines}
          iteration={state.iteration}
          chart1={chart1}
          chart2={chart2}
          chart4={chart4}
        />
      </ChartShell>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/80 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-1" />
          <span>Data Points</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-chart-2" />
          <span>Best Fit Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t border-dashed border-chart-4" />
          <span>Residuals</span>
        </div>
      </div>
    </div>
  );
}

interface RegressionContentProps {
  points: Point[];
  pointVectors: [number, number, number][];
  regressionLine: [number, number, number][];
  residualLines: Array<[[number, number, number], [number, number, number]]>;
  iteration: number;
  chart1: string;
  chart2: string;
  chart4: string;
}

function RegressionContent({
  points,
  pointVectors,
  regressionLine,
  residualLines,
  iteration,
  chart1,
  chart2,
  chart4,
}: RegressionContentProps) {
  const meshRefs = useRef<any[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const phases = useMemo(
    () => pointVectors.map(() => Math.random() * Math.PI * 2),
    [pointVectors]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const base = pointVectors[idx];
      const lift = Math.sin(t * 1.15 + phases[idx]) * 0.5;
      mesh.position.set(base[0], base[1] + lift, base[2]);
    });
  });

  return (
    <>
      <group>
        {pointVectors.map((position, idx) => {
          const isSelected = selected === idx;
          const isDimmed = selected !== null && !isSelected;
          const opacity = isDimmed ? 0.2 : 1.0;
          return (
            <mesh
              position={position}
              key={`reg-point-${idx}`}
              castShadow
              ref={(el) => (meshRefs.current[idx] = el)}
              onPointerOver={() => setHovered(idx)}
              onPointerOut={() => setHovered((prev) => (prev === idx ? null : prev))}
              onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
            >
              <sphereGeometry args={[1.6, 8, 8]} />
              <meshStandardMaterial
                color={chart1}
                emissive={chart1}
                emissiveIntensity={isSelected ? 0.6 : 0.3}
                roughness={0.4}
                metalness={0.15}
                transparent
                opacity={opacity}
              />
            </mesh>
          );
        })}

        {iteration > 0 && <Line points={regressionLine} color={chart2} lineWidth={3.5} />}

        {iteration > 0 &&
          residualLines.map((line, idx) => (
            <Line
              key={`reg-residual-${idx}`}
              points={line}
              color={chart4}
              transparent
              opacity={0.55}
              lineWidth={1.5}
            />
          ))}
      </group>
      {hovered !== null && (
        <Html position={[pointVectors[hovered][0], pointVectors[hovered][1] + 6, 0]} center style={{ pointerEvents: 'none' }} wrapperClass="overflow-hidden">
          <div className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] text-white/90 shadow-xl transition-opacity duration-700">
            x: {points[hovered]?.x.toFixed(1)} | y: {points[hovered]?.y.toFixed(1)}
          </div>
        </Html>
      )}
    </>
  );
}
