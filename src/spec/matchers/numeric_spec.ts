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
    `expect(received).to.be.closeTo(expected)\n\n` +
      `Expected: 2\n` +
      `Received: 1\n` +
      `Expected difference: < 0.01\n` +
      `Received difference: 1`,
  )

  const error2 = assert.error(() => {
    expect(1).not.to.be.closeTo(1, 0.01)
  }) as unknown as string
  assert.equal(
    error2,
    `expect(received).not.to.be.closeTo(expected)\n\n` +
      `Expected: not 1\n` +
      `Received: 1\n` +
      `Expected difference: >= 0.01\n` +
      `Received difference: 0`,
  )
})

test("is.NaN", () => {
  expect(NaN).to.be.NaN()
  expect(1).to.not.be.NaN()

  const error = assert.error(() => {
    expect(1).to.be.NaN()
  }) as unknown as string
  assert.equal(error, `expect(received).to.be.NaN()\n\n` + `Expected: NaN\n` + `Received: 1`)
})
