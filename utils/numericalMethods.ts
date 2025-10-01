import { compile, derivative } from "mathjs"

/**
 * Evaluation options for numerical methods
 */
export interface NumericalOptions {
  tol?: number
  maxIter?: number
}

/**
 * Result structure for numerical methods
 */
export interface NumericalResult {
  iterations: Record<string, number>[]
  summary: {
    root: number
    iterations: number
    converged: boolean
    plotRange: [number, number]
    samples: Array<{ x: number; y: number }>
    yMin: number
    yMax: number
    [key: string]: any
  }
}

/**
 * Helper to safely evaluate mathjs expression f at x with error handling
 */
function evalf(expr: string, x: number): number {
  try {
    const f = compile(expr) as any
    const val = f.evaluate({ x })
    const num = typeof val === "number" ? val : Number(val)
    return Number.isFinite(num) ? num : Number.NaN
  } catch (error) {
    return Number.NaN
  }
}

/**
 * Sample function values for plotting with adaptive sampling and outlier handling
 */
export function sampleFunction(
  expr: string,
  from: number = -5,
  to: number = 5,
  n: number = 500
): { samples: Array<{ x: number; y: number }>; yMin: number; yMax: number } {
  const samples: Array<{ x: number; y: number }> = []
  let yMin = Number.POSITIVE_INFINITY
  let yMax = Number.NEGATIVE_INFINITY

  for (let i = 0; i < n; i++) {
    const x = from + (i / (n - 1)) * (to - from)
    let y = evalf(expr, x)

    // Clamp extreme values for better visualization
    if (Number.isFinite(y)) {
      if (Math.abs(y) > 1e6) {
        y = Math.sign(y) * 1e6
      }
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
    } else {
      y = Number.NaN
    }

    samples.push({ x, y })
  }

  // Handle edge cases
  if (yMin === Number.POSITIVE_INFINITY) {
    yMin = -1
    yMax = 1
  } else if (yMin === yMax) {
    yMin = yMin - 1
    yMax = yMax + 1
  }

  // Add padding to y-range for better visualization
  const yPadding = (yMax - yMin) * 0.15
  yMin -= yPadding
  yMax += yPadding

  return { samples, yMin, yMax }
}

/**
 * Format number for iteration display
 */
function formatIterationValue(value: number): number {
  return Number(value.toFixed(10))
}

/**
 * Bisection method - Bracketing method that repeatedly bisects an interval
 * Requires f(a) and f(b) to have opposite signs
 */
export function solveBisection(
  expr: string,
  a0: number,
  b0: number,
  opts: NumericalOptions = {}
): NumericalResult {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  
  let a = a0
  let b = b0
  let fa = evalf(expr, a)
  let fb = evalf(expr, b)

  // Validate initial conditions
  if (Number.isNaN(fa) || Number.isNaN(fb)) {
    throw new Error("f(a) or f(b) is not finite. Check your function and bounds.")
  }
  if (fa * fb > 0) {
    throw new Error("f(a) and f(b) must have opposite signs. Choose different bounds.")
  }

  const iters: any[] = []
  let mid = a
  let converged = false

  for (let k = 0; k < maxIter; k++) {
    mid = 0.5 * (a + b)
    const fmid = evalf(expr, mid)
    const width = Math.abs(b - a)
    const error = Math.abs(fmid)

    iters.push({
      iter: k + 1,
      a: formatIterationValue(a),
      b: formatIterationValue(b),
      mid: formatIterationValue(mid),
      fx: formatIterationValue(fmid),
      width: formatIterationValue(width),
      error: formatIterationValue(error),
    })

    if (!Number.isFinite(fmid)) {
      throw new Error("Function evaluation resulted in non-finite value")
    }

    // Check convergence criteria
    if (Math.abs(fmid) < tol || width / 2 < tol) {
      converged = true
      break
    }

    // Update interval
    if (fa * fmid <= 0) {
      b = mid
      fb = fmid
    } else {
      a = mid
      fa = fmid
    }
  }

  const sampled = sampleFunction(expr, a0 - 1, b0 + 1)

  return {
    iterations: iters,
    summary: {
      root: mid,
      iterations: iters.length,
      converged,
      plotRange: [a0 - 1, b0 + 1],
      initialInterval: [a0, b0],
      ...sampled,
    },
  }
}

