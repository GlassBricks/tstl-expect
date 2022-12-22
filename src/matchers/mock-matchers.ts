import { BaseMock, CalledParams, MatcherContext } from "../types"
import { mock } from "../mock"
import { deepCompare, getDiffString, prettyPrint } from "../pretty-print-and-diff"
import { assertIsNonNegativeInteger, assertIsPositiveInteger } from "./utils"
import { pack } from "../pack"

function assertIsMock(context: MatcherContext, received: unknown): asserts received is BaseMock<any> {
  if (!mock.isMock(received)) {
    context.fail(`Received value should be a mock.\Received: ${prettyPrint(received)}`)
  }
}

function printArgs(args: (unknown[] & { n?: number }) | undefined): string {
  if (!args) {
    return "(no call)"
  }
  if (args.length == 0) {
    return "(no arguments)"
  }
  const parts: string[] = []
  for (const i of $range(1, args.n ?? args.length)) {
    parts[i - 1] = prettyPrint(args[i - 1])
  }
  return parts.join(", ")
}

const MaxPrintCalls = 3

function printValues<T>(values: T[], len: number, toString: (value: T) => string, itemDescription: string): string {
  if (len == 0) {
    return `  (no ${itemDescription})`
  }
  if (len == 1) {
    return `  ${toString(values[0])}`
  }
  const lines: string[] = []
  for (const i of $range(0, math.min(len, MaxPrintCalls) - 1)) {
    lines.push(`  ${i + 1}: ${toString(values[i])}`)
  }
  if (len > MaxPrintCalls) {
    lines.push(`...${len - MaxPrintCalls} more ${itemDescription}`)
  }
  return lines.join("\n")
}
function printValuesAtIndices<T>(
  values: T[],
  len: number,
  indices: number[],
  toString: (value: T) => string,
  itemDescription: string,
  highlightIndex: number | undefined,
): string {
  if (len == 0) {
    return `  (no ${itemDescription})`
  }
  if (len == 1 && indices.includes(0)) {
    return `  ${toString(values[0])}`
  }
  const lines: string[] = []
  for (const i of indices) {
    if (i >= 0 && i < len) {
      if (i == highlightIndex) {
        lines.push(`->${i + 1}: ${toString(values[i])}`)
      } else {
        lines.push(`  ${i + 1}: ${toString(values[i])}`)
      }
    }
  }
  const numRemaining = len - lines.length
  if (numRemaining > 0) {
    lines.push(`...${numRemaining} more ${itemDescription}`)
  }
  return lines.join("\n")
}

function printCalls(calls: CalledParams[]): string {
  return printValues(calls, calls.length, printArgs, "calls")
}

function callsEqual(expected: CalledParams, actual: CalledParams): boolean {
  for (const i of $range(1, math.max(expected.n, actual.n))) {
    if (!deepCompare(expected[i - 1], actual[i - 1])) {
      return false
    }
  }
  return true
}

function getCallDiff(expected: CalledParams, actual: CalledParams): string {
  const result: string[] = []
  let hasAnyDiff = false
  for (const i of $range(1, math.max(expected.n, actual.n))) {
    const str = getDiffString(expected[i - 1], actual[i - 1])
    if (str) {
      result.push("*" + str)
      hasAnyDiff = true
    } else {
      result.push(prettyPrint(actual[i - 1]))
    }
  }
  const ret = result.join(", ")
  if (!hasAnyDiff) {
    return "(equal) " + ret
  } else {
    return ret
  }
}
function printCallsComparing(calls: CalledParams[], expected: CalledParams): string {
  return printValues(calls, calls.length, (call) => getCallDiff(expected, call), "calls")
}

function printCallsAtIndices(calls: CalledParams[], indices: number[], highlightIndex: number | undefined): string {
  return printValuesAtIndices(calls, calls.length, indices, printArgs, "calls", highlightIndex)
}

function printCallsAtIndicesComparing(
  calls: CalledParams[],
  expected: CalledParams,
  indices: number[],
  highlightIndex: number | undefined,
): string {
  return printValuesAtIndices(
    calls,
    calls.length,
    indices,
    (call) => getCallDiff(expected, call),
    "calls",
    highlightIndex,
  )
}

export function called(this: MatcherContext, received: unknown, numTimes?: unknown): void {
  if (numTimes != nil) {
    return calledTimes.call(this, received, numTimes)
  }
  assertIsMock(this, received)
  const pass = received.numCalls > 0
  if (pass != this.isNot) return

  if (this.isNot) {
    this.fail(
      `Expected: not to be called
Called: ${received.numCalls} times
Called with:
${printCalls(received.calls)}`,
      nil,
      "",
      received.getMockName(),
    )
  } else {
    this.fail(
      `Expected: to be called
Called: 0 times`,
      nil,
      "",
      received.getMockName(),
    )
  }
}

