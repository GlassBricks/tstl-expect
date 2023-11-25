import expect from "../.."

test("simple to throw", () => {
  expect(() => error("test"))
    .toThrow()
    .and.toInclude("test")

  expect(() => 3)
    .not.toThrow()
    .and.toBe(3)

  const err = assert.error(() => {
    expect(() => 3).toThrow()
  })
  assert.equal(
    err,
    `expect(received).toThrow()

Expected: to error
Received function did not error
Returned value: 3`,
  )

  const err2 = assert.error(() => {
    expect(() => error("test"))
      .toThrow()
      .and.toContain("test2")
  })
  expect(err2).toInclude(
    `
expect(received).toThrow().and.toContain(expected)

Expected: to contain "test2"
Received: "
`.trim(),
  )
})

test("to throw with string include", () => {
  expect(() => error("foo bar"))
    .toThrow("foo")
    .and.toInclude("bar")

  expect(() => error("foo bar")).not.toThrow("baz")

  const err = assert.error(() => {
    expect(() => error("foo bar")).toThrow("baz")
  })
  expect(err).toInclude(
    `
expect(received).toThrow(expected)

Expected error: including "baz"
Received error: "
`.trim(),
  )

  const err2 = assert.error(() => {
    expect(() => error("foo bar")).not.toThrow("foo")
  })
  expect(err2).toInclude(
    `
expect(received).not.toThrow(expected)

Expected error: not including "foo"
Received error: "
`.trim(),
  )

  const err3 = assert.error(() => {
    expect(() => 0).toThrow("foo")
  })
  expect(err3).toInclude(
    `
expect(received).toThrow(expected)

Expected error: including "foo"
Received function did not error
Returned value: 0
`.trim(),
  )
})

test("to throw with value", () => {
  expect(() => {
    throw { a: 2 }
  }).toThrow({ a: 2 })

  expect(() => {
    throw { a: 2 }
  }).toThrow({ a: expect.any("number") })

  const err = assert.error(() => {
    expect(() => {
      throw { a: 2 }
    }).toThrow({ a: 3 })
  })
  expect(err).toBe(
    `
expect(received).toThrow(expected)

Expected error: { a: 3 }
Received error: {
 *a: 2
}
`.trim(),
  )

  const err2 = assert.error(() => {
    expect(() => {
      throw { a: 2 }
    }).not.toThrow({ a: 2 })
  })
  expect(err2).toBe(
    `
expect(received).not.toThrow(expected)

Expected error: not { a: 2 }
Received error: { a: 2 }
`.trim(),
  )

  const err3 = assert.error(() => {
    expect(() => 0).toThrow({ a: 2 })
  })
  expect(err3).toBe(
    `
expect(received).toThrow(expected)

Expected error: { a: 2 }
Received function did not error
Returned value: 0
`.trim(),
  )
})
