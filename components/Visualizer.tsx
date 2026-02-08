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
        // Draw idle wave
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 210, 255, 0.15)";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.02 + Date.now() * 0.001) * 4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Frequency bars with gradient
      const barCount = 64;
      const barWidth = w / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barH = value * h * 0.9;

        const hue = (i / barCount) * 180 + 320; // pink -> cyan
        ctx.fillStyle = `hsla(${hue % 360}, 80%, 60%, ${0.3 + value * 0.7})`;
        ctx.fillRect(
          i * barWidth + 1,
          h - barH,
          barWidth - 2,
          barH
        );

        // Mirror (subtle)
        ctx.fillStyle = `hsla(${hue % 360}, 80%, 60%, ${value * 0.15})`;
        ctx.fillRect(
          i * barWidth + 1,
          0,
          barWidth - 2,
          barH * 0.3
        );
      }

      // Waveform overlay
      const waveData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(waveData);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 210, 255, 0.5)";
      ctx.lineWidth = 1.5;
      const sliceWidth = w / waveData.length;
      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 128.0;
        const y = (v * h) / 2;
        i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceWidth, y);
      }
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[900px] h-[60px] md:h-[80px] rounded-lg mb-5"
      style={{ background: "rgba(18, 18, 26, 0.5)" }}
    />
  );
}
