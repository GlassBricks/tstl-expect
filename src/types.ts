/* eslint-disable @typescript-eslint/ban-types */

/**
 * The context given to custom matchers.
 */
export interface MatcherContext {
  /**
   * If true, the matcher is negated.
   */
  readonly isNot: boolean

  /**
   * Returns a matcherHint; e.g. if this was called with expect(1).to.have.foo(2), it would return
   * "expect(received).to.have.foo(expected)".
   *
   * @param comment - An optional comment to add at a new line after the matcher hint.
   * @param expected - An optional value for the (expected) argument.
   * @param received - An optional value for the (received) argument.
   */
  matcherHint(comment?: string, expected?: string, received?: string): string

  /**
   * Throws an error with the given message, with the _calling_ function as the stack trace.
   *
   * Prepends the matcher hint to the message.
   */
  fail(message?: string, comment?: string, expected?: string, received?: string): never

  /**
   * Creates a new chained matcher with the given value.
   *
   * The new matcher will have a matcher hint, starting with the same words as the current one.
   */
  chainMatcher<T>(value: T): Matchers<T>
}

/** A Custom assertion method. */
export type MatcherMethod<T> = (this: MatcherContext, subject: T, ...args: any[]) => void | unknown
export type MatcherMethods = Record<string, MatcherMethod<any>>

export interface Matchers<T> {
  /** Inverts the assertion. */
  not: this

  /** Allows chaining of assertions. */
  and: this

  /** Adds a comment to the assertion. This will be displayed in the error message. */
  comment(message: string): this

  /** Gets the subject of the assertion. */
  getValue(): T
}

export type LuaType = "number" | "string" | "boolean" | "table" | "function" | "userdata" | "thread" | "nil"
export type TstlClass = Function

export interface BuiltinMatchers {
  /**
   * Passes if this equals the expected value, using rawequal equality.
   */
  toBe(expected: unknown): this
  /**
   * Passes if this equals the expected value. Deeply compares tables.
   * Asymmetric matchers are supported in the expected value.
   */
  toEqual(expected: unknown): this

  /**
   * Passes if all properties in this table are present and equal in the expected table.
   * Similar to `equal`, except this allows for extra keys.
   * Asymmetric matchers are supported in the expected value.
   */
  toMatchTable(expected: unknown): this

  /**
   * Passes if this is the expected type.
   *
   * Expected type must be a lua type, e.g. "number", "string", "table", or a TSTL class.
   */
  toBeA(type: LuaType | TstlClass): this

  /** Passes if this is not nil */
  toBeAny(): this

  /** Passes if this is nil */
  toBeNil(): this

  /** Passes if this is truthy */
  toBeTruthy(): this

  /** Passes if this is falsy */
  toBeFalsy(): this

  /** Passes if this is a string, and matches the given pattern. */
  toMatch(pattern: string): this

  /** Passes if this is a string, and includes the given substring. */
  toInclude(str: string): this

  /**
   * Passes if this is an array, string, or iterable, and contains the given value.
   *
   * This does not support asymmetric matchers or deeply compare, use `containEqual` for that.
   *
   * Note: this will default to using the `ipairs` iterator if another iterator is not provided.
   */
  toContain(value: unknown): this

  /**
   * Passes if this is an array, string, or iterable, and contains the given value.
   *
   * Deeply compares tables, and supports asymmetric matchers.
   *
   * Note: this will default to using the `ipairs` iterator if another iterator is not provided.
   */
  toContainEqual(value: unknown): this

  /**
   * Passes if this is a table and contains the provided key.
   * @param key
   */
  toHaveKey(key: AnyNotNil): this

  /**
   * Passes if this is a number and is close to the expected value (within the given delta).
   *
   * Default delta is 0.01.
   */
  toBeCloseTo(this: Matchers<number>, expected: number, delta?: number): this

  /** Passes if this is a number and is greater than the expected value. */
  toBeGt(this: Matchers<number>, expected: number): this
  toBeGreaterThan(this: Matchers<number>, expected: number): this
  /** Passes if this is a number and is greater than or equal to the expected value. */
  toBeGte(this: Matchers<number>, expected: number): this
  toBeGreaterThanOrEqual(this: Matchers<number>, expected: number): this
  /** Passes if this is a number and is less than the expected value. */

