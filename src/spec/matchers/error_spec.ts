import expect from "../.."

test("simple to throw", () => {
  expect(() => error("test"))
    .to.throw()
    .and.to.include("test")

  expect(() => 3)
    .not.to.throw()
    .and.to.be(3)

  const err = assert.error(() => {
    expect(() => 3).to.throw()
  })
  assert.equal(
    err,
    `expect(received).to.throw()

Expected: to error
Received function did not error
Returned value: 3`,
  )

  const err2 = assert.error(() => {
    expect(() => error("test"))
      .to.throw()
      .and.to.contain("test2")
  })
  expect(err2).to.include(
    `expect(received).to.throw().and.to.contain(expected)\n\n` + `Expected: to contain "test2"\nReceived: "`,
  )
})

test("to throw with string include", () => {
  expect(() => error("foo bar"))
    .to.throw("foo")
    .and.to.include("bar")

  expect(() => error("foo bar")).not.to.throw("baz")

  const err = assert.error(() => {
    expect(() => error("foo bar")).to.throw("baz")
  })
  expect(err).to.include(
    `expect(received).to.throw(expected)

Expected error: including "baz"
Received error: "`,
  )

  const err2 = assert.error(() => {
    expect(() => error("foo bar")).not.to.throw("foo")
  })
  expect(err2).to.include(
    `expect(received).not.to.throw(expected)

Expected error: not including "foo"
Received error: "`,
  )

  const err3 = assert.error(() => {
    expect(() => 0).to.throw("foo")
  })
  expect(err3).to.include(
    `expect(received).to.throw(expected)

Expected error: including "foo"
Received function did not error
Returned value: 0`,
  )
})

test("to throw with value", () => {
  expect(() => {
    throw { a: 2 }
  }).to.throw({ a: 2 })

  expect(() => {
    throw { a: 2 }
  }).to.throw({ a: expect.any("number") })

  const err = assert.error(() => {
    expect(() => {
      throw { a: 2 }
    }).to.throw({ a: 3 })
  })
  expect(err).to.include(
    `expect(received).to.throw(expected)

Expected error: { a: 3 }
Received error: {
* a: 2
}`,
  )

  const err2 = assert.error(() => {
    expect(() => {
      throw { a: 2 }
    }).not.to.throw({ a: 2 })
  })
  expect(err2).to.include(
    `expect(received).not.to.throw(expected)

Expected error: not { a: 2 }
Received error: { a: 2 }`,
  )

  const err3 = assert.error(() => {
    expect(() => 0).to.throw({ a: 2 })
  })
  expect(err3).to.include(
    `expect(received).to.throw(expected)

Expected error: { a: 2 }
Received function did not error
Returned value: 0`,
  )
})
