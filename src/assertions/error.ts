import { assertIsFunction } from "./utils"
import { deepCompare, getDiffString, prettyPrint } from "../pretty-print-and-diff"
import { Assertion, AssertionContext } from "../types"

export function toThrow(this: AssertionContext, received: unknown, value?: unknown): Assertion<unknown> {
  assertIsFunction(this, received, "Received")
  const [success, result] = pcall(received)
  if (value == nil) {
    assertThrown(this, success, result)
  } else if (typeof value == "string") {
    assertThrownWithMessage(this, success, result, value)
  } else {
    assertThrownWithValue(this, success, result, value)
  }
  return this.chainAssertion(result)
}

function assertThrown(context: AssertionContext, success: boolean, result: unknown): void {
  const pass = !success
  if (pass != context.isNot) return
  if (context.isNot) {
    context.fail(
      `Expected: not to error
Received function errored with: ${prettyPrint(result)}`,
      nil,
      "",
    )
  } else {
    context.fail(
      `Expected: to error
Received function did not error
Returned value: ${prettyPrint(result)}`,
      nil,
      "",
    )
  }
}

function assertThrownWithMessage(context: AssertionContext, success: boolean, result: unknown, message: string): void {
  const pass = !success && typeof result == "string" && result.includes(message)
  if (pass != context.isNot) return
  if (context.isNot) {
    context.fail(`Expected error: not including ${prettyPrint(message)}\n` + `Received error: ${prettyPrint(result)}`)
  } else {
    if (success) {
      context.fail(
        `Expected error: including ${prettyPrint(message)}\n` +
          `Received function did not error\n` +
          `Returned value: ${prettyPrint(result)}`,
      )
    } else {
      context.fail(`Expected error: including ${prettyPrint(message)}\n` + `Received error: ${prettyPrint(result)}\n`)
    }
  }
}

function assertThrownWithValue(context: AssertionContext, success: boolean, result: unknown, value: unknown): void {
  const pass = !success && deepCompare(value, result)
  if (pass != context.isNot) return
  if (context.isNot) {
    context.fail(`Expected error: not ${prettyPrint(value)}\n` + `Received error: ${prettyPrint(result)}`)
  } else {
    if (success) {
      context.fail(
        `Expected error: ${prettyPrint(value)}\n` +
          `Received function did not error\n` +
          `Returned value: ${prettyPrint(result)}`,
      )
    } else {
      context.fail(`Expected error: ${prettyPrint(value)}\n` + `Received error: ${getDiffString(value, result)}`)
    }
  }
}
