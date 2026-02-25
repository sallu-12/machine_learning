"use client";

import { useMemo, useRef, useState } from "react";
import { Line, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";
import type { Point, GMMState } from "@/lib/ml-algorithms";

interface GMMChartProps {
  points: Point[];
  state: GMMState;
  width?: number;
  height?: number;
}

export function GMMChart({ points, state, width = 600, height = 420 }: GMMChartProps) {
  const colors = useThemeColors();

  const palette = useMemo(
    () => [
      `rgb(${colors.chart1.replace(/ /g, ', ')})`,
      `rgb(${colors.chart2.replace(/ /g, ', ')})`,
      `rgb(${colors.chart3.replace(/ /g, ', ')})`,
      `rgb(${colors.chart4.replace(/ /g, ', ')})`,
      `rgb(${colors.chart5.replace(/ /g, ', ')})`,
    ],
    [colors]
  );

  const pointVectors = useMemo(
    () => points.map((point) => scalePoint(point.x, point.y, [0, 100], [0, 100], 45)),
    [points]
  );

  const meanVectors = useMemo(
    () => state.means.map((mean) => scalePoint(mean.x, mean.y, [0, 100], [0, 100], 45)),
    [state.means]
  );

  const ellipsePoints = (mean: Point, variance: Point, steps = 64) => {
    const rx = Math.sqrt(variance.x) * 0.6;
    const ry = Math.sqrt(variance.y) * 0.6;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const theta = (i / steps) * Math.PI * 2;
      const x = mean.x + Math.cos(theta) * rx;
      const y = mean.y + Math.sin(theta) * ry;
      return scalePoint(x, y, [0, 100], [0, 100], 45);
    });
  };

  return (
    <div className="space-y-3">
      <ChartShell height={height} axisSize={48} showAxes={true} showAxisLabels={true} axisLabels={{ x: "Feature 1", y: "Feature 2" }}>
        <GMMContent
          pointVectors={pointVectors}
          meanVectors={meanVectors}
          state={state}
          palette={palette}
          ellipsePoints={ellipsePoints}
        />
      </ChartShell>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/80 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-1" />
          <span>Points</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-2" />
          <span>Means</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-chart-3" />
          <span>Variance</span>
        </div>
      </div>
    </div>
  );
}

interface GMMContentProps {
  pointVectors: [number, number, number][];
  meanVectors: [number, number, number][];
  state: GMMState;
  palette: string[];
  ellipsePoints: (mean: Point, variance: Point, steps?: number) => [number, number, number][];
}

function GMMContent({ pointVectors, meanVectors, state, palette, ellipsePoints }: GMMContentProps) {
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
      const lift = Math.sin(t * 1.1 + phases[idx]) * 0.5;
      mesh.position.set(base[0], base[1] + lift, base[2]);
    });
  });

  return (
    <>
      <group>
        {pointVectors.map((position, idx) => {
          const clusterId = state.assignments[idx] ?? 0;
          const color = palette[clusterId % palette.length];
          const isSelected = selected === idx;
          const isDimmed = selected !== null && !isSelected;
          const opacity = isDimmed ? 0.2 : 1.0;
          return (
            <mesh
              position={position}
              key={`gmm-point-${idx}`}
              castShadow
              ref={(el) => (meshRefs.current[idx] = el)}
              onPointerOver={() => setHovered(idx)}
              onPointerOut={() => setHovered((prev) => (prev === idx ? null : prev))}
              onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
            >
              <sphereGeometry args={[1.3, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 0.6 : 0.3}
                roughness={0.4}
                metalness={0.15}
                transparent
                opacity={opacity}
              />
            </mesh>
          );
        })}

        {meanVectors.map((position, idx) => {
          const color = palette[idx % palette.length];
          return (
            <mesh position={position} key={`gmm-mean-${idx}`} castShadow>
              <sphereGeometry args={[2.2, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} metalness={0.2} />
            </mesh>
          );
        })}

        {state.means.map((mean, idx) => {
          const variance = state.variances[idx] || { x: 50, y: 50 };
          const color = palette[idx % palette.length];
          return (
            <Line
              key={`gmm-ellipse-${idx}`}
              points={ellipsePoints(mean, variance)}
              color={color}
              transparent
              opacity={0.7}
              lineWidth={2}
            />
          );
        })}
      </group>
      {hovered !== null && (
        <Html position={[pointVectors[hovered][0], pointVectors[hovered][1] + 6, 0]} center style={{ pointerEvents: 'none' }} wrapperClass="overflow-hidden">
          <div className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] text-white/90 shadow-xl transition-opacity duration-700">
            Prob cluster: {(state.assignments[hovered] ?? 0) + 1}
          </div>
        </Html>
      )}
    </>
  );
}
