import expect from "../.."

test("toHaveLength", () => {
  expect("hello").toHaveLength(5)
  expect("hello").not.toHaveLength(4)
  const error = assert.error(() => {
    expect("hello").toHaveLength(4)
  })
  assert.equals(
    error,
    `expect(received).toHaveLength(expected)

Expected length: 4
Received length: 5
Received value: "hello"`,
  )

  expect([1, 2, 3]).toHaveLength(3)
  expect([1, 2, 3]).not.toHaveLength(4)
  const error2 = assert.error(() => {
    expect([1, 2, 3]).toHaveLength(4)
  })
  assert.equals(
    error2,
    `expect(received).toHaveLength(expected)

Expected length: 4
Received length: 3
Received value: [1, 2, 3]`,
  )
})

test("contain", () => {
  expect("hello").toContain("e")
  expect([1, 2, 3]).toContain(2)
  expect(new Set([1, 2, 3])).toContain(2)

  expect("hello").not.toContain("a")
  expect([1, 2, 3]).not.toContain(4)
  expect(new Set([1, 2, 3])).not.toContain(4)

  const error = assert.error(() => {
    expect("hello").toContain("a")
  })
  assert.equals(
    error,
    `expect(received).toContain(expected)

Expected: to contain "a"
Received: "hello"`,
  )

  const error2 = assert.error(() => {
    expect([1, 2, 3]).not.toContain(2)
  })
  assert.equals(
    error2,
    `expect(received).not.toContain(expected)

Expected: not to contain 2
Received: [1, 2, 3]`,
  )
})

test("haveKey", () => {
  expect({ a: 1, b: 2 }).toHaveKey("a")
  expect({ a: 1, b: 2 }).not.toHaveKey("c")
  const error = assert.error(() => {
    expect({ a: 1, b: 2 }).toHaveKey("c")
  })
  assert.equals(
    error,
    `expect(received).toHaveKey(expected)

Expected: to have key "c"
Received: { a: 1, b: 2 }`,
  )

  const error2 = assert.error(() => {
    expect({ a: 1, b: 2 }).not.toHaveKey("a")
  })
  assert.equals(
    error2,
    `expect(received).not.toHaveKey(expected)

Expected: not to have key "a"
Received: { a: 1, b: 2 }`,
  )
})
