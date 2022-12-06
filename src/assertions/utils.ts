import { AssertionContext } from "../types"

export function assertIsString(context: AssertionContext, value: unknown, part: string): asserts value is string {
  if (typeof value != "string") {
    context.fail(`${part} value must be a string, got a ${type(value)}`)
  }
}
export function assertIsNumber(context: AssertionContext, value: unknown, part: string): asserts value is number {
  if (typeof value != "number") {
    context.fail(`${part} value must be a number, got a ${type(value)}`)
  }
}

export function assertNotNil(context: AssertionContext, value: unknown, part: string): asserts value is AnyNotNil {
  if (value == nil) {
    context.fail(`${part} value must not be nil`)
  }
}

export function assertIsNonNegativeInteger(
  context: AssertionContext,
  value: unknown,
  part: string,
): asserts value is number {
  assertIsNumber(context, value, part)
  if (value < 0 || math.floor(value) != value) {
    context.fail(`${part} value must be a non-negative integer, got ${value}`)
  }
}

export type AnyFunction = (this: void, ...args: any[]) => any
export function assertIsFunction(
  context: AssertionContext,
  value: unknown,
  part: string,
): asserts value is AnyFunction {
  if (typeof value != "function") {
    context.fail(`${part} value must be a function, got a ${type(value)}`)
  }
}
