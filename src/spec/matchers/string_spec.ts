import expect from "../../"

test("toMatch", () => {
  expect("hello").toMatch("he.")
  const error = assert.error(() => {
    expect("hello").toMatch("heh")
  })
  assert.equals(
    error,
    `expect(received).toMatch(expected)

Expected pattern: "heh"
Received string: "hello"`,
  )
})

test("to.not.match", () => {
  expect("hello").not.toMatch("heh")
  const error = assert.error(() => {
    expect("hello").not.toMatch("he.")
  })
  assert.equals(
    error,
    `expect(received).not.toMatch(expected)

Expected pattern: not "he."
Received string: "hello"`,
  )
})

test("to.include", () => {
  expect("hello").toInclude("ell")
  const error = assert.error(() => {
    expect("hello").toInclude("eh")
  })
  assert.equals(
    error,
    `expect(received).toInclude(expected)

Expected substring: "eh"
Received string: "hello"`,
  )
})

test("to.not.include", () => {
  expect("hello").not.toInclude("eh")
  const error = assert.error(() => {
    expect("hello").not.toInclude("ell")
  })
  assert.equals(
    error,
    `expect(received).not.toInclude(expected)

Expected substring: not "ell"
Received string: "hello"`,
  )
})
