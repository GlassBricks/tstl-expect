import expect from "../.."

test("closeTo", () => {
  expect(1).to.be.closeTo(1)
  expect(1).to.be.closeTo(1, 0.01)
  expect(1.01).to.be.closeTo(1, 0.02)
  expect(0.99).to.be.closeTo(1, 0.02)

  expect(1).to.not.be.closeTo(2)
  expect(1).to.not.be.closeTo(1.02, 0.01)

  const error = assert.error(() => {
    expect(1).to.be.closeTo(2)
  }) as unknown as string
  assert.equal(
    error,
    `expect(received).to.be.closeTo(expected)

Expected: 2
Received: 1
Expected difference: < 0.01
Received difference: 1`,
  )

  const error2 = assert.error(() => {
    expect(1).not.to.be.closeTo(1, 0.01)
  }) as unknown as string
  assert.equal(
    error2,
    `expect(received).not.to.be.closeTo(expected)

Expected: not 1
Received: 1
Expected difference: >= 0.01
Received difference: 0`,
  )
})

test("is.NaN", () => {
  expect(NaN).to.be.NaN()
  expect(1).to.not.be.NaN()

  const error = assert.error(() => {
    expect(1).to.be.NaN()
  }) as unknown as string
  assert.equal(
    error,
    `expect(received).to.be.NaN()

Expected: NaN
Received: 1`,
  )
})

test("comparison", () => {
  expect(1).to.be.gt(0)
  expect(1).to.be.gte(0)
  expect(1).to.be.gte(1)

  expect(1).to.be.lt(2)
  expect(1).to.be.lte(2)
  expect(1).to.be.lte(1)

  expect(1).not.to.be.gt(2)
  expect(1).not.to.be.gte(2)
  expect(1).not.to.be.lt(0)
  expect(1).not.to.be.lte(0)

  const error = assert.error(() => {
    expect(1).to.be.gt(2)
  })
  assert.equal(
    error,
    `expect(received).to.be.gt(expected)

Expected: > 2
Received: 1`,
  )

  const error2 = assert.error(() => {
    expect(1).not.to.be.lte(1)
  })
  assert.equal(
    error2,
    `expect(received).not.to.be.lte(expected)

Expected: not <= 1
Received: 1`,
  )
})
