/** @noSelfInFile */

import {
  AnyContextualFun,
  AnySelflessFun,
  ArrayWithN,
  BaseMock,
  MockNoSelf,
  MockWithContext,
  MultiReturnFun,
  UnknownContextualFun,
  UnknownSelflessFun,
} from "./types"
import { isCallable } from "./utils"
import { pack, unpack } from "./pack"

const argsMetatable: LuaMetatable<ArrayWithN> = {
  __len() {
    return this.n
  },
}

function returnsImpl(...values: any[]) {
  const n = select("#", ...values)
  if (n == 1) {
    const [value] = [...values]
    return () => value
  } else {
    const arr = pack(...values)
    return () => unpack(arr)
  }
}

class MockImpl implements BaseMock<AnySelflessFun> {
  declare _isMockFunction: true
  private _implementation: MultiReturnFun | undefined = nil
  private _onceImplementations: MultiReturnFun[] = []

  private _mockName: string = "mockFunction"

  numCalls = 0

  calls: ArrayWithN[] = []

  lastCall?: ArrayWithN

  contexts: any[] = []

  returnValues: unknown[] = []
  multiReturnValues: ArrayWithN[] = []

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
    this.multiReturnValues = []
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

  returns(...values: unknown[]): this {
    this._implementation = returnsImpl(...values)
    return this
  }

  returnsOnce(...values: unknown[]): this {
    this._onceImplementations.push(returnsImpl(...values))
    return this
  }

  mockName(name: string): this {
    this._mockName = name
    return this
  }

  getMockName(): string {
    return this._mockName
  }

  __call(...allArgs: unknown[]): LuaMultiReturn<unknown[]> {
    let context: unknown | undefined
    let args: ArrayWithN
    let n = select("#", ...allArgs)
    if (!this.hasSelfParam) {
      args = [...allArgs] as ArrayWithN
    } else {
      ;[context] = [...allArgs]
      args = select(2, ...allArgs) as unknown as ArrayWithN
      n--
    }
    args.n = n
    setmetatable(args, argsMetatable)

    const curIndex = this.numCalls

    this.calls[curIndex] = args
    this.contexts[curIndex] = context
    this.lastCall = args

    this.numCalls++

    const impl = this._onceImplementations.shift() ?? this._implementation ?? (() => $multi())

    const result = pack(...impl(...allArgs)) // may throw
    setmetatable(result, argsMetatable)
    const firstResult = result[0]
    this.multiReturnValues[curIndex] = result
    this.returnValues[curIndex] = firstResult
    return unpack(result)
  }

  __tostring(): string {
    return this._mockName
  }
}

MockImpl.prototype._isMockFunction = true

function doMockOn(table: any, key: any, hasSelfParam: boolean, stubOut: boolean): MockImpl {
  const fn = table[key]
  if (!isCallable(fn)) {
    error("Cannot mock non-function value", 2)
  }
  const impl = !stubOut ? fn : nil
  return (table[key] = new MockImpl(hasSelfParam, impl, fn, table, key))
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
  export function fnNoSelf<F extends AnySelflessFun = UnknownSelflessFun>(impl?: F): MockNoSelf<F> {
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
   * @param table The table to replace the function on.
   * @param key The key of the function to replace.
   * @param stub whether to stub out the original function, or else keep the original implementation. Defaults to `false`.
   */
  export function on<K extends keyof T, T extends Record<K, AnyContextualFun>>(
    table: T,
    key: K,
    stub: boolean = false,
  ): MockWithContext<T[K]> {
    return doMockOn(table, key, true, stub) as any
  }

  /**
   * Replaces a function on a table with a mock function. The mock does not have a self parameter. For a mock with a self parameter, use `on`.
   *
   * @param table The table to replace the function on.
   * @param key The key of the function to replace.
   * @param stub whether to stub out the original function, or else keep the original implementation. Defaults to `false`.
   */
  export function onNoSelf<K extends keyof T, T extends Record<K, AnySelflessFun>>(
    table: T,
    key: K,
    stub: boolean = false,
  ): MockNoSelf<T[K]> {
    return doMockOn(table, key, false, stub) as any
  }

  export type MockedObject<T> = {
    [K in keyof T]: T[K] extends AnyContextualFun ? MockWithContext<T[K]> : T[K]
  }

  export type MockedObjectNoSelf<T> = {
    [K in keyof T]: T[K] extends AnySelflessFun ? MockNoSelf<T[K]> : T[K]
  }

  /**
   * Mocks all functions on the given table. All functions are assumed to have a self parameter.
   *
   * @param table The table to mock all functions on.
   * @param stub whether to stub out the original functions, or else keep the original implementations. Defaults to `false`.
   *
   * @see BaseMock.reset
   * @see allNoSelf
   */
  export function all<T extends object>(table: T, stub: boolean = false): MockedObject<T> {
    for (const [key, value] of pairs(table)) {
      if (isCallable(value)) {
        doMockOn(table, key, true, stub)
      }
    }
    return table as any
  }

  /**
   * Mocks all functions on the given table. All functions are assumed to not have a self parameter.
   *
   * @param table The table to mock all functions on.
   * @param stub whether to stub out the original functions, or else keep the original implementations. Defaults to `false`.
   *
   * @see BaseMock.reset
   * @see all
   */
  export function allNoSelf<T extends object>(table: T, stub: boolean = false): MockedObjectNoSelf<T> {
    for (const [key, value] of pairs(table)) {
      if (isCallable(value)) {
        doMockOn(table, key, false, stub)
      }
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
   * Resets all mocks on a table mocked using `all` or `allNoSelf`. Restores the original implementations.
   */
  export function reset(obj: object): void {
    for (const [, value] of pairs(obj as any)) {
      if (isMock(value)) value.reset()
    }
  }
}
