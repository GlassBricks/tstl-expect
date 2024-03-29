import { a, any, equal, falsy, matchTable, nilFn, toBe, truthy } from "./matchers/equality"
import { match, stringInclude } from "./matchers/string"
import { closeTo, gt, gte, isNan, lt, lte } from "./matchers/numeric"
import { contain, containEqual, haveKey, length } from "./matchers/table"
import { toThrow } from "./matchers/error"
import { BuiltinMatchers, MatcherContext, MatcherMethod, MatcherMethods, Matchers } from "./types"
import {
  called,
  calledTimes,
  calledWith,
  lastCalledWith,
  lastReturnedWith,
  nthCalledWith,
  nthReturnedWith,
  returnedWith,
} from "./matchers/mock-matchers"

type WrappedMatcherMethod = (this: InternalMatcher, ...args: any[]) => void | unknown

const matcherMethods = new LuaMap<string, WrappedMatcherMethod>()

const TOBE_MATCHER = "toBe"

class InternalMatcherContext implements MatcherContext {
  words: string[] = []
  isNot = false
  userComment: string = ""

  constructor(public subject: unknown) {}

  matcherHint(comment?: string, expected: string = "expected", received: string = "received") {
    if (comment) {
      return string.format(
        "%sexpect(%s)%s(%s)\n%s",
        this.userComment,
        received,
        this.words.map((w) => `.${w}`).join(""),
        expected,
        comment,
      )
    }
    return string.format(
      "%sexpect(%s)%s(%s)",
      this.userComment,
      received,
      this.words.map((w) => `.${w}`).join(""),
      expected,
    )
  }

  fail(message?: string, comment?: string, expected?: string, received?: string): never {
    const hint = this.matcherHint(comment, expected, received)
    error(hint + "\n\n" + (message ?? "Assertion failed"), 4)
    // level 1: here, 2: fail, 3: assertion, 4: user
  }

  chainMatcher<T>(value: T): Matchers<T> {
    return newChainedMatcher(this, value)
  }
}

interface InternalMatcher {
  _context: InternalMatcherContext
}

const matcherMt: LuaMetatable<InternalMatcher> = {
  __index(key: string) {
    const context = this._context
    if (key == "and") {
      context.words.push(key)
      return this
    }
    if (key == "not") {
      context.isNot = !context.isNot
      context.words.push(key)
      return this
    }
    if (key == "comment") {
      return (comment: string) => {
        this._context.userComment = comment + "\n"
        return this
      }
    }
    const method = matcherMethods.get(key)
    if (method) {
      context.words.push(key)
      return method
    }
    if (key == "getValue") {
      return () => context.subject
    }
    return nil
  },
  __call(this: InternalMatcher, expected: unknown) {
    return matcherMethods.get(TOBE_MATCHER)!.call(this, expected)
  },
}

export function newMatcher<T>(subject: T): Matchers<T> {
  const assertion: InternalMatcher = { _context: new InternalMatcherContext(subject) }
  return setmetatable(assertion, matcherMt) as unknown as Matchers<T>
}

function newChainedMatcher<T>(context: InternalMatcherContext, subject: T): Matchers<T> {
  const newContext = new InternalMatcherContext(subject)
  const words = (newContext.words = context.words)
  words[words.length - 1] = words[words.length - 1] + "()"
  const assertion: InternalMatcher = { _context: newContext }
  return setmetatable(assertion, matcherMt) as unknown as Matchers<T>
}

export function addMatcherMethod(name: string, method: MatcherMethod<any>): void {
  if (matcherMethods.has(name)) {
    error(`Assertion method '${name}' already exists`)
  }
  matcherMethods.set(name, function (this: InternalMatcher, ...args: any[]) {
    const context = this._context
    const result = method.call(context, context.subject, ...args)
    if (result == nil) return newChainedMatcher(context, context.subject)
    return result
  })
}

export function extend(assertions: MatcherMethods): void {
  for (const [name, method] of pairs(assertions)) {
    addMatcherMethod(name, method)
  }
}

export type MatcherImpls<K extends keyof Matchers<any>> = {
  [P in K]: Matchers<any>[P] extends (this: Matchers<infer T>, ...args: infer A) => infer R
    ? (this: MatcherContext, subject: T, ...args: A) => R extends Matchers<T> ? void : R
    : never
}

// builtin assertions

const builtinMatchers: MatcherImpls<keyof BuiltinMatchers> = {
  toBe,
  toEqual: equal,
  toMatchTable: matchTable,
  toBeA: a,
  toBeAny: any,
  toBeNil: nilFn,
  toBeTruthy: truthy,
  toBeFalsy: falsy,
  toMatch: match,
  toInclude: stringInclude,
  toContain: contain,
  toContainEqual: containEqual,
  toHaveKey: haveKey,
  toBeCloseTo: closeTo,
  toBeGt: gt,
  toBeGreaterThan: gt,
  toBeGte: gte,
  toBeGreaterThanOrEqual: gte,
  toBeLt: lt,
  toBeLessThan: lt,
  toBeLte: lte,
  toBeLessThanOrEqual: lte,
  toBeNaN: isNan,
  toHaveLength: length,
  toError: toThrow,
  toThrow: toThrow,
  toHaveBeenCalled: called,
  toHaveBeenCalledTimes: calledTimes,
  toHaveBeenCalledWith: calledWith,
  toHaveBeenLastCalledWith: lastCalledWith,
  toHaveBeenNthCalledWith: nthCalledWith,
  toHaveReturnedWith: returnedWith,
  toHaveLastReturnedWith: lastReturnedWith,
  toHaveNthReturnedWith: nthReturnedWith,
}

extend(builtinMatchers)
