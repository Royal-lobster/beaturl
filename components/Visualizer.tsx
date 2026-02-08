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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const w = canvas!.getBoundingClientRect().width;
      const h = canvas!.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const analyser = getAnalyser();
      if (!analyser || !playing) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barCount = Math.floor(w / 8);
      const step = Math.max(1, Math.floor(bufferLength / barCount));

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barH = value * h;
        const hue = (i / barCount) * 200 + 310;
        ctx.fillStyle = `hsla(${hue % 360}, 70%, 50%, ${value * 0.15})`;
        ctx.fillRect(i * (w / barCount), h - barH, w / barCount - 1, barH);
      }
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6, zIndex: 0 }}
    />
  );
}
