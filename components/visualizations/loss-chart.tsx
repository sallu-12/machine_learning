"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";

interface LossChartProps {
  lossHistory: number[];
  width?: number;
  height?: number;
}

export function LossChart({
  lossHistory,
  width = 400,
  height = 200,
}: LossChartProps) {
  const colors = useThemeColors();

  const linePoints = useMemo(() => {
    if (lossHistory.length === 0) return [];
    const maxLoss = Math.max(...lossHistory.filter((l) => Number.isFinite(l)), 1);
    return lossHistory.map((loss, idx) =>
      scalePoint(idx, loss, [0, Math.max(lossHistory.length - 1, 1)], [0, maxLoss], 40)
    );
  }, [lossHistory]);

  const chart1 = `rgb(${colors.chart1.replace(/ /g, ', ')})`;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-medium text-foreground">Loss Curve (MSE)</h4>
      <ChartShell height={height} axisSize={48} showAxes={true} showAxisLabels={true} axisLabels={{ x: "Iteration", y: "Loss" }}>
        <group>
          {linePoints.length > 1 && (
            <Line points={linePoints} color={chart1} lineWidth={2.5} />
          )}
          {linePoints.length > 0 && (
            <mesh position={linePoints[linePoints.length - 1]} castShadow>
              <sphereGeometry args={[1.8, 8, 8]} />
              <meshStandardMaterial color={chart1} emissive={chart1} emissiveIntensity={0.3} roughness={0.35} metalness={0.1} />
            </mesh>
          )}
        </group>
      </ChartShell>
    </div>
  );
}