/**
 * False Position (Regula Falsi) - Linear interpolation bracketing method
 * More efficient than bisection for smooth functions
 */
export function solveFalsePosition(
  expr: string,
  a0: number,
  b0: number,
  opts: NumericalOptions = {}
): NumericalResult {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  
  let a = a0
  let b = b0
  let fa = evalf(expr, a)
  let fb = evalf(expr, b)

  // Validate initial conditions
  if (Number.isNaN(fa) || Number.isNaN(fb)) {
    throw new Error("f(a) or f(b) is not finite. Check your function and bounds.")
  }
  if (fa * fb > 0) {
    throw new Error("f(a) and f(b) must have opposite signs. Choose different bounds.")
  }

  const iters: any[] = []
  let c = a
  let converged = false

  for (let k = 0; k < maxIter; k++) {
    // Linear interpolation to find root
    c = (a * fb - b * fa) / (fb - fa)
    const fc = evalf(expr, c)
    const error = Math.abs(fc)

    iters.push({
      iter: k + 1,
      a: formatIterationValue(a),
      b: formatIterationValue(b),
      c: formatIterationValue(c),
      fa: formatIterationValue(fa),
      fb: formatIterationValue(fb),
      fc: formatIterationValue(fc),
      error: formatIterationValue(error),
    })

    if (!Number.isFinite(fc)) {
      throw new Error("Function evaluation resulted in non-finite value")
    }

    // Check convergence
    if (Math.abs(fc) < tol) {
      converged = true
      break
    }

    // Update interval
    if (fa * fc < 0) {
      b = c
      fb = fc
    } else {
      a = c
      fa = fc
    }
  }

  const sampled = sampleFunction(expr, a0 - 1, b0 + 1)

  return {
    iterations: iters,
    summary: {
      root: c,
      iterations: iters.length,
      converged,
      plotRange: [a0 - 1, b0 + 1],
      initialInterval: [a0, b0],
      ...sampled,
    },
  }
}

/**
 * Fixed-Point Iteration - Solves x = g(x)
 * Requires rearranging f(x) = 0 into the form x = g(x)
 * Convergence depends on |g'(x)| < 1 near the root
 */
export function solveFixedPoint(
  gexpr: string,
  x0: number,
  opts: NumericalOptions = {}
): NumericalResult {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  
  const iters: any[] = []
  let x = x0
  let converged = false

  for (let k = 0; k < maxIter; k++) {
    const xnext = evalf(gexpr, x)
    const diff = Math.abs(xnext - x)

    iters.push({
      iter: k + 1,
      x: formatIterationValue(x),
      gx: formatIterationValue(xnext),
      diff: formatIterationValue(diff),
    })

    if (!Number.isFinite(xnext)) {
      throw new Error("g(x) evaluation resulted in non-finite value")
    }

    // Check convergence
    if (diff < tol) {
      x = xnext
      converged = true
      break
    }

    // Check for divergence
    if (Math.abs(xnext) > 1e10) {
      throw new Error("Method is diverging. Try a different g(x) formulation or initial guess.")
    }

    x = xnext
  }

  const sampled = sampleFunction(gexpr, x0 - 5, x0 + 5)

  return {
    iterations: iters,
    summary: {
      root: x,
      iterations: iters.length,
      converged,
      plotRange: [x0 - 5, x0 + 5],
      ...sampled,
    },
  }
}

/**
 * Newton-Raphson Method - Uses tangent line approximation
 * Quadratic convergence when close to root
 * Requires derivative calculation
 */
