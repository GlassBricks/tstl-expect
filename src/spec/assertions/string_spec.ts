import expect from "../../"

test("to.match", () => {
  expect("hello").to.match("he.")
  const error = assert.error(() => {
    expect("hello").to.match("heh")
  })
  assert.equals(error, `expect(received).to.match(expected)\n\n` + `Expected pattern: "heh"\nReceived string: "hello"`)
})

test("to.not.match", () => {
  expect("hello").not.to.match("heh")
  const error = assert.error(() => {
    expect("hello").not.to.match("he.")
  })
  assert.equals(
    error,
    `expect(received).not.to.match(expected)\n\n` + `Expected pattern: not "he."\n` + `Received string: "hello"`,
  )
})

test("to.include", () => {
  expect("hello").to.include("ell")
  const error = assert.error(() => {
    expect("hello").to.include("eh")
  })
  assert.equals(
    error,
    `expect(received).to.include(expected)\n\n` + `Expected substring: "eh"\nReceived string: "hello"`,
  )
})

test("to.not.include", () => {
  expect("hello").not.to.include("eh")
  const error = assert.error(() => {
    expect("hello").not.to.include("ell")
  })
  assert.equals(
    error,
    `expect(received).not.to.include(expected)\n\n` + `Expected substring: not "ell"\n` + `Received string: "hello"`,
  )
})
