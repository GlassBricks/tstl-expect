import { assertIsNumber } from "./utils"
import { MatcherContext } from "../types"

export function closeTo(this: MatcherContext, received: unknown, expected: unknown, precision: number = 0.01): void {
  assertIsNumber(this, received, "Received")
  assertIsNumber(this, expected, "Expected")
  if (precision <= 0) {
    this.fail(`Precision must be greater than 0, got: ${precision}`)
  }
  let pass: boolean
  if (received == Infinity || received == -Infinity) {
    pass = received == expected
  } else {
    const actualDiff = Math.abs(received - expected)
    pass = actualDiff < precision
  }

  if (pass != this.isNot) return

  this.fail(
    `Expected: ${this.isNot ? "not " : ""}${expected}
Received: ${received}
Expected difference: ${this.isNot ? ">=" : "<"} ${precision}
Received difference: ${Math.abs(received - expected)}`,
  )
}

function comparingMatcher(
  operator: string,
  fn: (received: number, expected: number) => boolean,
): (this: MatcherContext, received: unknown, expected: unknown) => void {
  return function (this: MatcherContext, received: unknown, expected: unknown): void {
    assertIsNumber(this, received, "Received")
    assertIsNumber(this, expected, "Expected")
    const pass = fn(received, expected)
    if (pass != this.isNot) return
    this.fail(`Expected: ${this.isNot ? "not " : ""}${operator} ${expected}\n` + `Received: ${received}`)
  }
}

export const gt = comparingMatcher(">", (received, expected) => received > expected)
export const gte = comparingMatcher(">=", (received, expected) => received >= expected)
export const lt = comparingMatcher("<", (received, expected) => received < expected)
export const lte = comparingMatcher("<=", (received, expected) => received <= expected)

export function isNan(this: MatcherContext, received: unknown): void {
  const pass = typeof received == "number" && isNaN(received)
  if (pass != this.isNot) return
  this.fail(`Expected: ${this.isNot ? "not " : ""}NaN\nReceived: ${received}`, nil, "")
}
