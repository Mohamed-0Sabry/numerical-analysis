// components/MethodVisualizer.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Method = "bisection" | "false-position" | "fixed-point" | "newton" | "secant";

interface VisualizerProps {
  expr: string;
  method: Method;
  data: any | null;
}

export default function MethodVisualizer({ expr, method, data }: VisualizerProps) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(600); // ms per step
  const playerRef = useRef<number | null>(null);

  const iterations = data?.iterations ?? [];
  const samples = data?.summary?.samples ?? [];
  const xRange = data?.summary?.plotRange ?? (samples.length ? [samples[0].x, samples[samples.length - 1].x] : [-5, 5]);
  const yMin = data?.summary?.yMin ?? -1;
  const yMax = data?.summary?.yMax ?? 1;

  // prepare curve arrays
  const curveX = useMemo(() => samples.map((s: any) => s.x), [samples]);
  const curveY = useMemo(() => samples.map((s: any) => s.y), [samples]);

  useEffect(() => {
    if (!playing) {
      if (playerRef.current) {
        window.clearTimeout(playerRef.current);
        playerRef.current = null;
      }
      return;
    }
    if (step >= iterations.length) {
      setPlaying(false);
      return;
    }
    playerRef.current = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, iterations.length));
    }, Math.max(50, speed));
    return () => {
      if (playerRef.current) {
        window.clearTimeout(playerRef.current);
        playerRef.current = null;
      }
    };
  }, [playing, step, iterations.length, speed]);

  // compute current traces depending on method and step
  const visibleIters = iterations.slice(0, step);

  const iterPoints = visibleIters.map((it: any, i: number) => {
    // standardize x position
    const x = it.x ?? it.mid ?? it.xnext ?? it.xprev ?? it.c ?? it.a ?? it.b;
    const y = it.fx ?? it.fc ?? (typeof it.xnext === "number" ? evalFx(it.xnext) : NaN);
    return { x, y, meta: it };
  });

  function evalFx(xv: number) {
    try {
      // quick eval using mathjs compile charless approach - but avoid expensive compile each time.
      // The core methods already provided sample function; here we won't eval for performance.
      return NaN;
    } catch {
      return NaN;
    }
  }

  // method-specific helper traces (e.g., interval lines for bisection)
  const methodTraces = useMemo(() => {
    const traces: any[] = [];
    if (method === "bisection" || method === "false-position") {
      // show current a,b for last visible iteration
      const last = visibleIters.length ? visibleIters[visibleIters.length - 1] : null;
      if (last) {
        const a = last.a ?? null;
        const b = last.b ?? null;
        if (typeof a === "number") {
          traces.push({
            x: [a, a],
            y: [yMin, yMax],
            mode: "lines",
            line: { color: "#f97316", width: 2, dash: "dash" },
            name: "a",
            hoverinfo: "none",
          });
        }
        if (typeof b === "number") {
          traces.push({
            x: [b, b],
            y: [yMin, yMax],
            mode: "lines",
            line: { color: "#06b6d4", width: 2, dash: "dash" },
            name: "b",
            hoverinfo: "none",
          });
        }
      }
    } else if (method === "secant") {
      // draw secant line for last iter
      const last = visibleIters.length ? visibleIters[visibleIters.length - 1] : null;
      if (last && typeof last.xprev === "number" && typeof last.x === "number" && typeof last.fx === "number") {
        const x1 = last.xprev, x2 = last.x;
        // approximate f(x) from sample interpolation (use samples)
        const fx1 = interpY(x1, samples);
        const fx2 = interpY(x2, samples);
        if (!isNaN(fx1) && !isNaN(fx2)) {
          const slope = (fx2 - fx1) / (x2 - x1);
          // line across xRange
          const xs = [xRange[0], xRange[1]];
          const ys = xs.map((xx: number) => fx1 + slope * (xx - x1));
          traces.push({ x: xs, y: ys, mode: "lines", line: { color: "#ef4444", width: 2 }, name: "Secant" });
        }
      }
    } else if (method === "newton") {
      // draw tangent at last x
      const last = visibleIters.length ? visibleIters[visibleIters.length - 1] : null;
      if (last && typeof last.x === "number" && typeof last.dfx === "number") {
        const x0 = last.x;
        const y0 = interpY(x0, samples);
        if (!isNaN(y0)) {
          const slope = last.dfx;
          const xs = [xRange[0], xRange[1]];
          const ys = xs.map((xx: number) => y0 + slope * (xx - x0));
          traces.push({ x: xs, y: ys, mode: "lines", line: { color: "#10b981", width: 2, dash: "dot" }, name: "Tangent" });
        }
      }
    }
    return traces;
  }, [visibleIters, method, samples, xRange, yMin, yMax]);

  function interpY(xq: number, samplesArr: any[]) {
    if (!samplesArr || samplesArr.length === 0) return NaN;
    // simple linear search (samples are sorted)
    let i = 0;
    while (i < samplesArr.length - 1 && samplesArr[i + 1].x < xq) i++;
    const a = samplesArr[i], b = samplesArr[Math.min(i + 1, samplesArr.length - 1)];
    if (!a || !b) return NaN;
    if (b.x === a.x) return a.y;
    const t = (xq - a.x) / (b.x - a.x);
    return a.y + t * (b.y - a.y);
  }

  const layout = {
    xaxis: { range: xRange, title: { text: "x" }, zeroline: true },
    yaxis: { range: [yMin, yMax], title: { text: "f(x)" }, zeroline: true },
    margin: { t: 20, l: 50, r: 20, b: 40 },
    showlegend: false,
    autosize: true,
  };
  // traces: function curve, iteration points, method-specific traces
  const traces = [
    {
      x: curveX,
      y: curveY,
      mode: "lines",
      name: "f(x)",
      line: { color: "#111827", width: 2 },
    },
    // zero line
    { x: xRange, y: [0, 0], mode: "lines", line: { color: "#94a3b8", width: 1, dash: "dash" }, name: "zero" },
    // iteration points (scatter)
    {
      x: iterPoints.map((p: { x: any; y: number }) => p.x),
      y: iterPoints.map((p: { x: any; y: number }) => p.y),
      mode: "markers+text",
      marker: { color: "#ef4444", size: 10 },
      text: iterPoints.map((p: any, i: number) => String(i + 1)),
      textposition: "top center",
      name: "iterations",
    },
    // method-specific:
    ...methodTraces,
  ];

  function handlePlayPause() {
    if (playing) {
      setPlaying(false);
    } else {
      if (step >= iterations.length) setStep(0);
      setPlaying(true);
    }
  }
  function stepForward() {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, iterations.length));
  }
  function stepBack() {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, 0));
  }
  function reset() {
    setPlaying(false);
    setStep(0);
  }

  // When data changes reset
  useEffect(() => {
    setPlaying(false);
    setStep(0);
  }, [data, method]);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="space-x-2">
          <button onClick={handlePlayPause} className="px-3 py-1 bg-blue-600 text-white rounded">
            {playing ? "Pause" : (step === 0 ? "Run Simulation" : "Resume")}
          </button>
          <button onClick={stepBack} className="px-2 py-1 bg-gray-100 rounded">◀</button>
          <button onClick={stepForward} className="px-2 py-1 bg-gray-100 rounded">▶</button>
          <button onClick={reset} className="px-2 py-1 bg-gray-100 rounded">Reset</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Speed</label>
          <input
            type="range"
            min={100}
            max={1500}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-1"
          />
          <span className="text-sm text-gray-600">{Math.round(speed)} ms</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-2">
        <Plot
          data={traces}
          layout={{ ...layout, legend: { orientation: "h" } }}
          style={{ width: "100%", height: 420 }}
          useResizeHandler
          config={{ responsive: true, displayModeBar: true }}
        />
      </div>

      <div className="mt-2 text-sm">
        <strong>Step:</strong> {step} / {iterations.length} &nbsp;
      </div>
    </motion.div>
  );
}
