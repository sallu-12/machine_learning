"use client";

import { useEffect, useRef } from "react";
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

export function DecisionTreeChart({
  root,
  width = 600,
  height = 400,
}: DecisionTreeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    if (!root) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click Play to build the tree...", width / 2, height / 2);
      return;
    }

    const padding = 40;
    const nodeRadius = 30;
    const verticalSpacing = 80;

    // Calculate positions for all nodes
    const positions: NodePosition[] = [];

    const calculatePositions = (
      node: TreeNode,
      x: number,
      y: number,
      level: number,
      parentX?: number,
      parentY?: number
    ) => {
      positions.push({ node, x, y, parentX, parentY });

      const childOffset = (width - padding * 2) / Math.pow(2, level + 2);

      if (node.left) {
        calculatePositions(node.left, x - childOffset, y + verticalSpacing, level + 1, x, y);
      }
      if (node.right) {
        calculatePositions(node.right, x + childOffset, y + verticalSpacing, level + 1, x, y);
      }
    };

    calculatePositions(root, width / 2, padding + nodeRadius, 0);

    // Draw connections first
    positions.forEach(({ x, y, parentX, parentY }) => {
      if (parentX !== undefined && parentY !== undefined) {
        // Connection line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(parentX, parentY + nodeRadius);
        ctx.lineTo(x, y - nodeRadius);
        ctx.stroke();
      }
    });

    // Draw nodes
    positions.forEach(({ node, x, y }) => {
      const isLeaf = node.value !== undefined;
      const color = isLeaf
        ? node.value === "High Risk"
          ? { r: 239, g: 68, b: 68 }  // Red
          : { r: 34, g: 197, b: 94 }  // Green
        : { r: 234, g: 179, b: 8 };   // Yellow for decision nodes

      // Node glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius + 10);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius + 10, 0, Math.PI * 2);
      ctx.fill();

      // Node background
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Node text
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isLeaf) {
        ctx.fillText(node.value || "", x, y - 5);
        ctx.font = "9px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillText(`n=${node.samples}`, x, y + 10);
      } else {
        const featureName = node.feature === "age" ? "Age" : "Income";
        ctx.fillText(featureName, x, y - 10);
        ctx.font = "9px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillText(`<= ${node.threshold?.toFixed(0)}`, x, y + 5);
        ctx.fillText(`n=${node.samples}`, x, y + 18);
      }
    });

    // Draw legend
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";

    const legendY = height - 20;
    
    // Decision node
    ctx.fillStyle = "rgba(234, 179, 8, 0.8)";
    ctx.beginPath();
    ctx.arc(padding, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("Decision Node", padding + 15, legendY + 4);

    // Low Risk
    ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
    ctx.beginPath();
    ctx.arc(padding + 120, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("Low Risk", padding + 135, legendY + 4);

    // High Risk
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
    ctx.beginPath();
    ctx.arc(padding + 210, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("High Risk", padding + 225, legendY + 4);
  }, [root, width, height]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
    </div>
  );
}
