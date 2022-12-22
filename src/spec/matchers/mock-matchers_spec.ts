import expect, { mock as mock1, mock } from "../.."

test("called", () => {
  const mock = mock1.fnNoSelf()
  expect(mock).to.not.be.called()
  expect(() => expect(mock).to.be.called()).to.throw(
    `
expect(mockFunction).to.be.called()

Expected: to be called
Called: 0 times
`.trim(),
  )

  mock(1, 2)
  expect(mock.calls).to.matchTable([[1, 2]])

  expect(() => expect(mock).to.not.be.called()).to.throw(
    `
expect(mockFunction).to.not.be.called()

Expected: not to be called
Called: 1 times
Called with:
  1, 2
`.trim(),
  )
})

test("calledTimes", () => {
  const mock = mock1.fnNoSelf()
  expect(mock).to.be.calledTimes(0)
  expect(mock).to.not.be.calledTimes(1)
  expect(() => expect(mock).to.be.calledTimes(1)).to.throw(
    `
expect(mockFunction).to.be.calledTimes(expected)

Expected number of calls: 1
Received number of calls: 0
Called with:
`.trim(),
  )
  mock(1, 2)
  mock(3, 4)
  expect(mock.calls).to.matchTable([[1, 2]])
  expect(() => expect(mock).to.not.be.calledTimes(2)).to.throw(
    `
expect(mockFunction).to.not.be.calledTimes(expected)

Expected number of calls: not 2
Called with:
  1: 1, 2
  2: 3, 4
`.trim(),
  )
  expect(() => expect(mock).to.be.calledTimes(1)).to.throw(
    `
expect(mockFunction).to.be.calledTimes(expected)

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
    .to.be.calledWith(1, 2)
    .to.be.calledWith(3, 4)
    .to.be.calledWith(expect.any("number"), 4)
    .not.to.be.calledWith(5, 6)

  expect(() => expect(mock).to.be.calledWith(5, 4)).to.throw(
    `
expect(mockFunction).to.be.calledWith(...expected)

Expected: 5, 4
Called with:
  1: *1, *2
  2: *3, 4
`.trim(),
  )

  expect(() => expect(mock).not.to.be.calledWith(1, 2)).to.throw(
    `
expect(mockFunction).not.to.be.calledWith(...expected)

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
  expect(mock).to.be.lastCalledWith(3, 4).to.be.lastCalledWith(expect.any("number"), 4).not.to.be.lastCalledWith(5, 6)

  expect(() => expect(mock).to.be.lastCalledWith(5, 4)).to.throw(
    `
expect(mockFunction).to.be.lastCalledWith(...expected)

Expected: 5, 4
Called with:
  1: *1, *2
->2: *3, 4
`.trim(),
  )

  expect(() => expect(mock).not.to.be.lastCalledWith(3, 4)).to.throw(
    `
expect(mockFunction).not.to.be.lastCalledWith(...expected)

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
    .to.be.nthCalledWith(1, 1, 2)
    .to.be.nthCalledWith(2, 3, 4)
    .to.be.nthCalledWith(2, expect.any("number"), 4)
    .not.to.be.nthCalledWith(1, 5, 6)

  expect(() => expect(mock).to.be.nthCalledWith(0, expect._, expect._)).to.throw()
  expect(() => expect(mock).to.be.nthCalledWith(0.5, expect._, expect._)).to.throw()

  expect(() => expect(mock).to.be.nthCalledWith(4, 5, 4)).to.throw(
    `
expect(mockFunction).to.be.nthCalledWith(n, ...expected)

n: 4
Expected number of calls: >= 4
Received number of calls: 3
Called with:
  1: 1, 2
  2: 3, 4
  3: 7, 8
`.trim(),
  )

  expect(() => expect(mock).not.to.be.nthCalledWith(2, 3, 4)).to.throw(
    `
expect(mockFunction).not.to.be.nthCalledWith(n, ...expected)

n: 2
Expected: not 3, 4
Called with:
  1: 1, 2
->2: 3, 4
  3: 7, 8
`.trim(),
  )

  expect(() => expect(mock).to.be.nthCalledWith(1, 3, 4)).to.throw(
    `
expect(mockFunction).to.be.nthCalledWith(n, ...expected)

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
    .to.have.returnedWith(1)
    .to.have.returnedWith(2)
    .not.to.have.returnedWith(3)
    .not.to.have.returnedWith(expect.any("string"))

  expect(() => expect(mock).to.have.returnedWith(3)).to.throw(
    `
expect(mockFunction).to.have.returnedWith(expected)

Expected: 3
Received:
  1: 1
  2: 2
`.trim(),
  )

  expect(() => expect(mock).not.to.have.returnedWith(1)).to.throw(
    `
expect(mockFunction).not.to.have.returnedWith(expected)

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

  expect(mock)
    .to.have.lastReturnedWith(2)
    .not.to.have.lastReturnedWith(1)
    .not.to.have.lastReturnedWith(expect.any("string"))

  expect(() => expect(mock).to.have.lastReturnedWith(1)).to.throw(
    `
expect(mockFunction).to.have.lastReturnedWith(expected)

Expected: 1
Received:
  1: (equal) 1
->2: 2
`.trim(),
  )

  expect(() => expect(mock).not.to.have.lastReturnedWith(2)).to.throw(
    `
expect(mockFunction).not.to.have.lastReturnedWith(expected)

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
    .to.have.nthReturnedWith(1, 1)
    .to.have.nthReturnedWith(2, 2)
    .not.to.have.nthReturnedWith(1, 2)
    .not.to.have.nthReturnedWith(3, expect.any("string"))

  expect(() => expect(mock).to.have.nthReturnedWith(4, 3)).to.throw(
    `
expect(mockFunction).to.have.nthReturnedWith(n, expected)

n: 4
Expected number of calls: >= 4
Received number of calls: 3
Received:
  1: 1
  2: 2
  3: 3
`.trim(),
  )

  expect(() => expect(mock).not.to.have.nthReturnedWith(2, 2)).to.throw(
    `
expect(mockFunction).not.to.have.nthReturnedWith(n, expected)

n: 2
Expected: not 2
Received:
  1: 1
->2: 2
  3: 3
`.trim(),
  )

  expect(() => expect(mock).to.have.nthReturnedWith(1, 2)).to.throw(
    `
expect(mockFunction).to.have.nthReturnedWith(n, expected)

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

  expect(fn).to.have.nthReturnedWith(1, 1)
  expect(fn).to.have.returnedWith(5)

  expect(() => expect(fn).to.have.nthReturnedWith(2, 5)).to.throw(
    `
expect(mockFunction).to.have.nthReturnedWith(n, expected)

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

  expect(() => expect(mock).to.be.calledWith(1, 2)).to.throw(
    `
expect(mockFunction).to.be.calledWith(...expected)

Expected: 1, 2
Called with:
  1, 2, *3, nil
`.trim(),
  )

  expect(() => expect(mock).to.be.calledWith(1, 2, 3, nil, 5)).to.throw(
    `
expect(mockFunction).to.be.calledWith(...expected)

Expected: 1, 2, 3, nil, 5
Called with:
  1, 2, 3, nil
`.trim(),
  )
})
