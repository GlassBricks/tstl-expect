import { prettyPrint } from "../pretty-print-and-diff"
import { assertIsString } from "./utils"
import { AssertionContext } from "../types"

export function match(this: AssertionContext, received: unknown, expected: unknown): void {
  assertIsString(this, received, "Received")
  assertIsString(this, expected, "Expected")

  const pass = string.match(received, expected)[0] != nil
  if (pass != this.isNot) return
  if (this.isNot) {
    this.fail(`Expected pattern: not ${prettyPrint(expected)}\n` + `Received string: ${prettyPrint(received)}`)
  } else {
    this.fail(`Expected pattern: ${prettyPrint(expected)}\n` + `Received string: ${prettyPrint(received)}`)
  }
}

export function stringInclude(this: AssertionContext, received: unknown, expected: unknown): void {
  if (typeof received == "string") {
    assertIsString(this, expected, "Expected")
    const pass = received.includes(expected)
    if (pass != this.isNot) return
    if (this.isNot) {
      this.fail(`Expected substring: not ${prettyPrint(expected)}\n` + `Received string: ${prettyPrint(received)}`)
    } else {
      this.fail(`Expected substring: ${prettyPrint(expected)}\n` + `Received string: ${prettyPrint(received)}`)
    }
  }
}
