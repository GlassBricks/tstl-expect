import expect from ".."
import { mockFn, mockFnNoSelf } from "../mock"

test("name", () => {
  const mock = mockFn()
  mock.mockName("test")
  expect(mock.getMockName()).toBe("test")
})

test("calls", () => {
  const mock = mockFnNoSelf()
  mock(1, 2)
  mock(3, 4)
  expect(mock).to.matchTable({
    numCalls: 2,
    calls: [
      [1, 2],
      [3, 4],
    ],
    contexts: [],
    lastCall: [3, 4],
  })

  const mockSelf = mockFn()
  mockSelf.call(0, 1, 2)
  mockSelf.call(1, 3, 4)
  expect(mockSelf).to.matchTable({
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
  const mock = mockFnNoSelf<(x: number, y: number) => number>()
  mock.invokes((a, b) => a + b)

  expect(mock(1, 2)).toBe(3)
  expect(mock(3, 4)).toBe(7)

  expect(mock).to.matchTable({
    numCalls: 2,
    calls: [
      [1, 2],
      [3, 4],
    ],
    contexts: [],
    lastCall: [3, 4],
    returnValues: [3, 7],
  })

  const mockSelf = mockFn<(this: number, x: number) => number>()
  mockSelf.invokes(function (this: number, a) {
    return this + a
  })

  expect(mockSelf.call(0, 1)).toBe(1)
  expect(mockSelf.call(1, 2)).toBe(3)

  expect(mockSelf).to.matchTable({
    numCalls: 2,
    calls: [[1], [2]],
    contexts: [0, 1],
    lastCall: [2],
    returnValues: [1, 3],
  })
})

test("invokesOnce", () => {
  const mock = mockFnNoSelf<(x: number, y: number) => number>()
  mock.invokes((a, b) => a + b)
  mock.invokesOnce((a, b) => a * b)
  mock.invokesOnce((a, b) => a - b)

  mock(2, 3) // *
  mock(5, 7) // -
  mock(3, 4) // +

  expect(mock).to.matchTable({
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

  const mockSelf = mockFn<(this: number, x: number) => number>()
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

  expect(mockSelf).to.matchTable({
    numCalls: 3,
    calls: [[5], [2], [3]],
    contexts: [3, 1, 2],
    lastCall: [3],
    returnValues: [15, -1, 5],
  })
})

test("clear", () => {
  const mock = mockFnNoSelf()
  mock(1, 2)
  mock(3, 4)
  mock.clear()

  expect(mock).to.matchTable({
    numCalls: 0,
    calls: [],
    contexts: [],
    lastCall: nil,
  })

  const mockSelf = mockFn()
  mockSelf.call(0, 1, 2)
  mockSelf.call(1, 3, 4)
  mockSelf.clear()

  expect(mockSelf).to.matchTable({
    numCalls: 0,
    calls: [],
    contexts: [],
    lastCall: nil,
  })
})
