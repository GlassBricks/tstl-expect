/* eslint-disable @typescript-eslint/unbound-method */
import expect, { mock as mock1 } from ".."

test("name", () => {
  const mock = mock1.fn()
  mock.mockName("test")
  expect(mock.getMockName()).toBe("test")
})

test("calls", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2)
  mock(3, 4)
  expect(mock).toMatchTable({
    numCalls: 2,
    calls: [
      [1, 2],
      [3, 4],
    ],
    contexts: [],
    lastCall: [3, 4],
  })

  const mockSelf = mock1.fn()
  mockSelf.call(0, 1, 2)
  mockSelf.call(1, 3, 4)
  expect(mockSelf).toMatchTable({
    numCalls: 2,
    calls: [
      [1, 2],
      [3, 4],
    ],
    contexts: [0, 1],
    lastCall: [3, 4],
  })
})

test("invokes", () => {
  const mock = mock1.fnNoSelf<(this: void, x: number, y: number) => number>()
  mock.invokes((a, b) => a + b)

  expect(mock(1, 2)).toBe(3)
  expect(mock(3, 4)).toBe(7)

  expect(mock).toMatchTable({
    numCalls: 2,
    calls: [
      [1, 2],
      [3, 4],
    ],
    contexts: [],
    lastCall: [3, 4],
    returnValues: [3, 7],
  })

  const mockSelf = mock1.fn<(this: number, x: number) => number>()
  mockSelf.invokes(function (this: number, a) {
    return this + a
  })

  expect(mockSelf.call(0, 1)).toBe(1)
  expect(mockSelf.call(1, 2)).toBe(3)

  expect(mockSelf).toMatchTable({
    numCalls: 2,
    calls: [[1], [2]],
    contexts: [0, 1],
    lastCall: [2],
    returnValues: [1, 3],
  })
})

test("invokesOnce", () => {
  const mock = mock1.fnNoSelf<(this: void, x: number, y: number) => number>()
  mock.invokes((a, b) => a + b)
  mock.invokesOnce((a, b) => a * b)
  mock.invokesOnce((a, b) => a - b)

  mock(2, 3) // *
  mock(5, 7) // -
  mock(3, 4) // +

  expect(mock).toMatchTable({
    numCalls: 3,
    calls: [
      [2, 3],
      [5, 7],
      [3, 4],
    ],
    contexts: [],
    lastCall: [3, 4],
    returnValues: [6, -2, 7],
  })

  const mockSelf = mock1.fn<(this: number, x: number) => number>()
  mockSelf.invokes(function (this: number, a) {
    return this + a
  })
  mockSelf.invokesOnce(function (this: number, a) {
    return this * a
  })
  mockSelf.invokesOnce(function (this: number, a) {
    return this - a
  })

  mockSelf.call(3, 5) // *
  mockSelf.call(1, 2) // -
  mockSelf.call(2, 3) // +

  expect(mockSelf).toMatchTable({
    numCalls: 3,
    calls: [[5], [2], [3]],
    contexts: [3, 1, 2],
    lastCall: [3],
    returnValues: [15, -1, 5],
  })
})

test("clear", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2)
  mock(3, 4)
  mock.clear()

  expect(mock).toMatchTable({
    numCalls: 0,
    calls: [],
    contexts: [],
    lastCall: nil,
  })

  const mockSelf = mock1.fn()
  mockSelf.call(0, 1, 2)
  mockSelf.call(1, 3, 4)
  mockSelf.clear()

  expect(mockSelf).toMatchTable({
    numCalls: 0,
    calls: [],
    contexts: [],
    lastCall: nil,
  })
})

describe("spying and stubbing a single", () => {
  let obj: {
    withSelf(this: number, x: number): number
    withSelf2(this: number, x: number): number
  }
  before_each(() => {
    obj = {
      withSelf(this: number, x) {
        return this + x
      },
      withSelf2(this: number, x: number) {
        return this + x
      },
    }
  })
  test("on", () => {
    const orig = obj.withSelf
    const sp = mock1.on(obj, "withSelf")
    expect(sp).toBe(obj.withSelf)

    obj.withSelf.call(1, 2)
    sp.returnsOnce(10)
    sp.call(3, 4)
    expect(sp).toMatchTable({
      numCalls: 2,
      calls: [[2], [4]],
      contexts: [1, 3],
      lastCall: [4],
      returnValues: [3, 10],
    })

    sp.reset()
    expect(obj.withSelf).not.toBe(sp).and.toBe(orig)
  })

  test("all", () => {
    const result = mock1.all(obj)
    expect(result).toBe(obj)

    obj.withSelf.call(1, 2)
    result.withSelf.call(3, 4)
    expect(result.withSelf).toMatchTable({
      numCalls: 2,
      calls: [[2], [4]],
      contexts: [1, 3],
      lastCall: [4],
      returnValues: [3, 7],
    })

    obj.withSelf2.call(1, 2)
    result.withSelf2.call(3, 4)
    expect(result.withSelf2).toMatchTable({
      numCalls: 2,
      calls: [[2], [4]],
      contexts: [1, 3],
      lastCall: [4],
      returnValues: [3, 7],
    })

    mock1.clear(obj)
    // not reset
    expect(result.withSelf).toMatchTable({
      numCalls: 0,
      calls: [],
      contexts: [],
      lastCall: nil,
    })
    expect(result.withSelf2).toMatchTable({
      numCalls: 0,
      calls: [],
      contexts: [],
      lastCall: nil,
    })

    mock1.reset(obj)
    expect(result.withSelf).toBeA("function")
    expect(result.withSelf2).toBeA("function")
  })
})
