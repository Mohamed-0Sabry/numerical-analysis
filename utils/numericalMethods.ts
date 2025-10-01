import { compile, derivative } from "mathjs"

/**
 * Helper to evaluate mathjs expression f at x with better error handling
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
 * Sample function values for plotting with adaptive sampling
 */
export function sampleFunction(expr: string, from = -5, to = 5, n = 500) {
  const xs: Array<{ x: number; y: number }> = []
  let yMin = Number.POSITIVE_INFINITY
  let yMax = Number.NEGATIVE_INFINITY

  for (let i = 0; i < n; i++) {
    const x = from + (i / (n - 1)) * (to - from)
    let y = evalf(expr, x)

    // Clamp extreme values for better visualization
    if (Number.isFinite(y)) {
      if (Math.abs(y) > 1e6) y = Math.sign(y) * 1e6
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
    } else {
      y = Number.NaN
    }

    xs.push({ x, y })
  }

  if (yMin === Number.POSITIVE_INFINITY) {
    yMin = -1
    yMax = 1
  } else if (yMin === yMax) {
    yMin = yMin - 1
    yMax = yMax + 1
  }

  // Add padding to y-range for better visualization
  const yPadding = (yMax - yMin) * 0.1
  yMin -= yPadding
  yMax += yPadding

  return { samples: xs, yMin, yMax }
}

type Options = { tol?: number; maxIter?: number }

/**
 * Bisection method with enhanced iteration data
 */
export function solveBisection(expr: string, a0: number, b0: number, opts: Options = {}) {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  let a = a0
  let b = b0
  let fa = evalf(expr, a)
  let fb = evalf(expr, b)

  if (Number.isNaN(fa) || Number.isNaN(fb)) {
    throw new Error("f(a) or f(b) is not finite")
  }
  if (fa * fb > 0) {
    throw new Error("f(a) and f(b) must have opposite signs")
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
      a: Number(a.toFixed(10)),
      b: Number(b.toFixed(10)),
      mid: Number(mid.toFixed(10)),
      fx: Number(fmid.toFixed(10)),
      width: Number(width.toFixed(10)),
      error: Number(error.toFixed(10)),
    })

    if (!Number.isFinite(fmid)) break

    if (Math.abs(fmid) < tol || width / 2 < tol) {
      converged = true
      break
    }

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
 * False position (Regula Falsi) with enhanced data
 */
export function solveFalsePosition(expr: string, a0: number, b0: number, opts: Options = {}) {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  let a = a0
  let b = b0
  let fa = evalf(expr, a)
  let fb = evalf(expr, b)

  if (Number.isNaN(fa) || Number.isNaN(fb)) {
    throw new Error("f(a) or f(b) is not finite")
  }
  if (fa * fb > 0) {
    throw new Error("f(a) and f(b) must have opposite signs")
  }

  const iters: any[] = []
  let c = a
  let converged = false

  for (let k = 0; k < maxIter; k++) {
    c = (a * fb - b * fa) / (fb - fa)
    const fc = evalf(expr, c)
    const error = Math.abs(fc)

    iters.push({
      iter: k + 1,
      a: Number(a.toFixed(10)),
      b: Number(b.toFixed(10)),
      c: Number(c.toFixed(10)),
      fa: Number(fa.toFixed(10)),
      fb: Number(fb.toFixed(10)),
      fc: Number(fc.toFixed(10)),
      error: Number(error.toFixed(10)),
    })

    if (!Number.isFinite(fc)) break

    if (Math.abs(fc) < tol) {
      converged = true
      break
    }

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
 * Fixed-point iteration for x = g(x)
 */
export function solveFixedPoint(gexpr: string, x0: number, opts: Options = {}) {
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
      x: Number(x.toFixed(10)),
      gx: Number(xnext.toFixed(10)),
      diff: Number(diff.toFixed(10)),
    })

    if (!Number.isFinite(xnext)) break

    if (diff < tol) {
      x = xnext
      converged = true
      break
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
 * Newton-Raphson method with tangent line data
 */
export function solveNewton(expr: string, x0: number, opts: Options = {}) {
  const tol = opts.tol ?? 1e-6
  const maxIter = opts.maxIter ?? 50
  const iters: any[] = []
  let x = x0
  let converged = false

  const dExpr = derivative(expr, "x").toString()

  for (let k = 0; k < maxIter; k++) {
    const fx = evalf(expr, x)
    const dfx = evalf(dExpr, x)

    if (!Number.isFinite(fx) || !Number.isFinite(dfx)) {
      iters.push({
        iter: k + 1,
        x: Number(x.toFixed(10)),
        fx: Number(fx.toFixed(10)),
        dfx: Number(dfx.toFixed(10)),
      })
      break
    }

    if (Math.abs(dfx) < 1e-12) {
      throw new Error("Zero derivative encountered during Newton-Raphson")
    }

    const xnext = x - fx / dfx
    const error = Math.abs(fx)
    const diff = Math.abs(xnext - x)

    iters.push({
      iter: k + 1,
      x: Number(x.toFixed(10)),
      fx: Number(fx.toFixed(10)),
      dfx: Number(dfx.toFixed(10)),
      xnext: Number(xnext.toFixed(10)),
      error: Number(error.toFixed(10)),
      diff: Number(diff.toFixed(10)),
    })

    if (diff < tol) {
      x = xnext
      converged = true
      break
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
 * Secant method with secant line data
 */
export function solveSecant(expr: string, x0: number, x1: number, opts: Options = {}) {
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

    if (Math.abs(denominator) < 1e-12 || !Number.isFinite(fx) || !Number.isFinite(fprev)) {
      iters.push({
        iter: k + 1,
        xprev: Number(xprev.toFixed(10)),
        x: Number(x.toFixed(10)),
        fprev: Number(fprev.toFixed(10)),
        fx: Number(fx.toFixed(10)),
      })
      break
    }

    const xnext = x - (fx * (x - xprev)) / denominator
    const error = Math.abs(fx)
    const diff = Math.abs(xnext - x)

    iters.push({
      iter: k + 1,
      xprev: Number(xprev.toFixed(10)),
      x: Number(x.toFixed(10)),
      fprev: Number(fprev.toFixed(10)),
      fx: Number(fx.toFixed(10)),
      xnext: Number(xnext.toFixed(10)),
      error: Number(error.toFixed(10)),
      diff: Number(diff.toFixed(10)),
    })

    if (!Number.isFinite(xnext)) break

    if (diff < tol) {
      x = xnext
      converged = true
      break
    }

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
