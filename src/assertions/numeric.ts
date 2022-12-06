import { assertIsNumber } from "./utils"
import { AssertionContext } from "../types"

export function closeTo(this: AssertionContext, received: unknown, expected: unknown, precision: number = 0.01): void {
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
    `Expected: ${this.isNot ? "not " : ""}${expected}\n` +
      `Received: ${received}\n` +
      `Expected difference: ${this.isNot ? ">=" : "<"} ${precision}\n` +
      `Received difference: ${Math.abs(received - expected)}`,
  )
}

function compareAssertion(
  operator: string,
  fn: (received: number, expected: number) => boolean,
): (this: AssertionContext, received: unknown, expected: unknown) => void {
  return function (this: AssertionContext, received: unknown, expected: unknown): void {
    assertIsNumber(this, received, "Received")
    assertIsNumber(this, expected, "Expected")
    const pass = fn(received, expected)
    if (pass != this.isNot) return
    this.fail(
      `Expected: ${this.isNot ? "not " : ""}${received} ${operator} ${expected}\n` +
        `Received: ${this.isNot ? "    " : ""}${received}`,
    )
  }
}

export const gt = compareAssertion(">", (received, expected) => received > expected)
export const gte = compareAssertion(">=", (received, expected) => received >= expected)
export const lt = compareAssertion("<", (received, expected) => received < expected)
export const lte = compareAssertion("<=", (received, expected) => received <= expected)

export function isNan(this: AssertionContext, received: unknown): void {
  const pass = typeof received == "number" && isNaN(received)
  if (pass != this.isNot) return
  this.fail(`Expected: ${this.isNot ? "not " : ""}NaN\nReceived: ${received}`, nil, "")
}
