import {
  AnyContextualFun,
  AnySelflessFun,
  BaseMock,
  CalledParams,
  MockNoSelf,
  MockWithContext,
  UnknownContextualFun,
  UnknownSelflessFun,
} from "./types"

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

  constructor(readonly hasSelfParam: boolean, implementation: AnySelflessFun | undefined) {
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

export function mockFn<F extends AnyContextualFun = UnknownContextualFun>(impl?: F): MockWithContext<F> {
  return new MockImpl(true, impl) as unknown as MockWithContext<F>
}

export type EnforceNoSelf<F extends AnySelflessFun> = F extends (...args: infer A) => infer R
  ? (this: void, ...args: A) => R
  : never
export function mockFnNoSelf<F extends AnySelflessFun = UnknownSelflessFun>(impl?: F): MockNoSelf<EnforceNoSelf<F>> {
  return new MockImpl(false, impl) as unknown as MockNoSelf<EnforceNoSelf<F>>
}

export function isMock(obj: unknown): obj is BaseMock<(...args: any) => any> {
  return obj instanceof MockImpl
}
