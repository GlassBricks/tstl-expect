import expect from ".."

test("anything", () => {
  assert.True(expect.anything().test(1))
  assert.False(expect.anything().test(nil))
})

test("any", () => {
  assert.True(expect.any("number").test(1))
  assert.False(expect.any("string").test(1))
  assert.False(expect.any("string").test(nil))
  assert.error(() => expect.any(String))

  class Foo {}
  assert.True(expect.any(Foo).test(new Foo()))
  assert.False(expect.any(Foo).test({}))
})

test("arrayContaining", () => {
  assert.True(expect.arrayContaining([1, 2]).test([1, 2, 3]))
  assert.False(expect.arrayContaining([1, 2]).test([1, 3]))
  assert.True(expect.arrayContaining([1, 2]).test([1, 2]))
  assert.False(expect.arrayContaining([1, 2]).test([2, 3, 4]))
})

test("tableContaining", () => {
  assert.True(expect.tableContaining({ a: 1, b: 2 }).test({ a: 1, b: 2, c: 3 }))
  assert.False(expect.tableContaining({ a: 1, b: 2 }).test({ a: 1, b: 3 }))
  assert.True(expect.tableContaining({ a: 1, b: 2 }).test({ a: 1, b: 2 }))
  assert.False(expect.tableContaining({ a: 1, b: 2 }).test({ b: 2, c: 3 }))
})

test("stringContaining", () => {
  assert.True(expect.stringContaining("foo").test("foobar"))
  assert.False(expect.stringContaining("foo").test("bar"))
  assert.True(expect.stringContaining("foo").test("foo"))
  assert.False(expect.stringContaining("foo").test("barbaz"))
})

test("stringMatching", () => {
  assert.True(expect.stringMatching("foo").test("foobar"))
  assert.False(expect.stringMatching("foo").test("bar"))
  assert.True(expect.stringMatching("foo").test("foo"))
  assert.False(expect.stringMatching("foo").test("barbaz"))
})

test("closeTo", () => {
  assert.True(expect.closeTo(1, 0.6).test(1.5))
  assert.False(expect.closeTo(1, 0.5).test(2))
  assert.True(expect.closeTo(1, 0.5).test(1))
  assert.False(expect.closeTo(1, 0.6).test(2.5))
})

test("_", () => {
  assert.True(expect._.test(1))
  assert.True(expect._.test(nil))
})
