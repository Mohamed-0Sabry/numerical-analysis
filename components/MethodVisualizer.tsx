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
  const svgRef = useRef<SVGSVGElement | null>(null)

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

  // Interaction state: pan in pixels, scale per-axis
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState({ x: 1, y: 1 })

  // pointer / gesture refs
  const draggingRef = useRef(false)
  const lastPointerRef = useRef<{ x: number; y: number; dist?: number } | null>(null)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())

  // convert data x/y -> screen px (respecting pan & scale)
  const xScale = (x: number) => {
    const norm = (x - xRange[0]) / (xRange[1] - xRange[0])
    return padding.left + (norm * plotWidth) * scale.x + pan.x
  }
  const yScale = (y: number) => {
    const norm = (y - yMin) / (yMax - yMin)
    return padding.top + plotHeight - (norm * plotHeight) * scale.y + pan.y
  }

  // Inverse conversions
  const screenToDataX = (screenX: number) => {
    const local = (screenX - padding.left - pan.x) / (plotWidth * scale.x)
    return xRange[0] + local * (xRange[1] - xRange[0])
  }
  const screenToDataY = (screenY: number) => {
    const local = (padding.top + plotHeight - screenY + pan.y) / (plotHeight * scale.y)
    return yMin + local * (yMax - yMin)
  }

  // Generate path data for function curve
  const pathData = useMemo(() => {
    if (!samples.length) return ""

    let path = ""
    let inSegment = false

    samples.forEach((s: any) => {
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
  }, [samples, scale, pan, xRange, yMin, yMax])

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
    setPan({ x: 0, y: 0 })
    setScale({ x: 1, y: 1 })
  }, [data, method])

  const visibleIters = iterations.slice(0, step)

  // Extract iteration points
  const iterPoints = visibleIters.map((it: any) => {
    const x = it.x ?? it.mid ?? it.xnext ?? it.c
    const y = it.fx ?? it.fc ?? (it.gx ?? 0)
    return { x, y, iter: it.iter, data: it }
  })

  // For fixed-point, extract cobweb points up to current step
  const cobwebPoints = data?.summary?.cobwebPoints ?? []
  const visibleCobwebPoints = cobwebPoints.slice(0, Math.min((step * 2) + 1, cobwebPoints.length))

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

  const resetView = () => {
    setPan({ x: 0, y: 0 })
    setScale({ x: 1, y: 1 })
  }

  // Pointer handlers for pan & pinch
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const getPoint = (evt: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
    }

    const onPointerDown = (evt: PointerEvent) => {
      (evt.target as Element).setPointerCapture(evt.pointerId)
      pointersRef.current.set(evt.pointerId, getPoint(evt))
      if (pointersRef.current.size === 1) {
        draggingRef.current = true
        lastPointerRef.current = getPoint(evt)
      }
    }

    const onPointerMove = (evt: PointerEvent) => {
      if (!pointersRef.current.has(evt.pointerId)) return
      pointersRef.current.set(evt.pointerId, getPoint(evt))

      if (pointersRef.current.size === 1 && draggingRef.current && lastPointerRef.current) {
        const cur = getPoint(evt)
        const dx = cur.x - lastPointerRef.current.x
        const dy = cur.y - lastPointerRef.current.y
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
        lastPointerRef.current = cur
      } else if (pointersRef.current.size === 2) {
        const pts = Array.from(pointersRef.current.values())
        const [p1, p2] = pts
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.hypot(dx, dy)

        const prev = (lastPointerRef.current as any)?.dist ?? dist
        const factor = dist / prev

        const beforeDataX = screenToDataX(mid.x)
        const beforeDataY = screenToDataY(mid.y)

        setScale((s) => ({ x: s.x * factor, y: s.y * factor }))

        const afterScreenX = xScale(beforeDataX)
        const afterScreenY = yScale(beforeDataY)

        setPan((p) => ({ x: p.x + (mid.x - afterScreenX), y: p.y + (mid.y - afterScreenY) }))

        lastPointerRef.current = { ...mid, dist }
      }
    }

    const onPointerUp = (evt: PointerEvent) => {
      try { (evt.target as Element).releasePointerCapture(evt.pointerId) } catch (e) {}
      pointersRef.current.delete(evt.pointerId)
      if (pointersRef.current.size === 0) {
        draggingRef.current = false
        lastPointerRef.current = null
      } else if (pointersRef.current.size === 1) {
        const remaining = Array.from(pointersRef.current.values())[0]
        lastPointerRef.current = remaining
      }
    }

    svg.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)

    return () => {
      svg.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
    }
  }, [xRange, yMin, yMax, plotWidth, plotHeight, pan, scale])

  // Wheel zoom
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const onWheel = (evt: WheelEvent) => {
      evt.preventDefault()
      const rect = svg.getBoundingClientRect()
      const mouseX = evt.clientX - rect.left
      const mouseY = evt.clientY - rect.top

      const delta = -evt.deltaY
      const zoomFactor = 1 + (delta > 0 ? 0.08 : -0.08)

      const onlyX = evt.shiftKey && !evt.ctrlKey && !evt.metaKey
      const onlyY = (evt.ctrlKey || evt.metaKey) && !evt.shiftKey

      const doX = onlyX ? true : (onlyY ? false : true)
      const doY = onlyY ? true : (onlyX ? false : true)

      const beforeDataX = screenToDataX(mouseX)
      const beforeDataY = screenToDataY(mouseY)

      setScale((s) => ({ x: doX ? s.x * zoomFactor : s.x, y: doY ? s.y * zoomFactor : s.y }))

      requestAnimationFrame(() => {
        const afterX = xScale(beforeDataX)
        const afterY = yScale(beforeDataY)
        setPan((p) => ({ x: p.x + (mouseX - afterX), y: p.y + (mouseY - afterY) }))
      })
    }

    svg.addEventListener("wheel", onWheel, { passive: false })
    return () => svg.removeEventListener("wheel", onWheel)
  }, [xRange, yMin, yMax, scale, pan])

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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Visualization</CardTitle>
        <Button size="sm" onClick={resetView} variant="outline">Reset View</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
          </div>

          <div className="flex items-center gap-3 min-w-[360px]">
            <div className="ml-4 text-sm text-muted-foreground font-mono">
              Step: <span className="font-semibold">{step}</span> / {iterations.length}
            </div>
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
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ touchAction: "none", cursor: draggingRef.current ? "grabbing" : "grab" }}
          >
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
              <marker
                id="cobweb-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" />
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
              {method === "fixed-point" ? "y" : "f(x)"}
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

            {/* Function curve */}
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

            {/* Fixed-Point: Draw y = x diagonal line */}
            {method === "fixed-point" && (
              <line
                x1={xScale(xRange[0])}
                y1={yScale(xRange[0])}
                x2={xScale(xRange[1])}
                y2={yScale(xRange[1])}
                stroke="#9333ea"
                strokeWidth="2"
                strokeDasharray="6,4"
                opacity="0.7"
              />
            )}

            {/* Fixed-Point: Draw cobweb diagram with animated arrows */}
            {method === "fixed-point" && visibleCobwebPoints.length > 1 && (
              <>
                {visibleCobwebPoints.slice(0, -1).map((pt: { x: number; y: number }, i: number) => {
                  const nextPt = visibleCobwebPoints[i + 1]
                  if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y) || 
                      !Number.isFinite(nextPt.x) || !Number.isFinite(nextPt.y)) {
                    return null
                  }

                  const isHorizontal = Math.abs(pt.y - nextPt.y) < 0.0001
                  const color = isHorizontal ? "#f97316" : "#06b6d4"

                  return (
                    <motion.line
                      key={`cobweb-${i}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      x1={xScale(pt.x)}
                      y1={yScale(pt.y)}
                      x2={xScale(nextPt.x)}
                      y2={yScale(nextPt.y)}
                      stroke={color}
                      strokeWidth="2"
                      markerEnd={i === visibleCobwebPoints.length - 2 ? "url(#cobweb-arrow)" : undefined}
                    />
                  )
                })}
              </>
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

            {/* Iteration points (not for fixed-point) */}
            {method !== "fixed-point" && iterPoints.map((pt: any, i: number) => {
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

            {/* Fixed-Point iteration points (show on diagonal) */}
            {method === "fixed-point" && visibleIters.map((it: any, i: number) => {
              const x = it.x
              if (!Number.isFinite(x)) return null

              return (
                <g key={`fp-point-${i}`}>
                  <circle
                    cx={xScale(x)}
                    cy={yScale(x)}
                    r="6"
                    fill="#9333ea"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={xScale(x)}
                    y={yScale(x) - 14}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#9333ea"
                  >
                    {it.iter}
                  </text>
                </g>
              )
            })}
          </svg>
        </motion.div>

        {/* Legend for Fixed-Point */}
        {method === "fixed-point" && data && (
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-600"></div>
              <span className="text-muted-foreground">y = g(x)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-600 border-dashed border-t-2 border-purple-600"></div>
              <span className="text-muted-foreground">y = x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500"></div>
              <span className="text-muted-foreground">Horizontal (to g(x))</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cyan-500"></div>
              <span className="text-muted-foreground">Vertical (to diagonal)</span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Tips: Drag to pan. Wheel to zoom (Shift = X-only, Ctrl/Meta = Y-only). Pinch to zoom on touch.
        </div>
      </CardContent>
    </Card>
  )
}