export function calledTimes(this: MatcherContext, received: unknown, numTimes: unknown): void {
  assertIsNonNegativeInteger(this, numTimes, "Expected")
  assertIsMock(this, received)
  const pass = received.numCalls == numTimes
  if (pass != this.isNot) return

  if (this.isNot) {
    this.fail(
      `Expected number of calls: not ${numTimes}
Called with:
${printCalls(received.calls)}`,
      nil,
      nil,
      received.getMockName(),
    )
  } else {
    this.fail(
      `Expected number of calls: ${numTimes}
Received number of calls: ${received.numCalls}
Called with:
${printCalls(received.calls)}`,
      nil,
      nil,
      received.getMockName(),
    )
  }
}
export function calledWith(this: MatcherContext, received: unknown, ...expected: unknown[]): void {
  assertIsMock(this, received)
  const expectedParams = pack(...expected)

  const { numCalls, calls } = received
  const matchingIndex = calls.findIndex((call) => callsEqual(expectedParams, call))
  const pass = matchingIndex > -1
  if (pass != this.isNot) return
  if (this.isNot) {
    // find up to MaxPrintCalls calls that are matching
    const indices: number[] = []
    for (const i of $range(0, numCalls - 1)) {
      if (callsEqual(expectedParams, calls[i])) {
        indices.push(i)
        if (indices.length == MaxPrintCalls) break
      }
    }
    this.fail(
      `Expected: not ${printArgs(expectedParams)}
Called with:
${printCallsAtIndices(calls, indices, nil)}`,
      nil,
      "...expected",
      received.getMockName(),
    )
  } else {
    // printCallsComparing already shows some not-matching calls
    this.fail(
      `Expected: ${printArgs(expectedParams)}
Called with:
${printCallsComparing(calls, expectedParams)}`,
      nil,
      "...expected",
      received.getMockName(),
    )
  }
}

export function lastCalledWith(this: MatcherContext, received: unknown, ...expected: unknown[]): void {
  assertIsMock(this, received)

  const { numCalls, calls, lastCall } = received
  if (numCalls == 0) {
    this.fail(
      `Expected: at least one call
Received: 0 calls`,
      nil,
      "",
      received.getMockName(),
    )
  }

  const expectedParams = pack(...expected)

  const pass = callsEqual(expectedParams, lastCall!)
  if (pass != this.isNot) return
  const indices = [numCalls - 2, numCalls - 1]
  if (this.isNot) {
    this.fail(
      `Expected: not ${printArgs(expectedParams)}
Called with:
${printCallsAtIndices(calls, indices, numCalls - 1)}`,
      nil,
      "...expected",
      received.getMockName(),
    )
  } else {
    this.fail(
      `Expected: ${printArgs(expectedParams)}
Called with:
${printCallsAtIndicesComparing(calls, expectedParams, indices, numCalls - 1)}`,
      nil,
      "...expected",
      received.getMockName(),
    )
  }
}

export function nthCalledWith(this: MatcherContext, received: unknown, n: unknown, ...expected: unknown[]): void {
  assertIsPositiveInteger(this, n, "Nth call")
  assertIsMock(this, received)

  const expectedParams = pack(...expected)

  const { numCalls, calls } = received
  if (n > numCalls) {
    this.fail(
      `n: ${n}
Expected number of calls: >= ${n}
Received number of calls: ${numCalls}
Called with:
${printCalls(calls)}`,
      nil,
      "n, ...expected",
      received.getMockName(),
    )
  }

  const pass = callsEqual(expectedParams, calls[n - 1])
  if (pass != this.isNot) return

  if (this.isNot) {
    const indices = [n - 2, n - 1, n]
    this.fail(
      `n: ${n}
Expected: not ${printArgs(expectedParams)}
Called with:
${printCallsAtIndices(calls, indices, n - 1)}`,
      nil,
      "n, ...expected",
      received.getMockName(),
    )
  } else {
    // find if any other calls match
    let firstBefore = calls.findIndex((call, index) => index < n - 1 && callsEqual(expectedParams, call))
    let firstAfter = calls.findIndex((call, index) => index > n - 1 && callsEqual(expectedParams, call))
    if (firstBefore == -1) firstBefore = n - 2
    if (firstAfter == -1) firstAfter = n
    const indices = [firstBefore, n - 1, firstAfter]
    this.fail(
      `n: ${n}
Expected: ${printArgs(expectedParams)}
Called with:
${printCallsAtIndicesComparing(calls, expectedParams, indices, n - 1)}`,
      nil,
      "n, ...expected",
      received.getMockName(),
    )
  }
}

function printReturnValues(values: unknown[], numCalls: number): string {
  return printValues(values, numCalls, (v) => prettyPrint(v), "return values")
}

function printReturnValuesAtIndices(
  values: unknown[],
  length: number,
  indices: number[],
  highlightIndex: number | undefined,
): string {
  return printValuesAtIndices(values, length, indices, (v) => prettyPrint(v), "return values", highlightIndex)
}

