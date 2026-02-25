"use client";

import { useMemo, useRef, useState, memo } from "react";
import { Line, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";
import type { Point, PCAResult } from "@/lib/ml-algorithms";

interface PCAChartProps {
  points: Point[];
  result: PCAResult;
  width?: number;
  height?: number;
}

function PCAChartComponent({ points, result, width = 620, height = 420 }: PCAChartProps) {
  const colors = useThemeColors();

  const pointVectors = useMemo(
    () => points.map((point) => scalePoint(point.x, point.y, [0, 100], [0, 100], 45)),
    [points]
  );

  const projectedVectors = useMemo(
    () => result.projected.map((point) => scalePoint(point.x, point.y, [0, 100], [0, 100], 45)),
    [result.projected]
  );

  const directionLine = useMemo(() => {
    const lineLen = 80;
    const start = {
      x: result.mean.x - result.direction.x * lineLen,
      y: result.mean.y - result.direction.y * lineLen,
    };
    const end = {
      x: result.mean.x + result.direction.x * lineLen,
      y: result.mean.y + result.direction.y * lineLen,
    };
    return [
      scalePoint(start.x, start.y, [0, 100], [0, 100], 45),
      scalePoint(end.x, end.y, [0, 100], [0, 100], 45),
    ];
  }, [result]);

  return (
    <div className="space-y-3">
      <ChartShell height={height} axisSize={48} showAxes={true} showAxisLabels={true} showZAxis={true} axisLabels={{ x: "PC1", y: "PC2", z: "PC3" }}>
        <PCAContent
          points={points}
          pointVectors={pointVectors}
          projectedVectors={projectedVectors}
          directionLine={directionLine}
          colors={colors}
        />
      </ChartShell>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/80 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-1" />
          <span>Original</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-3" />
          <span>Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-chart-2" />
          <span>PC1</span>
        </div>
      </div>
    </div>
  );
}

export const PCAChart = memo(PCAChartComponent);

interface PCAContentProps {
  points: Point[];
  pointVectors: [number, number, number][];
  projectedVectors: [number, number, number][];
  directionLine: [number, number, number][];
  colors: ReturnType<typeof useThemeColors>;
}

function PCAContentComponent({ points, pointVectors, projectedVectors, directionLine, colors }: PCAContentProps) {
  const chart1 = `rgb(${colors.chart1.replace(/ /g, ', ')})`;
  const chart2 = `rgb(${colors.chart2.replace(/ /g, ', ')})`;
  const chart3 = `rgb(${colors.chart3.replace(/ /g, ', ')})`;
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
      const lift = Math.sin(t * 1.2 + phases[idx]) * 0.6;
      mesh.position.set(base[0], base[1] + lift, base[2]);
    });
  });

  return (
    <group>
      {pointVectors.map((position, idx) => {
        const projected = projectedVectors[idx];
        const isSelected = selected === idx;
        const isDimmed = selected !== null && !isSelected;
        const opacity = isDimmed ? 0.25 : 1.0;
        return (
          <group key={`pca-point-${idx}`}>
            <mesh
              position={position}
              castShadow
              ref={(el) => (meshRefs.current[idx] = el)}
              onPointerOver={() => setHovered(idx)}
              onPointerOut={() => setHovered((prev) => (prev === idx ? null : prev))}
              onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
            >
              <sphereGeometry args={[1.4, 8, 8]} />
              <meshStandardMaterial
                color={chart1}
                emissive={chart1}
                emissiveIntensity={isSelected ? 0.6 : 0.3}
                roughness={0.35}
                metalness={0.2}
                transparent
                opacity={opacity}
              />
            </mesh>
            {hovered === idx && (
              <Html position={[position[0], position[1] + 6, position[2]]} center style={{ pointerEvents: 'none' }} wrapperClass="overflow-hidden">
                <div className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] text-white/90 shadow-xl transition-opacity duration-700">
                  x: {points[idx]?.x.toFixed(1)} | y: {points[idx]?.y.toFixed(1)}
                </div>
              </Html>
            )}
            {projected && (
              <Line
                points={[position, projected]}
                color={chart2}
                transparent
                opacity={isDimmed ? 0.15 : 0.5}
                lineWidth={1.5}
              />
            )}
          </group>
        );
      })}

      {projectedVectors.map((position, idx) => (
        <mesh position={position} key={`pca-proj-${idx}`} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={chart3} emissive={chart3} emissiveIntensity={0.3} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}

      <Line points={directionLine} color={chart2} lineWidth={3.5} />
    </group>
  );
}

const PCAContent = memo(PCAContentComponent);
