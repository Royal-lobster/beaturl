"use client";

import { useEffect, useRef } from "react";
import { getAnalyser } from "@/lib/audio";

interface VisualizerProps {
  playing: boolean;
}

export function Visualizer({ playing }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const w = canvas!.getBoundingClientRect().width;
      const h = canvas!.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const analyser = getAnalyser();
      if (!analyser || !playing) {
        // Idle — gentle wave with multiple layers
        const t = Date.now() * 0.001;
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          const alpha = 0.06 + layer * 0.04;
          const colors = ["0, 229, 255", "191, 90, 242", "255, 45, 85"];
          ctx.strokeStyle = `rgba(${colors[layer]}, ${alpha})`;
          ctx.lineWidth = 1.5;
          for (let x = 0; x < w; x++) {
            const y = h / 2 + Math.sin(x * 0.015 + t * (0.8 + layer * 0.3) + layer * 2) * (3 + layer * 2);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Frequency bars with gradient — rounded, glowing
      const barCount = 80;
      const barWidth = w / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barH = value * h * 0.85;
        const barRadius = Math.min(barWidth * 0.4, 3);

        const hue = (i / barCount) * 200 + 310; // pink → cyan sweep
        const saturation = 75 + value * 25;
        const lightness = 45 + value * 20;

        // Glow under bars
        ctx.fillStyle = `hsla(${hue % 360}, ${saturation}%, ${lightness}%, ${value * 0.12})`;
        ctx.fillRect(i * barWidth, h - barH - 4, barWidth - 1, barH + 8);

        // Main bar
        ctx.beginPath();
        const x = i * barWidth + 1;
        const y = h - barH;
        const bw = barWidth - 2;
        ctx.moveTo(x + barRadius, y);
        ctx.lineTo(x + bw - barRadius, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + barRadius);
        ctx.lineTo(x + bw, h);
        ctx.lineTo(x, h);
        ctx.lineTo(x, y + barRadius);
        ctx.quadraticCurveTo(x, y, x + barRadius, y);
        ctx.closePath();

        const grad = ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, `hsla(${hue % 360}, ${saturation}%, ${lightness}%, ${0.5 + value * 0.5})`);
        grad.addColorStop(1, `hsla(${hue % 360}, ${saturation}%, ${lightness * 0.4}%, 0.15)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Mirror (top)
        ctx.fillStyle = `hsla(${hue % 360}, ${saturation}%, ${lightness}%, ${value * 0.08})`;
        ctx.fillRect(x, 0, bw, barH * 0.2);
      }

      // Waveform overlay — glowing line
      const waveData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(waveData);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0, 229, 255, 0.3)";
      ctx.shadowBlur = 8;
      const sliceWidth = w / waveData.length;
      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 128.0;
        const y = (v * h) / 2;
        i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceWidth, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [playing]);

  return (
    <div className="relative w-full max-w-[900px] mb-6">
      {/* Noise grain behind visualizer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-[80px] md:h-[120px] rounded-2xl relative"
        style={{
          background: "linear-gradient(180deg, rgba(14, 14, 24, 0.8), rgba(6, 6, 12, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      />
    </div>
  );
}