export function solveNewton(
  expr: string,
  x0: number,
  opts: NumericalOptions = {}
): NumericalResult {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  
  const iters: any[] = []
  let x = x0
  let converged = false

  // Compute derivative symbolically
  const dExpr = derivative(expr, "x").toString()

  for (let k = 0; k < maxIter; k++) {
    const fx = evalf(expr, x)
    const dfx = evalf(dExpr, x)

    if (!Number.isFinite(fx) || !Number.isFinite(dfx)) {
      throw new Error("Function or derivative evaluation failed")
    }

    if (Math.abs(dfx) < 1e-12) {
      throw new Error("Zero derivative encountered. Method cannot continue.")
    }

    const xnext = x - fx / dfx
    const error = Math.abs(fx)
    const diff = Math.abs(xnext - x)

    iters.push({
      iter: k + 1,
      x: formatIterationValue(x),
      fx: formatIterationValue(fx),
      dfx: formatIterationValue(dfx),
      xnext: formatIterationValue(xnext),
      error: formatIterationValue(error),
      diff: formatIterationValue(diff),
    })

    // Check convergence
    if (diff < tol || error < tol) {
      x = xnext
      converged = true
      break
    }

    // Check for divergence
    if (Math.abs(xnext) > 1e10) {
      throw new Error("Method is diverging. Try a different initial guess.")
    }

    x = xnext
  }

  const sampled = sampleFunction(expr, x0 - 5, x0 + 5)

  return {
    iterations: iters,
    summary: {
      root: x,
      iterations: iters.length,
      converged,
      plotRange: [x0 - 5, x0 + 5],
      derivative: dExpr,
      ...sampled,
    },
  }
}

/**
 * Secant Method - Approximates derivative using finite differences
 * Superlinear convergence (order ~1.618)
 * Does not require symbolic derivative
 */
export function solveSecant(
  expr: string,
  x0: number,
  x1: number,
  opts: NumericalOptions = {}
): NumericalResult {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  
  const iters: any[] = []
  let xprev = x0
  let x = x1
  let fprev = evalf(expr, xprev)
  let fx = evalf(expr, x)
  let converged = false

  for (let k = 0; k < maxIter; k++) {
    const denominator = fx - fprev

    if (Math.abs(denominator) < 1e-12) {
      throw new Error("Division by zero in secant method. Try different initial guesses.")
    }

    if (!Number.isFinite(fx) || !Number.isFinite(fprev)) {
      throw new Error("Function evaluation failed")
    }

    const xnext = x - (fx * (x - xprev)) / denominator
    const error = Math.abs(fx)
    const diff = Math.abs(xnext - x)

    iters.push({
      iter: k + 1,
      xprev: formatIterationValue(xprev),
      x: formatIterationValue(x),
      fprev: formatIterationValue(fprev),
      fx: formatIterationValue(fx),
      xnext: formatIterationValue(xnext),
      error: formatIterationValue(error),
      diff: formatIterationValue(diff),
    })

    if (!Number.isFinite(xnext)) {
      throw new Error("Next iteration resulted in non-finite value")
    }

    // Check convergence
    if (diff < tol || error < tol) {
      x = xnext
      converged = true
      break
    }

    // Check for divergence
    if (Math.abs(xnext) > 1e10) {
      throw new Error("Method is diverging. Try different initial guesses.")
    }

    // Update for next iteration
    xprev = x
    fprev = fx
    x = xnext
    fx = evalf(expr, x)
  }

  const sampled = sampleFunction(expr, Math.min(x0, x1) - 5, Math.max(x0, x1) + 5)

  return {
    iterations: iters,
    summary: {
      root: x,
      iterations: iters.length,
      converged,
      plotRange: [Math.min(x0, x1) - 5, Math.max(x0, x1) + 5],
      ...sampled,
    },
  }
}