  toBeLt(this: Matchers<number>, expected: number): this
  toBeLessThan(this: Matchers<number>, expected: number): this
  /** Passes if this is a number and is less than or equal to the expected value. */
  toBeLte(this: Matchers<number>, expected: number): this
  toBeLessThanOrEqual(this: Matchers<number>, expected: number): this

  /** Passes if this is NaN. */
  toBeNaN(this: Matchers<number>): this

  /** Passes if this is a string or table, and its length (as returned by #) is equal to the expected value. */
  toHaveLength(this: Matchers<string | readonly any[] | LuaTable | Record<number, any>>, expected: number): this

  /**
   * Passes if this is a function, and throws an error when called.
   * If a message is provided, the error message must include the given string.
   *
   * Returns a new Assertion on the thrown error, or the returned value if this is negated.
   */
  toError(this: Matchers<() => unknown>, message?: string | unknown): Matchers<unknown>
  /**
   * Alias for {@link toError}
   */
  toThrow(this: Matchers<() => unknown>, message?: string | unknown): Matchers<unknown>
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
export interface Matchers<T> extends BuiltinMatchers {}

/** @noSelf */
export interface AsymmetricMatcherFuncs {
  /**
   * Returns if the matcher passes.
   * @param value
   */
  test(value: unknown): boolean

  /** Returns a string representation of the matcher. */
  description(): string
}

/**
 * An asymmetric matcher.
 */
export interface AsymmetricMatcher extends AsymmetricMatcherFuncs {
  _matcherBrand: never
}
/** @noSelf */
export interface BuiltinExpectMatchers {
  /** Matches anything except nil. */
  anything(): AsymmetricMatcher

  /**
   * Matches values that are of the given type.
   *
   * Type must be a lua type, e.g. "number", "string", "table", or a TSTL class.
   */
  any(type: LuaType | TstlClass): AsymmetricMatcher

  /**
   * Matches arrays that contain all the given values; i.e. the given array is a subset of the provided array.
   */
  arrayContaining(expected: readonly unknown[]): AsymmetricMatcher

  /**
   * Matches objects (table) that match the given table.
   *
   * Similar to {@link Matchers#matchTable}, this allows extra keys and deeply compares tables.
   */
  tableContaining(expected: object): AsymmetricMatcher

  /**
   * Matches strings that contain the given substring.
   */
  stringContaining(expected: string): AsymmetricMatcher

  /**
   * Matches strings that match the given pattern.
   */
  stringMatching(expected: string): AsymmetricMatcher

  /**
   * Matches numbers that are close to the expected value (within the given delta).
   */
  closeTo(expected: number, delta?: number): AsymmetricMatcher

  /**
   * Matches a value exactly equal to the expected value, using rawequal equality.
   */
  exactly(expected: unknown): AsymmetricMatcher
}

export interface ExpectMatchers extends BuiltinExpectMatchers {
  /** Matches everything; always returns true. */
  _: AsymmetricMatcher
}

export type InvertedExpectMatchers = Omit<BuiltinExpectMatchers, "anything">

/**
 * The type for the `expect` function.
 */
export interface Expect extends ExpectMatchers {
  <T>(this: void, subject: T): Matchers<T>
  not: InvertedExpectMatchers

  /** Adds custom matchers. */
  extend(matchers: MatcherMethods): void
}

type AnyFunction = (...args: any) => any

/**
 * The type for mocks, both with and without the self parameter.
 */
export interface BaseMock<F extends AnyFunction> {
  readonly _isMockFunction: true

  readonly hasSelfParam: boolean

  /**
   * The calls of this mock. Does not include the self parameter (if any).
   */
  readonly calls: CalledParams<Parameters<F>>[]

  /**
   * The last call of this mock. Does not include the self parameter (if any).
   */
  readonly lastCall?: CalledParams<Parameters<F>>

  /**
   * The self parameter of the last call of this mock. If this mock does not include the self parameter, this is always an empty table.
   */
  readonly contexts: ThisParameterType<F>[]

  /**
   * The return values of this mock.
   *
   * This currently does not support multi-return values.
   */
  readonly returnValues: ReturnType<F>[]

