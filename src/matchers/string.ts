import { prettyPrint } from "../pretty-print-and-diff"
import { assertIsString } from "./utils"
import { MatcherContext } from "../types"

export function match(this: MatcherContext, received: unknown, expected: unknown): void {
  assertIsString(this, received, "Received")
  assertIsString(this, expected, "Expected")

  const pass = string.match(received, expected)[0] != nil
  if (pass != this.isNot) return
  if (this.isNot) {
    this.fail(`Expected pattern: not ${prettyPrint(expected)}\nReceived string: ${prettyPrint(received)}`)
  } else {
    this.fail(`Expected pattern: ${prettyPrint(expected)}\nReceived string: ${prettyPrint(received)}`)
  }
}

export function stringInclude(this: MatcherContext, received: unknown, expected: unknown): void {
  if (typeof received == "string") {
    assertIsString(this, expected, "Expected")
    const pass = received.includes(expected)
    if (pass != this.isNot) return
    if (this.isNot) {
      this.fail(`Expected substring: not ${prettyPrint(expected)}\nReceived string: ${prettyPrint(received)}`)
    } else {
      this.fail(`Expected substring: ${prettyPrint(expected)}\nReceived string: ${prettyPrint(received)}`)
    }
  }
}
