import expect from "../../"

test("to.match", () => {
  expect("hello").to.match("he.")
  const error = assert.error(() => {
    expect("hello").to.match("heh")
  })
  assert.equals(
    error,
    `expect(received).to.match(expected)

Expected pattern: "heh"
Received string: "hello"`,
  )
})

test("to.not.match", () => {
  expect("hello").not.to.match("heh")
  const error = assert.error(() => {
    expect("hello").not.to.match("he.")
  })
  assert.equals(
    error,
    `expect(received).not.to.match(expected)

Expected pattern: not "he."
Received string: "hello"`,
  )
})

test("to.include", () => {
  expect("hello").to.include("ell")
  const error = assert.error(() => {
    expect("hello").to.include("eh")
  })
  assert.equals(
    error,
    `expect(received).to.include(expected)

Expected substring: "eh"
Received string: "hello"`,
  )
})

test("to.not.include", () => {
  expect("hello").not.to.include("eh")
  const error = assert.error(() => {
    expect("hello").not.to.include("ell")
  })
  assert.equals(
    error,
    `expect(received).not.to.include(expected)

Expected substring: not "ell"
Received string: "hello"`,
  )
})