  /**
   * The number of times this mock has been called.
   */
  readonly numCalls: number

  /**
   * Resets this mock, clearing all calls and return values.
   */
  clear(): this

  /**
   * If this mock replaces a function on a table, this restores the original function.
   *
   * @see mock
   */
  reset(): void

  /**
   * Sets the default implementation of this mock.
   */
  invokes(fn: F): this
  /**
   * Sets an implementation that will only be called once (the next time this mock is called).
   *
   * This can be called multiple times, and they will be called in sequence the next times this mock is called.
   *
   * E.g. after `mockFn.invokesOnce(fn1).invokesOnce(fn2)`, the next call will be to `fn1`, the next to `fn2`, and following calls will be to the original implementation.
   */
  invokesOnce(fn: F): this

  /**
   * Short for `invokes(() => value)`.
   * @param value
   */
  returns(value: ReturnType<F>): this

  /**
   * Short for `invokesOnce(() => value)`.
   */
  returnsOnce(value: ReturnType<F>): this

  /**
   * Gets the current implementation of this mock (not including invokesOnce implementations).
   */
  getImplementation(): F | undefined

  /**
   * Gets the implementation that will be used the next time this mock is called.
   *
   * The implementation if nothing has been specified is `()=>nil`.
   */
  getNextImplementation(): F

  /** Set the name of this mock. Displayed in mock assertions. */
  mockName(name: string): this

  /** Gets the name of this mock. */
  getMockName(): string
}

export type CalledParams<T extends any[] = unknown[]> = T & {
  n: number
}

export type AnySelflessFun = (this: void, ...args: any) => any
export type AnyContextualFun = (this: any, ...args: any) => any

export type UnknownSelflessFun = (this: void, ...args: unknown[]) => unknown
export type UnknownContextualFun = (this: unknown, ...args: unknown[]) => unknown

/**
 * A mock function with the self parameter.
 *
 * The first parameter (assumed to be the self parameter) is not included in the `calls` array.
 */
export interface MockWithContext<F extends AnyContextualFun> extends BaseMock<F>, CallableFunction {
  readonly hasSelfParam: true

  (this: ThisParameterType<F>, ...args: Parameters<F>): ReturnType<F>
}

/**
 * A mock function without the self parameter.
 *
 * All parameters are included in the `calls` array.
 */
export interface MockNoSelf<F extends AnySelflessFun> extends BaseMock<F>, CallableFunction {
  readonly hasSelfParam: false
  readonly contexts: []

  invokes(fn: F): this
  invokesOnce(fn: F): this

  (this: void, ...args: Parameters<F>): ReturnType<F>
}

export interface BuiltinMatchers {
  /** Passes if the given mock has been called at least once. */
  toHaveBeenCalled(this: Matchers<AnyFunction>): this
  /** Passes if the given mock has been called the given number of times. */
  toHaveBeenCalledTimes(this: Matchers<AnyFunction>, expected: number): this
  /**
   * Passes if the given mock has been called with the given arguments.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   */
  toHaveBeenCalledWith(this: Matchers<AnyFunction>, ...args: any): this
  /**
   * Passes if the last call to the given mock has the given arguments.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   */
  toHaveBeenLastCalledWith(this: Matchers<AnyFunction>, ...args: any): this
  /**
   * Passes if the nth call to the given mock has the given arguments.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   *
   * Note: if this mock has not been yet called n times, this will fail regardless of if this assertion is negated or not.
   */
  toHaveBeenNthCalledWith(this: Matchers<AnyFunction>, n: number, ...args: any): this

  /**
   * Passes if the given mock has returned with the given value.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   */
  toHaveReturnedWith(this: Matchers<AnyFunction>, value: unknown): this
  /**
   * Passes if the last call to the given mock has returned with the given value.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   */
  toHaveLastReturnedWith(this: Matchers<AnyFunction>, value: unknown): this

  /**
   * Passes if the nth call to the given mock has returned with the given value.
   *
   * Tables are compared deeply, and asymmetric matchers are supported.
   *
   * Note: if this mock has not been yet called n times, this will fail regardless of if this assertion is negated or not.
   */
  toHaveNthReturnedWith(this: Matchers<AnyFunction>, n: number, value: unknown): this
}
