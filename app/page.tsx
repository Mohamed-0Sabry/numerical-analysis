"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import MethodVisualizer from "@/components/MethodVisualizer"
import { 
  solveBisection, 
  solveFalsePosition, 
  solveFixedPoint, 
  solveNewton, 
  solveSecant 
} from "@/utils/numericalMethods"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Play, RotateCcw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Method = "bisection" | "false-position" | "fixed-point"

interface MethodResult {
  iterations: any[]
  summary: {
    root: number
    iterations: number
    converged: boolean
    [key: string]: any
  }
  error?: string
}

const METHOD_INFO: Record<Method, { name: string; description: string }> = {
  bisection: { name: "Bisection Method", description: "Bracketing method that repeatedly bisects an interval" },
  "false-position": { name: "False Position", description: "Regula Falsi - linear interpolation bracketing method" },
  "fixed-point": { name: "Fixed-Point Iteration - still in development", description: "Open method solving x = g(x)" },
  // newton: { name: "Newton-Raphson", description: "Open method using tangent lines (requires derivative)" },
  // secant: { name: "Secant Method", description: "Open method approximating derivative with finite differences" },
}

const formatVal = (val: any) => {
  if (val === null || val === undefined || isNaN(val)) return "-"
  if (typeof val !== "number") return String(val)
  if (Math.abs(val - Math.round(val)) < 1e-9) return Math.round(val)
  return parseFloat(val.toFixed(6))
}

export default function Home() {
  const [method, setMethod] = useState<Method>("bisection")
  const [expr, setExpr] = useState("x^3 - x - 2")
  const [gexpr, setGexpr] = useState("(x + 2)^(1/3)")
  const [a, setA] = useState("-2")
  const [b, setB] = useState("2")
  const [x0, setX0] = useState("1")
  const [x1, setX1] = useState("2")
  const [tol, setTol] = useState("0.000001")
  const [maxIter, setMaxIter] = useState("50")
  const [result, setResult] = useState<MethodResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const run = useCallback((): void => {
    setIsRunning(true)
    const options = { tol: Number(tol), maxIter: Number(maxIter) }
    setTimeout(() => {
      try {
        let res: MethodResult
        switch (method) {
          case "bisection": res = solveBisection(expr, Number(a), Number(b), options); break
          case "false-position": res = solveFalsePosition(expr, Number(a), Number(b), options); break
          case "fixed-point": res = solveFixedPoint(gexpr, Number(x0), options); break
          // case "newton": res = solveNewton(expr, Number(x0), options); break
          // case "secant": res = solveSecant(expr, Number(x0), Number(x1), options); break
          default: throw new Error("Unknown method")
        }
        setResult(res)
      } catch (err: any) {
        setResult({ iterations: [], summary: { root: 0, iterations: 0, converged: false }, error: err.message })
      } finally {
        setIsRunning(false)
      }
    }, 100)
  }, [method, expr, gexpr, a, b, x0, x1, tol, maxIter])

  const reset = useCallback(() => setResult(null), [])
  const handleMethodChange = useCallback((val: Method) => { setMethod(val); setResult(null) }, [])

  const renderInputFields = () => {
    const requiresBracket = method === "bisection" || method === "false-position"

    // !!TODO: add support for newton and secant and remove this
    // const requiresInitialGuess = method === "newton" || method === "fixed-point"
    const requiresInitialGuess = method === "fixed-point"
    // const requiresTwoGuesses = method === "secant"
    const requiresTwoGuesses = false
    const requiresGFunction = method === "fixed-point"

    return (
      <>
        {!requiresGFunction && (
          <div className="space-y-2">
            <Label htmlFor="expr">Function f(x)</Label>
            <Input id="expr" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="e.g., x^3 - x - 2" className="font-mono text-sm" />
          </div>
        )}
        <AnimatePresence mode="wait">
          {requiresGFunction && (
            <motion.div key="gfunction" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
              <Label htmlFor="gexpr">Function g(x)</Label>
              <Input id="gexpr" value={gexpr} onChange={(e) => setGexpr(e.target.value)} placeholder="e.g., (x + 2)^(1/3)" className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground">Rearrange f(x) = 0 to x = g(x) form</p>
            </motion.div>
          )}
          {requiresBracket && (
            <motion.div key="bracket" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="a">Lower Bound (a)</Label>
                <Input id="a" value={a} onChange={(e) => setA(e.target.value)} placeholder="a" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b">Upper Bound (b)</Label>
                <Input id="b" value={b} onChange={(e) => setB(e.target.value)} placeholder="b" className="font-mono text-sm" />
              </div>
            </motion.div>
          )}
          {requiresInitialGuess && (
            <motion.div key="initial-guess" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
              <Label htmlFor="x0">Initial Guess (x₀)</Label>
              <Input id="x0" value={x0} onChange={(e) => setX0(e.target.value)} placeholder="x₀" className="font-mono text-sm" />
            </motion.div>
          )}
          {requiresTwoGuesses && (
            <motion.div key="two-guesses" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="x0-secant">First Guess (x₀)</Label>
                <Input id="x0-secant" value={x0} onChange={(e) => setX0(e.target.value)} placeholder="x₀" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="x1">Second Guess (x₁)</Label>
                <Input id="x1" value={x1} onChange={(e) => setX1(e.target.value)} placeholder="x₁" className="font-mono text-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg">
              <Image 
                src="/icon-512.png" 
                alt="App Logo" 
                width={100} 
                height={100} 
                className="object-contain"
              />
              </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Numerical Analysis</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Root Finding Methods Visualizer</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <motion.div className="lg:col-span-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="lg:sticky lg:top-24">
              <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {/* Method Selection */}
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select value={method} onValueChange={handleMethodChange}>
                    <SelectTrigger id="method"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(METHOD_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{METHOD_INFO[method].description}</p>
                </div>

                {renderInputFields()}

                {/* Convergence Params */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tol">Tolerance</Label>
                    <Input id="tol" value={tol} onChange={(e) => setTol(e.target.value)} placeholder="1e-6" className="font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxIter">Max Iterations</Label>
                    <Input id="maxIter" value={maxIter} onChange={(e) => setMaxIter(e.target.value)} placeholder="50" className="font-mono text-sm" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={run} disabled={isRunning} className="flex-1" size="default">
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running..." : "Run Method"}
                  </Button>
                  {result && (
                    <Button onClick={reset} variant="outline" size="default" className="flex-1 sm:flex-none">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {result?.error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{result.error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results Summary */}
                <AnimatePresence>
                  {result && !result.error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Root Found:</span>
                          <span className="text-base md:text-lg font-bold font-mono text-primary">{formatVal(result.summary.root)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Iterations:</span>
                          <span className="text-sm font-mono">{formatVal(result.summary.iterations)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Converged:</span>
                          <span className={`text-sm font-semibold ${result.summary.converged ? "text-green-600" : "text-orange-600"}`}>
                            {result.summary.converged ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel */}
          <motion.div className="lg:col-span-8 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <MethodVisualizer expr={expr} method={method} data={result} />

            {/* Iteration Table */}
            {result && !result.error && result.iterations.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Iteration Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-[28rem] rounded-lg border">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          {Object.keys(result.iterations[0] || {}).map((k) => (
                            <th key={k} className="p-2 md:p-3 text-left font-medium text-muted-foreground uppercase text-[10px] sm:text-xs tracking-wide">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {result.iterations.map((it: any, i: number) => (
                            <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              {Object.values(it).map((v: any, j: number) => (
                                <td key={j} className="p-2 md:p-3 font-mono text-[10px] sm:text-xs">{formatVal(v)}</td>
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
