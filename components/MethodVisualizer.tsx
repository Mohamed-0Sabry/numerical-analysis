"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Method = "bisection" | "false-position" | "fixed-point" | "newton" | "secant"

interface VisualizerProps {
  expr: string
  method: Method
  data: any | null
}

export default function MethodVisualizer({ expr, method, data }: VisualizerProps) {
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [speed, setSpeed] = useState(600)
  const playerRef = useRef<NodeJS.Timeout | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const iterations = data?.iterations ?? []
  const samples = data?.summary?.samples ?? []
  const xRange = data?.summary?.plotRange ?? [-5, 5]
  const yMin = data?.summary?.yMin ?? -1
  const yMax = data?.summary?.yMax ?? 1

  // SVG dimensions
  const width = 900
  const height = 500
  const padding = { left: 70, right: 40, top: 30, bottom: 60 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Scaling functions
  const xScale = (x: number) => padding.left + ((x - xRange[0]) / (xRange[1] - xRange[0])) * plotWidth
  const yScale = (y: number) => padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight

  // Generate path data for function curve
  const pathData = useMemo(() => {
    if (!samples.length) return ""
    
    let path = ""
    let inSegment = false
    
    samples.forEach((s: any, i: number) => {
      if (Number.isFinite(s.y)) {
        const x = xScale(s.x)
        const y = yScale(s.y)
        
        if (!inSegment) {
          path += `M ${x} ${y} `
          inSegment = true
        } else {
          path += `L ${x} ${y} `
        }
      } else {
        inSegment = false
      }
    })
    
    return path
  }, [samples, xRange, yMin, yMax])

  // Animation control
  useEffect(() => {
    if (!playing) {
      if (playerRef.current) {
        clearTimeout(playerRef.current)
        playerRef.current = null
      }
      return
    }
    
    if (step >= iterations.length) {
      setPlaying(false)
      return
    }
    
    playerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, iterations.length))
    }, speed)
    
    return () => {
      if (playerRef.current) {
        clearTimeout(playerRef.current)
        playerRef.current = null
      }
    }
  }, [playing, step, iterations.length, speed])

  // Reset when data changes
  useEffect(() => {
    setPlaying(false)
    setStep(0)
  }, [data, method])

  const visibleIters = iterations.slice(0, step)

  // Extract iteration points
  const iterPoints = visibleIters.map((it: any) => {
    const x = it.x ?? it.mid ?? it.xnext ?? it.c
    const y = it.fx ?? it.fc ?? (it.gx ?? 0)
    return { x, y, iter: it.iter, data: it }
  })

  // Control handlers
  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false)
    } else {
      if (step >= iterations.length) setStep(0)
      setPlaying(true)
    }
  }

  const handleStepForward = () => {
    setPlaying(false)
    setStep((s) => Math.min(s + 1, iterations.length))
  }

  const handleStepBack = () => {
    setPlaying(false)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleReset = () => {
    setPlaying(false)
    setStep(0)
  }

  if (!data || data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            {data?.error ? "Error in calculation" : "Run the method to see visualization"}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate grid lines
  const xTicks = 8
  const yTicks = 6
  const xTickValues = Array.from({ length: xTicks }, (_, i) => 
    xRange[0] + (i / (xTicks - 1)) * (xRange[1] - xRange[0])
  )
  const yTickValues = Array.from({ length: yTicks }, (_, i) => 
    yMin + (i / (yTicks - 1)) * (yMax - yMin)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={handlePlayPause} size="sm" variant="default">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={handleStepBack} size="sm" variant="outline" disabled={step === 0}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button onClick={handleStepForward} size="sm" variant="outline" disabled={step >= iterations.length}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button onClick={handleReset} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <div className="ml-4 text-sm text-muted-foreground font-mono">
              Step: <span className="font-semibold">{step}</span> / {iterations.length}
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Speed:</span>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={100}
              max={1500}
              step={100}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground font-mono w-16">{speed}ms</span>
          </div>
        </div>

        {/* SVG Graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border rounded-lg bg-white overflow-hidden"
        >
          <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
              </marker>
            </defs>

            {/* Grid lines */}
            {yTickValues.map((y, i) => (
              <line
                key={`grid-y-${i}`}
                x1={padding.left}
                y1={yScale(y)}
                x2={width - padding.right}
                y2={yScale(y)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
            {xTickValues.map((x, i) => (
              <line
                key={`grid-x-${i}`}
                x1={xScale(x)}
                y1={padding.top}
                x2={xScale(x)}
                y2={height - padding.bottom}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={yScale(0)}
              x2={width - padding.right}
              y2={yScale(0)}
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <line
              x1={xScale(0)}
              y1={height - padding.bottom}
              x2={xScale(0)}
              y2={padding.top}
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />

            {/* Axis labels */}
            <text x={width - padding.right + 15} y={yScale(0) + 5} fontSize="14" fill="#475569" fontWeight="500">
              x
            </text>
            <text x={xScale(0) + 10} y={padding.top - 10} fontSize="14" fill="#475569" fontWeight="500">
              f(x)
            </text>

            {/* Y-axis tick labels */}
            {yTickValues.map((y, i) => (
              <text
                key={`label-y-${i}`}
                x={padding.left - 10}
                y={yScale(y) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {y.toFixed(2)}
              </text>
            ))}

            {/* X-axis tick labels */}
            {xTickValues.map((x, i) => (
              <text
                key={`label-x-${i}`}
                x={xScale(x)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {x.toFixed(2)}
              </text>
            ))}

            {/* Function curve - THE MAIN FIX */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Method-specific visualizations */}
            {(method === "bisection" || method === "false-position") && step > 0 && visibleIters.length > 0 && (
              <>
                {typeof visibleIters[visibleIters.length - 1].a === "number" && (
                  <line
                    x1={xScale(visibleIters[visibleIters.length - 1].a)}
                    y1={padding.top}
                    x2={xScale(visibleIters[visibleIters.length - 1].a)}
                    y2={height - padding.bottom}
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    opacity="0.7"
                  />
                )}
                {typeof visibleIters[visibleIters.length - 1].b === "number" && (
                  <line
                    x1={xScale(visibleIters[visibleIters.length - 1].b)}
                    y1={padding.top}
                    x2={xScale(visibleIters[visibleIters.length - 1].b)}
                    y2={height - padding.bottom}
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    opacity="0.7"
                  />
                )}
              </>
            )}

            {/* Newton tangent line */}
            {method === "newton" && step > 0 && visibleIters.length > 0 && (
              (() => {
                const last = visibleIters[visibleIters.length - 1]
                if (typeof last.x === "number" && typeof last.dfx === "number") {
                  const x0 = last.x
                  const y0 = last.fx
                  const slope = last.dfx
                  const x1 = xRange[0]
                  const x2 = xRange[1]
                  const y1 = y0 + slope * (x1 - x0)
                  const y2 = y0 + slope * (x2 - x0)
                  
                  return (
                    <line
                      x1={xScale(x1)}
                      y1={yScale(y1)}
                      x2={xScale(x2)}
                      y2={yScale(y2)}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  )
                }
                return null
              })()
            )}

            {/* Secant line */}
            {method === "secant" && step > 0 && visibleIters.length > 0 && (
              (() => {
                const last = visibleIters[visibleIters.length - 1]
                if (typeof last.xprev === "number" && typeof last.x === "number") {
                  const x1 = last.xprev
                  const x2 = last.x
                  const y1 = last.fprev
                  const y2 = last.fx
                  const slope = (y2 - y1) / (x2 - x1)
                  
                  const xStart = xRange[0]
                  const xEnd = xRange[1]
                  const yStart = y1 + slope * (xStart - x1)
                  const yEnd = y1 + slope * (xEnd - x1)
                  
                  return (
                    <line
                      x1={xScale(xStart)}
                      y1={yScale(yStart)}
                      x2={xScale(xEnd)}
                      y2={yScale(yEnd)}
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  )
                }
                return null
              })()
            )}

            {/* Iteration points */}
            {iterPoints.map((pt: any, i: number) => {
              if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null
              
              return (
                <g key={i}>
                  <circle
                    cx={xScale(pt.x)}
                    cy={yScale(pt.y)}
                    r="6"
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={xScale(pt.x)}
                    y={yScale(pt.y) - 14}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#ef4444"
                  >
                    {pt.iter}
                  </text>
                </g>
              )
            })}
          </svg>
        </motion.div>
      </CardContent>
    </Card>
  )
}