import { getDiffString, prettyPrint } from "../pretty-print-and-diff"
import { isPrimitiveType, isTstlClass } from "../utils"
import { AssertionContext } from "../types"

export function toBe(this: AssertionContext, received: unknown, expected: unknown): void {
  const pass = rawequal(received, expected)
  if (pass != this.isNot) return

  const expectedStr = prettyPrint(expected)
  const comment = "Using reference (rawequal) equality"
  if (this.isNot) {
    if (isPrimitiveType(expected)) {
      this.fail(`Expected: not ${expectedStr}`)
    } else {
      this.fail(`Expected: not ${expectedStr} (${tostring(expected)})`, comment)
    }
  } else {
    const receivedStr = prettyPrint(received)
    let message = `Expected: ${expectedStr}\nReceived: ${receivedStr}`
    if (expectedStr == receivedStr) {
      message +=
        "\n\nValues have no visual difference, but are not reference-equal. Use .equal() to deeply compare values."
    }
    this.fail(message, isPrimitiveType(expected) ? nil : comment)
  }
}

export function equal(this: AssertionContext, received: unknown, expected: unknown): void {
  const diffString = getDiffString(expected, received, false)
  const pass = diffString == nil
  if (pass != this.isNot) return
  if (this.isNot) {
    this.fail(`Expected: not ${prettyPrint(expected)}`)
  } else {
    this.fail(`Expected: ${prettyPrint(expected)}\nReceived: ${diffString}`)
  }
}

export function matchTable(this: AssertionContext, received: unknown, expected: unknown): void {
  const diffString = getDiffString(expected, received, true)
  const pass = diffString == nil
  if (pass != this.isNot) return
  if (this.isNot) {
    this.fail(`Expected: not ${prettyPrint(expected)}\nReceived: ${prettyPrint(received)}`)
  } else {
    this.fail(`Expected: ${prettyPrint(expected)}\nReceived: ${diffString}`)
  }
}

export function a(this: AssertionContext, received: unknown, expected: unknown): void {
  if (type(expected) == "string") {
    const pass = type(received) == expected
    if (pass != this.isNot) return
    this.fail(`Expected:${this.isNot ? " not" : ""} a ${expected}\n` + `Received: ${prettyPrint(received)}`, nil)
  } else if (isTstlClass(expected)) {
    const pass = received instanceof expected
    if (pass != this.isNot) return
    this.fail(
      `Expected: ${this.isNot ? "not " : ""}an instance of ${expected.name ?? "<anonymous>"}\n` +
        `Received: ${prettyPrint(received)}`,
    )
  } else {
    this.fail(`Expected a string or a class as expected value, got ${prettyPrint(expected)}`)
  }
}

function simplePredicateAssertion(
  fn: (this: AssertionContext, received: unknown) => boolean,
): (this: AssertionContext, received: unknown) => void {
  return function (this: AssertionContext, received: unknown) {
    const pass = fn.call(this, received)
    if (pass == this.isNot) {
      this.fail(`Received: ${prettyPrint(received)}`, nil, "")
    }
  }
}

export const any = simplePredicateAssertion((x) => x != nil)
export const nilFn = simplePredicateAssertion((x) => x == nil)
export const truthy = simplePredicateAssertion((x) => !!x)
export const falsy = simplePredicateAssertion((x) => !x)
