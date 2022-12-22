import { assertIsFunction } from "./utils"
import { deepCompare, getDiffString, prettyPrint } from "../pretty-print-and-diff"
import { MatcherContext, Matchers } from "../types"

export function toThrow(this: MatcherContext, received: unknown, value?: unknown): Matchers<unknown> {
  assertIsFunction(this, received, "Received")
  const [success, result] = pcall(received)
  if (value == nil) {
    assertThrown(this, success, result)
  } else if (typeof value == "string") {
    assertThrownWithMessage(this, success, result, value)
  } else {
    assertThrownWithValue(this, success, result, value)
  }
  return this.chainMatcher(result)
}

function assertThrown(context: MatcherContext, success: boolean, result: unknown): void {
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

function assertThrownWithMessage(context: MatcherContext, success: boolean, result: unknown, message: string): void {
  const pass = !success && typeof result == "string" && result.includes(message)
  if (pass != context.isNot) return
  if (context.isNot) {
    context.fail(`Expected error: not including ${prettyPrint(message)}
Received error: ${prettyPrint(result)}`)
  } else {
    if (success) {
      context.fail(
        `Expected error: including ${prettyPrint(message)}
Received function did not error
Returned value: ${prettyPrint(result)}`,
      )
    } else {
      context.fail(`Expected error: including ${prettyPrint(message)}
Received error: ${prettyPrint(result)}
`)
    }
  }
}

function assertThrownWithValue(context: MatcherContext, success: boolean, result: unknown, value: unknown): void {
  const pass = !success && deepCompare(value, result)
  if (pass != context.isNot) return
  if (context.isNot) {
    context.fail(`Expected error: not ${prettyPrint(value)}
Received error: ${prettyPrint(result)}`)
  } else {
    if (success) {
      context.fail(
        `Expected error: ${prettyPrint(value)}
Received function did not error
Returned value: ${prettyPrint(result)}`,
      )
    } else {
      context.fail(`Expected error: ${prettyPrint(value)}
Received error: ${getDiffString(value, result)}`)
    }
  }
}
