/** @noSelfInFile */

import {
  AnyContextualFun,
  AnySelflessFun,
  BaseMock,
  CalledParams,
  EnforceNoSelf,
  MockNoSelf,
  MockWithContext,
  UnknownContextualFun,
  UnknownSelflessFun,
} from "./types"
import { isCallable } from "./utils"

const argsMetatable: LuaMetatable<CalledParams> = {
  __len() {
    return this.n
  },
}
class MockImpl implements BaseMock<AnySelflessFun> {
  declare _isMockFunction: true
  private _implementation: AnySelflessFun | undefined = nil
  private _onceImplementations: AnySelflessFun[] = []

  private _mockName: string = "mockFunction"

  numCalls = 0

  calls: CalledParams[] = []

  lastCall?: CalledParams

  contexts: any[] = []

  returnValues: unknown[] = []

  constructor(
    readonly hasSelfParam: boolean,
    implementation: AnySelflessFun | undefined,
    private originalImplementation: AnySelflessFun | undefined,
    private originalTable: any | undefined,
    private originalKey: keyof any | undefined,
  ) {
    this._implementation = implementation

    setmetatable(this.returnValues, {
      __len: () => this.numCalls,
    })
    // calls always has non-nil values, no need to set __len
  }

  clear(): this {
    this.calls = []
    this.lastCall = nil
    this.numCalls = 0
    this.returnValues = []
    setmetatable(this.returnValues, {
      __len: () => this.numCalls,
    })
    return this
  }
  reset(): void {
    if (this.originalTable) {
      this.originalTable[this.originalKey!] = this.originalImplementation
      delete this.originalTable
      delete this.originalKey
      delete this.originalImplementation
    }
  }

  getImplementation(): AnySelflessFun | undefined {
    return this._implementation
  }

  getNextImplementation(): AnySelflessFun {
    return this._implementation ?? this._onceImplementations[0] ?? (() => nil)
  }

  invokes(fn: AnySelflessFun): this {
    this._implementation = fn
    return this
  }

  invokesOnce(fn: AnySelflessFun): this {
    this._onceImplementations.push(fn)
    return this
  }

  returns(value: ReturnType<AnySelflessFun>): this {
    this._implementation = () => value
    return this
  }
  returnsOnce(value: ReturnType<AnySelflessFun>): this {
    this._onceImplementations.push(() => value)
    return this
  }

  mockName(name: string): this {
    this._mockName = name
    return this
  }
  getMockName(): string {
    return this._mockName
  }

  __call(...allArgs: unknown[]): unknown {
    let context: unknown | undefined
    let args: CalledParams
    let n = select("#", ...allArgs)
    if (!this.hasSelfParam) {
      args = [...allArgs] as CalledParams
    } else {
      ;[context] = [...allArgs]
      args = select(2, ...allArgs) as unknown as CalledParams
      n--
    }
    args.n = n
    setmetatable(args, argsMetatable)

    const curIndex = this.numCalls

    this.calls[curIndex] = args
    this.contexts[curIndex] = context
    this.lastCall = args

    this.numCalls++

    const impl = this._onceImplementations.shift() ?? this._implementation ?? (() => nil)

    const result = impl(...allArgs) // may throw
    this.returnValues[curIndex] = result
    return result
  }

  __tostring(): string {
    return this._mockName
  }
}
MockImpl.prototype._isMockFunction = true

function doMockOn(table: any, key: any, hasSelfParam: boolean): MockImpl {
  const fn = table[key]
  if (typeof fn != "function") {
    error("Cannot mock non-function value", 2)
  }
  const mock = new MockImpl(hasSelfParam, fn, fn, table, key)
  table[key] = mock
  return mock
}

export namespace mock {
  /**
   * Creates a mock function WITH a self parameter.
   *
   * The first parameter (assumed to be the self parameter) will be dropped from `calls`.
   *
   * @see fnNoSelf
   */
  export function fn<F extends AnyContextualFun = UnknownContextualFun>(impl?: F): MockWithContext<F> {
    return new MockImpl(true, impl, nil, nil, nil) as any
  }
  /**
   * Creates a mock function WITHOUT a self parameter.
   *
   * @see fn
   */
  export function fnNoSelf<F extends AnySelflessFun = UnknownSelflessFun>(impl?: F): MockNoSelf<EnforceNoSelf<F>> {
    return new MockImpl(false, impl, nil, nil, nil) as any
  }

  /**
   * Returns if this is a mock function. It may or may not have a self parameter.
   *
   * @see BaseMock.hasSelfParam
   */
  export function isMock(v: unknown): v is MockWithContext<AnyContextualFun> | MockNoSelf<AnySelflessFun> {
    return v instanceof MockImpl
  }

  /**
   * Replaces a function on a table with a mock function. The mock has a self parameter. For a mock without a self parameter, use `onNoSelf`.
   *
   * The mock will call the original function. To override/stub the original function, use `invokes`.
   */
  export function on<K extends keyof T, T extends Record<K, AnyContextualFun>>(
    table: T,
    key: K,
  ): MockWithContext<T[K]> {
    return doMockOn(table, key, true) as any
  }

  /**
   * Replaces a function on a table with a mock function. The mock does not have a self parameter. For a mock with a self parameter, use `on`.
   *
   * The mock will call the original function. To override/stub the original function, use `invokes`.
   */
  export function onNoSelf<K extends keyof T, T extends Record<K, AnySelflessFun>>(table: T, key: K): MockNoSelf<T[K]> {
    return doMockOn(table, key, false) as any
  }

  export type MockedObject<T> = {
    [K in keyof T]: T[K] extends AnyContextualFun ? MockWithContext<T[K]> : T[K]
  }

  export type MockedObjectNoSelf<T> = {
    [K in keyof T]: T[K] extends AnySelflessFun ? MockNoSelf<T[K]> : T[K]
  }

  /**
   * Mocks all callable properties on the given table. All functions have mocked with a self parameter.
   *
   * @see BaseMock.reset
   * @see allNoSelf
   */
  export function all<T extends object>(table: T): MockedObject<T> {
    for (const [key, value] of pairs(table)) {
      if (isCallable(value)) on(table as any, key)
    }
    return table as any
  }

  /**
   * Mocks all callable properties on the given table. All functions have mocked without a self parameter.
   *
   * @see BaseMock.reset
   * @see all
   */
  export function allNoSelf<T extends object>(table: T): MockedObjectNoSelf<T> {
    for (const [key, value] of pairs(table)) {
      if (isCallable(value)) onNoSelf(table as any, key)
    }
    return table as any
  }

  /**
   * Clear all mocks on a table.
   */
  export function clear(obj: object): void {
    for (const [, value] of pairs(obj as any)) {
      if (isMock(value)) value.clear()
    }
  }

  /**
   * Resets all mocks on a table (restores original implementation).
   */
  export function reset(obj: object): void {
    for (const [, value] of pairs(obj as any)) {
      if (isMock(value)) value.reset()
    }
  }
}
