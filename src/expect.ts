import { a, any, equal, falsy, matchTable, nilFn, toBe, truthy } from "./assertions/equality"
import { match, stringInclude } from "./assertions/string"
import { closeTo, gt, gte, isNan, lt, lte } from "./assertions/numeric"
import { contain, containEqual, haveKey, length } from "./assertions/table"
import { toThrow } from "./assertions/error"
import {
  Assertion,
  AssertionChaining,
  AssertionContext,
  AssertionMethod,
  AssertionMethods,
  BuiltinAssertions,
} from "./types"
import {
  called,
  calledTimes,
  calledWith,
  lastCalledWith,
  lastReturnedWith,
  nthCalledWith,
  nthReturnedWith,
  returnedWith,
} from "./assertions/mock-assertions"

const chainingMethods = keySet<AssertionChaining>()

type WrappedAssertionMethod = (this: InternalAssertion, ...args: any[]) => void | unknown

const assertionMethods = new LuaMap<string, WrappedAssertionMethod>()

const TOBE_MATCHER = "toBe"

class InternalAssertionContext implements AssertionContext {
  words: string[] = []
  isNot = false
  constructor(public subject: unknown) {}
  matcherHint(comment?: string, expected: string = "expected", received: string = "received") {
    if (comment) {
      return string.format("expect(%s)%s(%s)\n%s", received, this.words.map((w) => `.${w}`).join(""), expected, comment)
    }
    return string.format("expect(%s)%s(%s)", received, this.words.map((w) => `.${w}`).join(""), expected)
  }
  fail(message?: string, comment?: string, expected?: string, received?: string): never {
    const hint = this.matcherHint(comment, expected, received)
    error(hint + "\n\n" + (message ?? "Assertion failed"), 4)
    // level 1: here, 2: fail, 3: assertion, 4: user
  }

  chainAssertion<T>(value: T): Assertion<T> {
    return newChainedAssertion(this, value)
  }
}
interface InternalAssertion {
  _context: InternalAssertionContext
}
const assertionMt: LuaMetatable<InternalAssertion> = {
  __index(key: string) {
    const context = this._context
    if (key in chainingMethods) {
      context.words.push(key)
      return this
    }
    if (key == "not") {
      context.isNot = !context.isNot
      context.words.push(key)
      return this
    }
    const method = assertionMethods.get(key)
    if (method) {
      context.words.push(key)
      return method
    }
    if (key == "getValue") {
      return () => context.subject
    }
    return nil
  },
  __call(this: InternalAssertion, expected: unknown) {
    assertionMethods.get(TOBE_MATCHER)!.call(this, expected)
  },
}

export function newAssertion<T>(subject: T): Assertion<T> {
  const assertion: InternalAssertion = { _context: new InternalAssertionContext(subject) }
  return setmetatable(assertion, assertionMt) as unknown as Assertion<T>
}

function newChainedAssertion<T>(context: InternalAssertionContext, subject: T): Assertion<T> {
  const newContext = new InternalAssertionContext(subject)
  const words = (newContext.words = context.words)
  words[words.length - 1] = words[words.length - 1] + "()"
  const assertion: InternalAssertion = { _context: newContext }
  return setmetatable(assertion, assertionMt) as unknown as Assertion<T>
}
export function addAssertionMethod(name: string, method: AssertionMethod<any>): void {
  if (assertionMethods.has(name)) {
    error(`Assertion method '${name}' already exists`)
  }
  assertionMethods.set(name, function (this: InternalAssertion, ...args: any[]) {
    const context = this._context
    const result = method.call(context, context.subject, ...args)
    if (result == nil) return newChainedAssertion(context, context.subject)
    return result
  })
}

export function extend(assertions: AssertionMethods): void {
  for (const [name, method] of pairs(assertions)) {
    addAssertionMethod(name, method)
  }
}

export type MatcherImpls<K extends keyof Assertion<any>> = {
  [P in K]: Assertion<any>[P] extends (this: Assertion<infer T>, ...args: infer A) => infer R
    ? (this: AssertionContext, subject: T, ...args: A) => R extends Assertion<T> ? void : R
    : never
}

// builtin assertions

const builtinAssertions: MatcherImpls<keyof BuiltinAssertions> = {
  toBe,
  equal,
  matchTable,
  a,
  any,
  nil: nilFn,
  truthy,
  falsy,
  match,
  include: stringInclude,
  contain,
  containEqual,
  key: haveKey,
  closeTo,
  gt,
  gte,
  lt,
  lte,
  NaN: isNan,
  length,
  throw: toThrow,
  error: toThrow,

  called,
  calledTimes,
  calledWith,
  lastCalledWith,
  nthCalledWith,
  returnedWith,
  lastReturnedWith,
  nthReturnedWith,
}

extend(builtinAssertions)
