import expect, { mock as mock1, mock } from "../.."

test("called", () => {
  const mock = mock1.fnNoSelf()
  expect(mock).not.toHaveBeenCalled()
  expect(() => expect(mock).toHaveBeenCalled()).toThrow(
    `
expect(mockFunction).toHaveBeenCalled()

Expected: to be called
Called: 0 times
`.trim(),
  )

  mock(1, 2)
  expect(mock.calls).toMatchTable([[1, 2]])

  expect(() => expect(mock).not.toHaveBeenCalled()).toThrow(
    `
expect(mockFunction).not.toHaveBeenCalled()

Expected: not to be called
Called: 1 times
Called with:
  1, 2
`.trim(),
  )
})

test("calledTimes", () => {
  const mock = mock1.fnNoSelf()
  expect(mock).toHaveBeenCalledTimes(0)
  expect(mock).not.toHaveBeenCalledTimes(1)
  expect(() => expect(mock).toHaveBeenCalledTimes(1)).toThrow(
    `
expect(mockFunction).toHaveBeenCalledTimes(expected)

Expected number of calls: 1
Received number of calls: 0
Called with:
`.trim(),
  )
  mock(1, 2)
  mock(3, 4)
  expect(mock.calls).toMatchTable([[1, 2]])
  expect(() => expect(mock).not.toHaveBeenCalledTimes(2)).toThrow(
    `
expect(mockFunction).not.toHaveBeenCalledTimes(expected)

Expected number of calls: not 2
Called with:
  1: 1, 2
  2: 3, 4
`.trim(),
  )
  expect(() => expect(mock).toHaveBeenCalledTimes(1)).toThrow(
    `
expect(mockFunction).toHaveBeenCalledTimes(expected)

Expected number of calls: 1
Received number of calls: 2
Called with:
  1: 1, 2
  2: 3, 4
`.trim(),
  )
})

test("calledWith", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2)
  mock(3, 4)
  expect(mock)
    .toHaveBeenCalledWith(1, 2)
    .toHaveBeenCalledWith(3, 4)
    .toHaveBeenCalledWith(expect.any("number"), 4)
    .not.toHaveBeenCalledWith(5, 6)

  expect(() => expect(mock).toHaveBeenCalledWith(5, 4)).toThrow(
    `
expect(mockFunction).toHaveBeenCalledWith(...expected)

Expected: 5, 4
Called with:
  1: *1, *2
  2: *3, 4
`.trim(),
  )

  expect(() => expect(mock).not.toHaveBeenCalledWith(1, 2)).toThrow(
    `
expect(mockFunction).not.toHaveBeenCalledWith(...expected)

Expected: not 1, 2
Called with:
  1: 1, 2
...1 more calls
`.trim(),
  )
})

test("lastCalledWith", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2)
  mock(3, 4)
  expect(mock)
    .toHaveBeenLastCalledWith(3, 4)
    .toHaveBeenLastCalledWith(expect.any("number"), 4)
    .not.toHaveBeenLastCalledWith(5, 6)

  expect(() => expect(mock).toHaveBeenLastCalledWith(5, 4)).toThrow(
    `
expect(mockFunction).toHaveBeenLastCalledWith(...expected)

Expected: 5, 4
Called with:
  1: *1, *2
->2: *3, 4
`.trim(),
  )

  expect(() => expect(mock).not.toHaveBeenLastCalledWith(3, 4)).toThrow(
    `
expect(mockFunction).not.toHaveBeenLastCalledWith(...expected)

Expected: not 3, 4
Called with:
  1: 1, 2
->2: 3, 4
`.trim(),
  )
})

test("nthCalledWith", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2)
  mock(3, 4)
  mock(7, 8)
  expect(mock)
    .toHaveBeenNthCalledWith(1, 1, 2)
    .toHaveBeenNthCalledWith(2, 3, 4)
    .toHaveBeenNthCalledWith(2, expect.any("number"), 4)
    .not.toHaveBeenNthCalledWith(1, 5, 6)

  expect(() => expect(mock).toHaveBeenNthCalledWith(0, expect._, expect._)).toThrow()
  expect(() => expect(mock).toHaveBeenNthCalledWith(0.5, expect._, expect._)).toThrow()

  expect(() => expect(mock).toHaveBeenNthCalledWith(4, 5, 4)).toThrow(
    `
expect(mockFunction).toHaveBeenNthCalledWith(n, ...expected)

n: 4
Expected number of calls: >= 4
Received number of calls: 3
Called with:
  1: 1, 2
  2: 3, 4
  3: 7, 8
`.trim(),
  )

  expect(() => expect(mock).not.toHaveBeenNthCalledWith(2, 3, 4)).toThrow(
    `
expect(mockFunction).not.toHaveBeenNthCalledWith(n, ...expected)

n: 2
Expected: not 3, 4
Called with:
  1: 1, 2
->2: 3, 4
  3: 7, 8
`.trim(),
  )

  expect(() => expect(mock).toHaveBeenNthCalledWith(1, 3, 4)).toThrow(
    `
expect(mockFunction).toHaveBeenNthCalledWith(n, ...expected)

n: 1
Expected: 3, 4
Called with:
->1: *1, *2
  2: (equal) 3, 4
...1 more calls
`.trim(),
  )
})

