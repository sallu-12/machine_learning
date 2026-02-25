"use client";

import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";
import type { Point } from "@/lib/ml-algorithms";

interface DBSCANChartProps {
  points: Point[];
  assignments: number[];
  width?: number;
  height?: number;
}

export function DBSCANChart({ points, assignments, width = 600, height = 420 }: DBSCANChartProps) {
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

  const noiseColor = useMemo(() => "rgb(210 210 210)", []);

  const pointVectors = useMemo(
    () => points.map((point) => scalePoint(point.x, point.y, [0, 100], [0, 100], 45)),
    [points]
  );

  return (
    <div className="space-y-3">
      <ChartShell height={height} axisSize={48} showAxes={true} showAxisLabels={true} axisLabels={{ x: "Feature 1", y: "Feature 2" }}>
        <DBSCANContent
          pointVectors={pointVectors}
          assignments={assignments}
          palette={palette}
          noiseColor={noiseColor}
        />
      </ChartShell>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/80 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-2" />
          <span>Clusters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span>Noise</span>
        </div>
      </div>
    </div>
  );
}

interface DBSCANContentProps {
  pointVectors: [number, number, number][];
  assignments: number[];
  palette: string[];
  noiseColor: string;
}

function DBSCANContent({ pointVectors, assignments, palette, noiseColor }: DBSCANContentProps) {
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
    <group>
      {pointVectors.map((position, idx) => {
        const clusterId = assignments[idx];
        const color = clusterId >= 0 ? palette[clusterId % palette.length] : noiseColor;
        const size = clusterId >= 0 ? 1.7 : 1.2;
        const isSelected = selected === idx;
        const isDimmed = selected !== null && !isSelected;
        const opacity = isDimmed ? 0.2 : 1.0;

        return (
          <mesh
            position={position}
            key={`dbscan-point-${idx}`}
            castShadow
            ref={(el) => (meshRefs.current[idx] = el)}
            onPointerOver={() => setHovered(idx)}
            onPointerOut={() => setHovered((prev) => (prev === idx ? null : prev))}
            onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
          >
            <sphereGeometry args={[size, 8, 8]} />
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
      {hovered !== null && (
        <Html position={[pointVectors[hovered][0], pointVectors[hovered][1] + 6, 0]} center style={{ pointerEvents: 'none' }} wrapperClass="overflow-hidden">
          <div className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] text-white/90 shadow-xl transition-opacity duration-700">
            Cluster: {assignments[hovered] >= 0 ? assignments[hovered] + 1 : "Noise"}
          </div>
        </Html>
      )}
    </group>
  );
}
