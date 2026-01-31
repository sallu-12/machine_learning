"use client";

import { useEffect, useRef } from "react";

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

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // If no data, show placeholder
    if (lossHistory.length === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for data...", width / 2, height / 2);
      return;
    }

    // Calculate bounds (ignore non-finite values)
    const finiteLosses = lossHistory.filter((l) => Number.isFinite(l));
    if (finiteLosses.length === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for valid data...", width / 2, height / 2);
      return;
    }

    const maxLoss = Math.max(...finiteLosses, 1);
    const minLoss = 0;

    // Ensure range is non-zero
    const lossRange = Math.max(maxLoss - minLoss, 1e-6);

    const scaleX = (i: number) =>
      padding.left + (i / Math.max(lossHistory.length - 1, 1)) * chartWidth;
    const scaleY = (loss: number) =>
      padding.top + ((maxLoss - loss) / lossRange) * chartHeight;

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px system-ui, sans-serif";

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = minLoss + ((maxLoss - minLoss) * (4 - i)) / 4;
      const y = padding.top + (i / 4) * chartHeight;
      ctx.fillText(value.toFixed(0), padding.left - 8, y + 4);
    }

    // X-axis label
    ctx.textAlign = "center";
    ctx.fillText("Iteration", width / 2, height - 8);

    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Loss (MSE)", 0, 0);
    ctx.restore();

    // Draw area under curve
    if (lossHistory.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(scaleX(0), height - padding.bottom);

      lossHistory.forEach((loss, i) => {
        ctx.lineTo(scaleX(i), scaleY(loss));
      });

      ctx.lineTo(scaleX(lossHistory.length - 1), height - padding.bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Draw line
    if (lossHistory.length > 1) {
      ctx.strokeStyle = "rgba(139, 92, 246, 1)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      lossHistory.forEach((loss, i) => {
        const x = scaleX(i);
        const y = scaleY(loss);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw current point
    if (lossHistory.length > 0) {
      const lastIdx = lossHistory.length - 1;
      const lastX = scaleX(lastIdx);
      const lastY = scaleY(lossHistory[lastIdx]);

      // Glow
      const gradient = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 15);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = "rgba(139, 92, 246, 1)";
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Current value label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        `${lossHistory[lastIdx].toFixed(2)}`,
        lastX + 10,
        lastY - 5
      );
    }
  }, [lossHistory, width, height]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-medium text-foreground">Loss Curve (MSE)</h4>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
    </div>
  );
}