test("returnedWith", () => {
  const mock = mock1.fnNoSelf()
  mock.invokes((x) => x)
  mock(1)
  mock(2)

  expect(mock)
    .toHaveReturnedWith(1)
    .toHaveReturnedWith(2)
    .not.toHaveReturnedWith(3)
    .not.toHaveReturnedWith(expect.any("string"))

  expect(() => expect(mock).toHaveReturnedWith(3)).toThrow(
    `
expect(mockFunction).toHaveReturnedWith(expected)

Expected: 3
Received:
  1: 1
  2: 2
`.trim(),
  )

  expect(() => expect(mock).not.toHaveReturnedWith(1)).toThrow(
    `
expect(mockFunction).not.toHaveReturnedWith(expected)

Expected: not 1
Received:
  1: 1
...1 more return values
`.trim(),
  )
})

test("lastReturnedWith", () => {
  const mock = mock1.fnNoSelf()
  mock.invokes((x) => x)
  mock(1)
  mock(2)

  expect(mock).toHaveLastReturnedWith(2).not.toHaveLastReturnedWith(1).not.toHaveLastReturnedWith(expect.any("string"))

  expect(() => expect(mock).toHaveLastReturnedWith(1)).toThrow(
    `
expect(mockFunction).toHaveLastReturnedWith(expected)

Expected: 1
Received:
  1: (equal) 1
->2: 2
`.trim(),
  )

  expect(() => expect(mock).not.toHaveLastReturnedWith(2)).toThrow(
    `
expect(mockFunction).not.toHaveLastReturnedWith(expected)

Expected: not 2
Received:
  1: 1
->2: 2
`.trim(),
  )
})

test("nthReturnedWith", () => {
  const mock = mock1.fnNoSelf()
  mock.invokes((x) => x)
  mock(1)
  mock(2)
  mock(3)

  expect(mock)
    .toHaveNthReturnedWith(1, 1)
    .toHaveNthReturnedWith(2, 2)
    .not.toHaveNthReturnedWith(1, 2)
    .not.toHaveNthReturnedWith(3, expect.any("string"))

  expect(() => expect(mock).toHaveNthReturnedWith(4, 3)).toThrow(
    `
expect(mockFunction).toHaveNthReturnedWith(n, expected)

n: 4
Expected number of calls: >= 4
Received number of calls: 3
Received:
  1: 1
  2: 2
  3: 3
`.trim(),
  )

  expect(() => expect(mock).not.toHaveNthReturnedWith(2, 2)).toThrow(
    `
expect(mockFunction).not.toHaveNthReturnedWith(n, expected)

n: 2
Expected: not 2
Received:
  1: 1
->2: 2
  3: 3
`.trim(),
  )

  expect(() => expect(mock).toHaveNthReturnedWith(1, 2)).toThrow(
    `
expect(mockFunction).toHaveNthReturnedWith(n, expected)

n: 1
Expected: 2
Received:
->1: 1
  2: (equal) 2
...1 more return values
`.trim(),
  )
})

test("nth returned with nil return values", () => {
  const fn = mock.fn((x) => x)

  fn(1)
  fn(nil)
  fn(nil)
  fn(nil)
  fn(5)
  fn(nil)

  expect(fn).toHaveNthReturnedWith(1, 1)
  expect(fn).toHaveReturnedWith(5)

  expect(() => expect(fn).toHaveNthReturnedWith(2, 5)).toThrow(
    `
expect(mockFunction).toHaveNthReturnedWith(n, expected)

n: 2
Expected: 5
Received:
  1: 1
->2: nil
  5: (equal) 5
...3 more return values
`.trim(),
  )
})

test("different number of params in expected vs actual", () => {
  const mock = mock1.fnNoSelf()
  mock(1, 2, 3, nil)

  expect(mock).toHaveBeenCalledWith(1, 2, 3, nil)
  expect(mock).toHaveBeenCalledWith(1, 2, 3) // nil implicitly

  expect(() => expect(mock).toHaveBeenCalledWith(1, 2)).toThrow(
    `
expect(mockFunction).toHaveBeenCalledWith(...expected)

Expected: 1, 2
Called with:
  1, 2, *3, nil
`.trim(),
  )

  expect(() => expect(mock).toHaveBeenCalledWith(1, 2, 3, nil, 5)).toThrow(
    `
expect(mockFunction).toHaveBeenCalledWith(...expected)

Expected: 1, 2, 3, nil, 5
Called with:
  1, 2, 3, nil
`.trim(),
  )
})
