import expect from "../.."
import { getDiffString, prettyPrint } from "../../pretty-print-and-diff"

describe("toBe", () => {
  describe("primitive types", () => {
    test("numbers equal", () => {
      expect(1).to.be(1)
      const error = assert.error(() => {
        expect(1).to.be(2)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).to.be(expected)

Expected: 2
Received: 1
`.trim(),
      )
    })
    test("numbers, not equal", () => {
      expect(1).not.to.be(2)
      const error = assert.error(() => {
        expect(1).not.to.be(1)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).not.to.be(expected)

Expected: not 1
`.trim(),
      )
    })
    test('"1" != 1', () => {
      const error = assert.error(() => {
        expect("1").to.be(1)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).to.be(expected)

Expected: 1
Received: "1"
`.trim(),
      )
    })
    test("strings equal", () => {
      expect("hello").to.be("hello")
      const error = assert.error(() => {
        expect("hello").to.be("world")
      })
      assert.equals(
        error,
        `
expect(received).to.be(expected)

Expected: "world"
Received: "hello"
`.trim(),
      )
    })
    test("strings, not equal", () => {
      expect("hello").not.to.be("world")
      const error = assert.error(() => {
        expect("hello").not.to.be("hello")
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).not.to.be(expected)

Expected: not "hello"
`.trim(),
      )
    })
    test("using toBe method", () => {
      expect(1).toBe(1)
    })
  })
  describe("reference types", () => {
    test("object equality", () => {
      const obj = { a: 2 }
      expect(obj).toBe(obj)

      const obj2 = { a: 2 }
      const error = assert.error(() => {
        expect(obj).toBe(obj2)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).toBe(expected)
Using reference (rawequal) equality

Expected: { a: 2 }
Received: { a: 2 }

Values have no visual difference, but are not reference-equal. Use .equal() to deeply compare values.
`.trim(),
      )
    })
    test("object equality, not", () => {
      expect({}).not.toBe({})
      const obj = {}
      const error = assert.error(() => {
        expect(obj).not.to.be(obj)
      }) as unknown as string
      assert.equals(
        error,
        `expect(received).not.to.be(expected)\nUsing reference (rawequal) equality\n\n` +
          `Expected: not [] (${tostring(obj)})`,
      )
    })

    test("function equality", () => {
      const fn = () => 0
      expect(fn).toBe(fn)
      const fn2 = () => 0
      const error = assert.error(() => {
        expect(fn).toBe(fn2)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).toBe(expected)
Using reference (rawequal) equality

Expected: [${tostring(fn2)}]
Received: [${tostring(fn)}]
`.trim(),
      )
    })

    test("bypasses metatable __eq", () => {
      const obj = {}
      const obj2 = {}
      setmetatable(obj, { __eq: () => true })
      setmetatable(obj2, { __eq: () => true })
      const error = assert.error(() => {
        expect(obj).toBe(obj2)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).toBe(expected)
Using reference (rawequal) equality

Expected: []
Received: []

Values have no visual difference, but are not reference-equal. Use .equal() to deeply compare values.
`.trim(),
      )
    })
  })
})

describe("equal and objectMatch", () => {
  test("primitives", () => {
    expect(1).to.equal(1)
    const error = assert.error(() => {
      expect(1).to.equal(2)
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).to.equal(expected)

Expected: 2
Received: 1
`.trim(),
    )

    expect(1).not.to.equal(2)
    const error2 = assert.error(() => {
      expect(1).not.to.equal(1)
    })
    assert.equals(
      error2,
      `
expect(received).not.to.equal(expected)

Expected: not 1
`.trim(),
    )
  })

  test("table equality", () => {
    expect({ a: 2 }).to.equal({ a: 2 })

    const error = assert.error(() => {
      expect({ a: 2 }).to.equal({ a: 3 })
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).to.equal(expected)

Expected: { a: 3 }
Received: {
 *a: 2
}
`.trim(),
    )

    // extra keys
    const error2 = assert.error(() => {
      expect({ a: 2, b: 3 }).to.equal({ a: 2 })
    })
    assert.equals(
      error2,
      `
expect(received).to.equal(expected)

Expected: { a: 2 }
Received: {
 +b: 3,
  a: 2
}
`.trim(),
    )
    // missing keys
    const error3 = assert.error(() => {
      expect({ a: 2 }).to.equal({ a: 2, b: 3 })
    }) as unknown as string
    assert.equals(
      error3,
      `
expect(received).to.equal(expected)

Expected: { a: 2, b: 3 }
Received: {
 -b: 3,
  a: 2
}
`.trim(),
    )

    const fn = () => 0
    expect(fn).to.equal(fn) // can't deep compare, but ok if same reference

    expect({ fn }).to.equal({ fn })

    const obj1 = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: "hello",
        f: {
          g: 4,
        },
      },
    }
    const obj2 = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: "hello",
        f: {
          g: 4,
        },
      },
    }
    expect(obj1).to.equal(obj2)

    obj2.c.f.g = 5
    const error4 = assert.error(() => {
      expect(obj1).to.equal(obj2)
    }) as unknown as string
    assert.equals(
      error4,
      `
expect(received).to.equal(expected)

Expected: ${prettyPrint(obj2)}
Received: ${getDiffString(obj2, obj1)!}
`.trim(),
    )
  })

  test("table equality, not", () => {
    expect({ a: 2 }).not.to.equal({ a: 3 })
    const error = assert.error(() => {
      expect({ a: 2 }).not.to.equal({ a: 2 })
    })
    assert.equals(
      error,
      `
expect(received).not.to.equal(expected)

Expected: not { a: 2 }
`.trim(),
    )

    const fn = () => 0
    const error2 = assert.error(() => {
      expect(fn).not.to.equal(fn)
    })
    assert.equals(
      error2,
      `
expect(received).not.to.equal(expected)

Expected: not [${tostring(fn)}]
`.trim(),
    )
  })

  test("matchTable", () => {
    expect({ a: 2, b: 3 }).to.matchTable({ a: 2 })
    expect({ a: 2, b: 3 }).to.matchTable({ a: 2, b: 3 })
    const error = assert.error(() => {
      expect({ a: 2 }).to.matchTable({ a: 2, b: 4 })
    })
    assert.equals(
      error,
      `
expect(received).to.matchTable(expected)

Expected: { a: 2, b: 4 }
Received: {
 -b: 4,
  a: 2
}
`.trim(),
    )
  })
  test("not.matchTable", () => {
    expect({ a: 2, b: 3 }).not.to.matchTable({ a: 2, b: 4 })
    const error = assert.error(() => {
      expect({ a: 2, b: 3 }).not.to.matchTable({ a: 2 })
    })
    assert.equals(
      error,
      `
expect(received).not.to.matchTable(expected)

Expected: not { a: 2 }
Received: { a: 2, b: 3 }
`.trim(),
    )
  })

  test("with matchers", () => {
    expect({ a: 2 }).to.equal({ a: expect.anything() })
    expect({ a: 2 }).to.equal({ a: expect.any("number") })

    const error = assert.error(() => {
      expect({ a: 2 }).to.equal({ a: expect.any("string") })
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).to.equal(expected)

Expected: { a: expect.any("string") }
Received: {
 *a: 2 (matcher failed)
}
`.trim(),
    )
  })
})

test("to.be.a", () => {
  expect(1).to.be.a("number")
  expect("hello").to.be.a("string")
  expect({}).to.be.a("table")
  expect(() => 0).to.be.a("function")

  expect(1).not.to.be.a("string")

  const error = assert.error(() => {
    expect(1).to.be.a("string")
  })
  assert.equals(
    error,
    `expect(received).to.be.a(expected)

Expected: a string
Received: 1
`.trim(),
  )

  class Foo {}
  expect(new Foo()).to.be.a(Foo)
  const error2 = assert.error(() => {
    expect("foo").to.be.a(Foo)
  })
  assert.equals(
    error2,
    `
expect(received).to.be.a(expected)

Expected: an instance of Foo
Received: "foo"
`.trim(),
  )
})

test("any", () => {
  expect(1).to.be.any()
  expect("hello").to.be.any()
  expect(nil).to.not.be.any()
  const error = assert.error(() => {
    expect(nil).to.be.any()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).to.be.any()

Received: nil
`.trim(),
  )
})

test("nil", () => {
  expect(nil).to.be.nil()
  expect(1).to.not.be.nil()
  const error = assert.error(() => {
    expect(1).to.be.nil()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).to.be.nil()

Received: 1
`.trim(),
  )
})

test("truthy", () => {
  expect(1).to.be.truthy()
  expect("hello").to.be.truthy()
  expect(true).to.be.truthy()
  expect(nil).to.not.be.truthy()
  expect(false).to.not.be.truthy()
  const error = assert.error(() => {
    expect(nil).to.be.truthy()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).to.be.truthy()

Received: nil
`.trim(),
  )
})

test("falsy", () => {
  expect(nil).to.be.falsy()
  expect(false).to.be.falsy()
  expect(1).to.not.be.falsy()
  expect(0).to.not.be.falsy() // lua!
  expect("").not.to.be.falsy()
  const error = assert.error(() => {
    expect(1).to.be.falsy()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).to.be.falsy()

Received: 1
`.trim(),
  )
})
