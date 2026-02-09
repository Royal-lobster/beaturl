"use client";

import { useEffect, useRef } from "react";
import { getAnalyser } from "@/lib/audio";

interface VisualizerProps {
  playing: boolean;
  fullScreen?: boolean;
}

export function Visualizer({ playing, fullScreen }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = fullScreen ? window.innerWidth : canvas!.getBoundingClientRect().width;
      const h = fullScreen ? window.innerHeight : canvas!.getBoundingClientRect().height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const w = fullScreen ? window.innerWidth : canvas!.getBoundingClientRect().width;
      const h = fullScreen ? window.innerHeight : canvas!.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const analyser = getAnalyser();
      if (!analyser || !playing) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barCount = Math.floor(w / 8);
      const barWidth = w / barCount;

      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency bin using linear interpolation
        const binIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[Math.min(binIndex, bufferLength - 1)] / 255;
        const barH = value * h;
        const hue = (i / barCount) * 200 + 310;
        ctx.fillStyle = `hsla(${hue % 360}, 70%, 50%, ${value * 0.15})`;
        ctx.fillRect(i * barWidth, h - barH, barWidth - 1, barH);
      }
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [playing, fullScreen]);

  return (
    <canvas
      ref={canvasRef}
      className={`${fullScreen ? "fixed" : "absolute"} inset-0 w-full h-full pointer-events-none`}
      style={{ opacity: 0.6, zIndex: 0 }}
    />
  );
}
