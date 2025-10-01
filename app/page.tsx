"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MethodVisualizer from "@/components/MethodVisualizer"
import { solveBisection, solveFalsePosition, solveFixedPoint, solveNewton, solveSecant } from "@/utils/numericalMethods"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Play, RotateCcw } from "lucide-react"

type Method = "bisection" | "false-position" | "fixed-point" | "newton" | "secant"

export default function Home() {
  const [method, setMethod] = useState<Method>("bisection")
  const [expr, setExpr] = useState("x^3 - x - 2")
  const [gexpr, setGexpr] = useState("(x + 2)^(1/3)")
  const [a, setA] = useState("-2")
  const [b, setB] = useState("2")
  const [x0, setX0] = useState("1")
  const [x1, setX1] = useState("2")
  const [tol, setTol] = useState("1e-6")
  const [maxIter, setMaxIter] = useState("50")
  const [result, setResult] = useState<any | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  function run(): void {
    setIsRunning(true)
    const options = { tol: Number(tol), maxIter: Number(maxIter) }

    setTimeout(() => {
      try {
        let res: any
        switch (method) {
          case "bisection":
            res = solveBisection(expr, Number(a), Number(b), options)
            break
          case "false-position":
            res = solveFalsePosition(expr, Number(a), Number(b), options)
            break
          case "fixed-point":
            res = solveFixedPoint(gexpr, Number(x0), options)
            break
          case "newton":
            res = solveNewton(expr, Number(x0), options)
            break
          case "secant":
            res = solveSecant(expr, Number(x0), Number(x1), options)
            break
        }
        setResult(res)
      } catch (err: any) {
        setResult({ error: err.message })
      } finally {
        setIsRunning(false)
      }
    }, 100)
  }

  function reset(): void {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Numerical Analysis</h1>
                <p className="text-sm text-muted-foreground">Root Finding Methods</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select value={method} onValueChange={(val) => setMethod(val as Method)}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bisection">Bisection Method</SelectItem>
                      <SelectItem value="false-position">False Position</SelectItem>
                      <SelectItem value="fixed-point">Fixed-Point Iteration</SelectItem>
                      <SelectItem value="newton">Newton-Raphson</SelectItem>
                      <SelectItem value="secant">Secant Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expr">Function f(x)</Label>
                  <Input
                    id="expr"
                    value={expr}
                    onChange={(e) => setExpr(e.target.value)}
                    placeholder="e.g., x^3 - x - 2"
                    className="font-mono"
                  />
                </div>

                {method === "fixed-point" && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label htmlFor="gexpr">Function g(x)</Label>
                    <Input
                      id="gexpr"
                      value={gexpr}
                      onChange={(e) => setGexpr(e.target.value)}
                      placeholder="e.g., (x + 2)^(1/3)"
                      className="font-mono"
                    />
                  </motion.div>
                )}

                {(method === "bisection" || method === "false-position") && (
                  <motion.div
                    className="grid grid-cols-2 gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="a">Lower Bound (a)</Label>
                      <Input
                        id="a"
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        placeholder="a"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b">Upper Bound (b)</Label>
                      <Input
                        id="b"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        placeholder="b"
                        className="font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                {(method === "newton" || method === "fixed-point") && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label htmlFor="x0">Initial Guess (x₀)</Label>
                    <Input
                      id="x0"
                      value={x0}
                      onChange={(e) => setX0(e.target.value)}
                      placeholder="x₀"
                      className="font-mono"
                    />
                  </motion.div>
                )}

                {method === "secant" && (
                  <motion.div
                    className="grid grid-cols-2 gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="x0-secant">First Guess (x₀)</Label>
                      <Input
                        id="x0-secant"
                        value={x0}
                        onChange={(e) => setX0(e.target.value)}
                        placeholder="x₀"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="x1">Second Guess (x₁)</Label>
                      <Input
                        id="x1"
                        value={x1}
                        onChange={(e) => setX1(e.target.value)}
                        placeholder="x₁"
                        className="font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tol">Tolerance</Label>
                    <Input
                      id="tol"
                      value={tol}
                      onChange={(e) => setTol(e.target.value)}
                      placeholder="1e-6"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxIter">Max Iterations</Label>
                    <Input
                      id="maxIter"
                      value={maxIter}
                      onChange={(e) => setMaxIter(e.target.value)}
                      placeholder="50"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={run} disabled={isRunning} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running..." : "Run Method"}
                  </Button>
                  {result && (
                    <Button onClick={reset} variant="outline" size="icon">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {result?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  >
                    <strong>Error:</strong> {result.error}
                  </motion.div>
                )}

                {result && !result.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Root Found:</span>
                      <span className="text-lg font-bold font-mono text-primary">{result.summary.root.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Iterations:</span>
                      <span className="text-sm font-mono">{result.summary.iterations}</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Visualization */}
          <motion.div
            className="lg:col-span-8 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <MethodVisualizer expr={expr} method={method} data={result} />

            {result && !result.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Iteration Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-96 rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          {Object.keys(result.iterations[0] || {}).map((k) => (
                            <th key={k} className="p-3 text-left font-medium text-muted-foreground">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {result.iterations.map((it: any, i: number) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="border-b last:border-0 hover:bg-muted/30"
                            >
                              {Object.values(it).map((v: any, j: number) => (
                                <td key={j} className="p-3 font-mono text-xs">
                                  {typeof v === "number" ? v.toFixed(6) : String(v)}
                                </td>
                              ))}
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
