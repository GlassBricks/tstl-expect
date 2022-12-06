/** @noSelfInFile */

import { deepCompare, prettyPrint } from "../pretty-print-and-diff"
import { assertIsNumber, assertNotNil } from "./utils"
import { AssertionContext } from "../types"

export function length(this: AssertionContext, received: unknown, expected: unknown): void {
  assertIsNumber(this, expected, "Expected")
  let length: number
  if (type(received) == "string") {
    length = (received as string).length
  } else if (type(received) == "table") {
    length = (received as LuaTable).length()
  } else {
    this.fail("Received value should be a string or a table, got " + type(received))
  }
  const pass = length == expected
  if (pass != this.isNot) return
  this.fail(
    `Expected length: ${this.isNot ? "not " : ""}${expected}\n` +
      `Received length: ${length}\n` +
      `Received value: ${prettyPrint(received)}`,
  )
}

export function haveKey(this: AssertionContext, received: unknown, expected: unknown): void {
  assertNotNil(this, expected, "Received")
  const pass = type(received) == "table" && (received as LuaTable).has(expected)
  if (pass != this.isNot) return
  this.fail(
    `Expected: ${this.isNot ? "not " : ""}to have key ${prettyPrint(expected)}\n` +
      `Received: ${prettyPrint(received)}`,
  )
}

export function contain(this: AssertionContext, received: unknown, expected: unknown): void {
  let pass = false
  const receivedType = type(received)
  if (receivedType == "table" || receivedType == "string") {
    for (const value of received as Iterable<any>) {
      if (value == expected) {
        pass = true
        break
      }
    }
  }
  if (pass != this.isNot) return
  this.fail(
    `Expected: ${this.isNot ? "not " : ""}to contain ${prettyPrint(expected)}\n` + `Received: ${prettyPrint(received)}`,
  )
}

export function containEqual(this: AssertionContext, received: unknown, expected: unknown): void {
  let pass = false
  for (const value of received as Iterable<any>) {
    if (deepCompare(expected, value)) {
      pass = true
      break
    }
  }
  if (pass != this.isNot) return
  this.fail(
    `Expected: ${this.isNot ? "not " : ""}to contain ${prettyPrint(expected)}\n` + `Received: ${prettyPrint(received)}`,
  )
}