function getReturnDiff(expected: unknown, actual: unknown): string {
  return getDiffString(expected, actual) ?? `(equal) ${prettyPrint(actual)}`
}
function printReturnValuesComparing(values: unknown[], numCalls: number, expected: unknown): string {
  return printValues(values, numCalls, (v) => getReturnDiff(expected, v), "return values")
}

function printReturnValuesAtIndicesComparing(
  values: unknown[],
  len: number,
  expected: unknown,
  indices: number[],
  highlightIndex: number | undefined,
): string {
  return printValuesAtIndices(values, len, indices, (v) => getReturnDiff(expected, v), "return values", highlightIndex)
}

export function returnedWith(this: MatcherContext, received: unknown, expected: unknown): void {
  assertIsMock(this, received)
  const { numCalls, returnValues } = received
  // const matchingIndex = returnValues.findIndex((returnValue) => deepCompare(expected, returnValue))
  let matchingIndex = -1
  for (const i of $range(0, numCalls - 1)) {
    if (deepCompare(expected, returnValues[i])) {
      matchingIndex = i
      break
    }
  }
  const pass = matchingIndex > -1
  if (pass != this.isNot) return
  if (this.isNot) {
    const indices: number[] = []
    for (const i of $range(0, numCalls - 1)) {
      if (deepCompare(expected, returnValues[i])) {
        indices.push(i)
        if (indices.length == MaxPrintCalls) break
      }
    }
    this.fail(
      `Expected: not ${prettyPrint(expected)}
Received:
${printReturnValuesAtIndices(returnValues, numCalls, indices, nil)}`,
      nil,
      nil,
      received.getMockName(),
    )
  } else {
    this.fail(
      `Expected: ${prettyPrint(expected)}
Received:
${printReturnValuesComparing(returnValues, numCalls, expected)}`,
      nil,
      nil,
      received.getMockName(),
    )
  }
}

export function lastReturnedWith(this: MatcherContext, received: unknown, expected: unknown): void {
  assertIsMock(this, received)
  const { numCalls, returnValues } = received
  if (numCalls == 0) {
    this.fail("Expected: at least one call\n" + `Received: 0 calls`, nil, nil, received.getMockName())
  }

  const lastReturnValue = returnValues[numCalls - 1]
  const pass = deepCompare(expected, lastReturnValue)
  if (pass != this.isNot) return
  const indices = [numCalls - 2, numCalls - 1]
  if (this.isNot) {
    this.fail(
      `Expected: not ${prettyPrint(expected)}
Received:
${printReturnValuesAtIndices(returnValues, numCalls, indices, numCalls - 1)}`,
      nil,
      nil,
      received.getMockName(),
    )
  } else {
    this.fail(
      `Expected: ${prettyPrint(expected)}
Received:
${printReturnValuesAtIndicesComparing(returnValues, numCalls, expected, indices, numCalls - 1)}
Number of calls: ${numCalls}`,
      nil,
      nil,
      received.getMockName(),
    )
  }
}

export function nthReturnedWith(this: MatcherContext, received: unknown, n: unknown, expected: unknown): void {
  assertIsPositiveInteger(this, n, "Nth call")
  assertIsMock(this, received)
  const { numCalls, returnValues } = received
  if (n > numCalls) {
    this.fail(
      `n: ${n}
Expected number of calls: >= ${n}
Received number of calls: ${numCalls}
Received:
${printReturnValues(returnValues, numCalls)}`,
      nil,
      "n, expected",
      received.getMockName(),
    )
  }
  const pass = deepCompare(expected, returnValues[n - 1])
  if (pass != this.isNot) return

  if (this.isNot) {
    const indices = [n - 2, n - 1, n]
    this.fail(
      `n: ${n}
Expected: not ${prettyPrint(expected)}
Received:
${printReturnValuesAtIndices(returnValues, numCalls, indices, n - 1)}
Number of calls: ${numCalls}`,
      nil,
      "n, expected",
      received.getMockName(),
    )
  } else {
    // find if any other calls match
    let firstBefore = -1
    for (const i of $range(0, n - 2)) {
      if (deepCompare(expected, returnValues[i])) {
        firstBefore = i
        break
      }
    }
    let firstAfter = -1
    for (const i of $range(n, numCalls - 1)) {
      if (deepCompare(expected, returnValues[i])) {
        firstAfter = i
        break
      }
    }
    if (firstBefore == -1) firstBefore = n - 2
    if (firstAfter == -1) firstAfter = n
    const indices = [firstBefore, n - 1, firstAfter]
    this.fail(
      `n: ${n}
Expected: ${prettyPrint(expected)}
Received:
${printReturnValuesAtIndicesComparing(returnValues, numCalls, expected, indices, n - 1)}
`,
      nil,
      "n, expected",
      received.getMockName(),
    )
  }
}
