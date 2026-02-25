"use client";

import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import { ChartShell, scalePoint, useThemeColors } from "@/components/visualizations/three-utils";
import type { TreeNode } from "@/lib/ml-algorithms";

interface DecisionTreeChartProps {
  root: TreeNode | null;
  width?: number;
  height?: number;
}

interface NodePosition {
  node: TreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

const normalizeRiskLabel = (value: string) => {
  const cleaned = value.trim().toLowerCase();
  if (cleaned === "low" || cleaned === "lowrisk" || cleaned === "low risk") return "Low Risk";
  if (cleaned === "medium" || cleaned === "med" || cleaned === "mediumrisk" || cleaned === "medium risk") {
    return "Medium Risk";
  }
  if (cleaned === "high" || cleaned === "highrisk" || cleaned === "high risk") return "High Risk";
  return value;
};

export function DecisionTreeChart({
  root,
  width = 600,
  height = 400,
}: DecisionTreeChartProps) {
  const colors = useThemeColors();

  const positions = useMemo(() => {
    if (!root) return [] as NodePosition[];

    const padding = 40;
    const nodeRadius = 30;
    const verticalSpacing = 80;
    const nodes: NodePosition[] = [];

    const calculatePositions = (
      node: TreeNode,
      x: number,
      y: number,
      level: number,
      parentX?: number,
      parentY?: number
    ) => {
      nodes.push({ node, x, y, parentX, parentY });
      const childOffset = (width - padding * 2) / Math.pow(2, level + 2);
      if (node.left) {
        calculatePositions(node.left, x - childOffset, y + verticalSpacing, level + 1, x, y);
      }
      if (node.right) {
        calculatePositions(node.right, x + childOffset, y + verticalSpacing, level + 1, x, y);
      }
    };

    calculatePositions(root, width / 2, padding + nodeRadius, 0);
    return nodes;
  }, [root, width]);

  const leafOffsets = useMemo(() => {
    const leaves = positions.filter(({ node }) => node.value !== undefined);
    leaves.sort((a, b) => a.x - b.x);
    const total = leaves.length;
    const center = (total - 1) / 2;
    return new Map(
      leaves.map(({ node }, idx) => [
        node,
        {
          dx: (idx - center) * 8,
          dy: idx % 2 === 0 ? 12 : 18,
        },
      ])
    );
  }, [positions]);

  const toScene = (x: number, y: number) =>
    scalePoint(x, height - y, [0, width], [0, height], 55);

  if (!root) {
    return (
      <ChartShell height={height} axisSize={55} showAxes={false} showAxisLabels={false}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial opacity={0} transparent />
        </mesh>
      </ChartShell>
    );
  }

  return (
    <ChartShell height={height} axisSize={55} showAxes={false} showAxisLabels={false}>
      <group>
        {positions.map(({ x, y, parentX, parentY }, idx) => {
          if (parentX === undefined || parentY === undefined) return null;
          return (
            <Line
              key={`tree-link-${idx}`}
              points={[toScene(parentX, parentY), toScene(x, y)]}
              color={`rgb(${colors.chart2.replace(/ /g, ', ')})`}
              transparent
              opacity={0.65}
              lineWidth={2}
            />
          );
        })}

        {positions.map(({ node, x, y }, idx) => {
          const isLeaf = node.value !== undefined;
          const displayValue = isLeaf && node.value ? normalizeRiskLabel(node.value) : node.value;
          const shortLabel = displayValue === "High Risk"
            ? "H"
            : displayValue === "Medium Risk"
              ? "M"
              : displayValue === "Low Risk"
                ? "L"
                : displayValue;
          const offset = isLeaf ? leafOffsets.get(node) : undefined;
          const color = isLeaf
            ? displayValue === "High Risk"
              ? `rgb(${colors.chart4.replace(/ /g, ', ')})`
              : displayValue === "Medium Risk"
                ? `rgb(${colors.chart3.replace(/ /g, ', ')})`
                : `rgb(${colors.chart2.replace(/ /g, ', ')})`
            : `rgb(${colors.chart3.replace(/ /g, ', ')})`;

          return (
            <group key={`tree-node-${idx}`}>
              <mesh position={toScene(x, y)} castShadow>
                <sphereGeometry args={[2.8, 8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} metalness={0.2} />
              </mesh>
              {isLeaf && displayValue && (
                <Html
                  position={[toScene(x + (offset?.dx ?? 0), y + (offset?.dy ?? 12))[0], toScene(x + (offset?.dx ?? 0), y + (offset?.dy ?? 12))[1], 0]}
                  center
                  style={{ pointerEvents: 'none' }}
                  wrapperClass="overflow-visible"
                  zIndexRange={[100, 0]}
                  occlude={false}
                >
                  <span className="rounded-full border border-white/10 bg-black/70 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-semibold text-white/90 shadow-lg">
                    {shortLabel}
                  </span>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </ChartShell>
  );
}
