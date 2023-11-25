import expect from "../.."

test("closeTo", () => {
  expect(1).toBeCloseTo(1)
  expect(1).toBeCloseTo(1, 0.01)
  expect(1.01).toBeCloseTo(1, 0.02)
  expect(0.99).toBeCloseTo(1, 0.02)

  expect(1).not.toBeCloseTo(2)
  expect(1).not.toBeCloseTo(1.02, 0.01)

  const error = assert.error(() => {
    expect(1).toBeCloseTo(2)
  }) as unknown as string
  assert.equal(
    error,
    `expect(received).toBeCloseTo(expected)

Expected: 2
Received: 1
Expected difference: < 0.01
Received difference: 1`,
  )

  const error2 = assert.error(() => {
    expect(1).not.toBeCloseTo(1, 0.01)
  }) as unknown as string
  assert.equal(
    error2,
    `expect(received).not.toBeCloseTo(expected)

Expected: not 1
Received: 1
Expected difference: >= 0.01
Received difference: 0`,
  )
})

test("is.NaN", () => {
  expect(NaN).toBeNaN()
  expect(1).not.toBeNaN()

  const error = assert.error(() => {
    expect(1).toBeNaN()
  }) as unknown as string
  assert.equal(
    error,
    `expect(received).toBeNaN()

Expected: NaN
Received: 1`,
  )
})

test("comparison", () => {
  expect(1).toBeGt(0)
  expect(1).toBeGte(0)
  expect(1).toBeGte(1)

  expect(1).toBeLt(2)
  expect(1).toBeLte(2)
  expect(1).toBeLte(1)

  expect(1).not.toBeGt(2)
  expect(1).not.toBeGte(2)
  expect(1).not.toBeLt(0)
  expect(1).not.toBeLte(0)

  const error = assert.error(() => {
    expect(1).toBeGt(2)
  })
  assert.equal(
    error,
    `expect(received).toBeGt(expected)

Expected: > 2
Received: 1`,
  )

  const error2 = assert.error(() => {
    expect(1).not.toBeLte(1)
  })
  assert.equal(
    error2,
    `expect(received).not.toBeLte(expected)

Expected: not <= 1
Received: 1`,
  )
})
