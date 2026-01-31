"use client";

import { useEffect, useRef } from "react";
import type { Point, ClusteringState } from "@/lib/ml-algorithms";
import { CLUSTER_COLORS } from "@/lib/ml-algorithms";

interface ClusteringChartProps {
  points: Point[];
  state: ClusteringState;
  width?: number;
  height?: number;
}

export function ClusteringChart({
  points,
  state,
  width = 500,
  height = 400,
}: ClusteringChartProps) {
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

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const scaleX = (x: number) => padding + (x / 100) * chartWidth;
    const scaleY = (y: number) => height - padding - (y / 100) * chartHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      const y = padding + (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Helper to parse oklch color
    const parseOklch = (color: string): { r: number; g: number; b: number } => {
      // Simplified color mapping for our cluster colors
      const colorMap: Record<string, { r: number; g: number; b: number }> = {
        "oklch(0.65 0.2 265)": { r: 139, g: 92, b: 246 },    // Purple
        "oklch(0.55 0.18 170)": { r: 20, g: 184, b: 166 },   // Teal
        "oklch(0.7 0.18 80)": { r: 234, g: 179, b: 8 },      // Yellow
        "oklch(0.6 0.2 320)": { r: 236, g: 72, b: 153 },     // Pink
        "oklch(0.65 0.22 30)": { r: 249, g: 115, b: 22 },    // Orange
      };
      return colorMap[color] || { r: 139, g: 92, b: 246 };
    };

    // Draw connection lines from points to centroids
    if (state.centroids.length > 0 && state.assignments.length > 0) {
      points.forEach((point, idx) => {
        const clusterIdx = state.assignments[idx];
        if (clusterIdx !== undefined && state.centroids[clusterIdx]) {
          const centroid = state.centroids[clusterIdx];
          const color = parseOklch(CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length]);

          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(scaleX(point.x), scaleY(point.y));
          ctx.lineTo(scaleX(centroid.x), scaleY(centroid.y));
          ctx.stroke();
        }
      });
    }

    // Draw data points
    points.forEach((point, idx) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      const clusterIdx = state.assignments[idx] ?? 0;
      const color = parseOklch(CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length]);

      // Point glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw centroids
    state.centroids.forEach((centroid, idx) => {
      const x = scaleX(centroid.x);
      const y = scaleY(centroid.y);
      const color = parseOklch(CLUSTER_COLORS[idx % CLUSTER_COLORS.length]);

      // Centroid glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Centroid marker (X shape)
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const size = 10;
      ctx.beginPath();
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + size, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.stroke();

      // Centroid ring
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [points, state, width, height]);

  return (
    <div className="relative rounded-xl border border-border bg-card p-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-1" />
          <span>Cluster 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-2" />
          <span>Cluster 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-3" />
          <span>Cluster 3</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">×</span>
          <span>Centroids</span>
        </div>
      </div>
    </div>
  );
}
