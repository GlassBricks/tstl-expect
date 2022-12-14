import expect from "../.."

test("to.have.length", () => {
  expect("hello").to.have.length(5)
  expect("hello").not.to.have.length(4)
  const error = assert.error(() => {
    expect("hello").to.have.length(4)
  })
  assert.equals(
    error,
    `expect(received).to.have.length(expected)

Expected length: 4
Received length: 5
Received value: "hello"`,
  )

  expect([1, 2, 3]).to.have.length(3)
  expect([1, 2, 3]).not.to.have.length(4)
  const error2 = assert.error(() => {
    expect([1, 2, 3]).to.have.length(4)
  })
  assert.equals(
    error2,
    `expect(received).to.have.length(expected)

Expected length: 4
Received length: 3
Received value: [1, 2, 3]`,
  )
})

test("contain", () => {
  expect("hello").to.contain("e")
  expect([1, 2, 3]).to.contain(2)
  expect(new Set([1, 2, 3])).to.contain(2)

  expect("hello").not.to.contain("a")
  expect([1, 2, 3]).not.to.contain(4)
  expect(new Set([1, 2, 3])).not.to.contain(4)

  const error = assert.error(() => {
    expect("hello").to.contain("a")
  })
  assert.equals(
    error,
    `expect(received).to.contain(expected)

Expected: to contain "a"
Received: "hello"`,
  )

  const error2 = assert.error(() => {
    expect([1, 2, 3]).not.to.contain(2)
  })
  assert.equals(
    error2,
    `expect(received).not.to.contain(expected)

Expected: not to contain 2
Received: [1, 2, 3]`,
  )
})

test("haveKey", () => {
  expect({ a: 1, b: 2 }).to.have.key("a")
  expect({ a: 1, b: 2 }).not.to.have.key("c")
  const error = assert.error(() => {
    expect({ a: 1, b: 2 }).to.have.key("c")
  })
  assert.equals(
    error,
    `expect(received).to.have.key(expected)

Expected: to have key "c"
Received: { a: 1, b: 2 }`,
  )

  const error2 = assert.error(() => {
    expect({ a: 1, b: 2 }).not.to.have.key("a")
  })
  assert.equals(
    error2,
    `expect(received).not.to.have.key(expected)

Expected: not to have key "a"
Received: { a: 1, b: 2 }`,
  )
})
