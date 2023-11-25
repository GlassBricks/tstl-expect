import expect from "../.."
import { getDiffString, prettyPrint } from "../../pretty-print-and-diff"

describe("toBe", () => {
  describe("primitive types", () => {
    test("numbers equal", () => {
      expect(1).toBe(1)
      const error = assert.error(() => {
        expect(1).toBe(2)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).toBe(expected)

Expected: 2
Received: 1
`.trim(),
      )
    })
    test("numbers, not equal", () => {
      expect(1).not.toBe(2)
      const error = assert.error(() => {
        expect(1).not.toBe(1)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).not.toBe(expected)

Expected: not 1
`.trim(),
      )
    })
    test('"1" != 1', () => {
      const error = assert.error(() => {
        expect("1").toBe(1)
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).toBe(expected)

Expected: 1
Received: "1"
`.trim(),
      )
    })
    test("strings equal", () => {
      expect("hello").toBe("hello")
      const error = assert.error(() => {
        expect("hello").toBe("world")
      })
      assert.equals(
        error,
        `
expect(received).toBe(expected)

Expected: "world"
Received: "hello"
`.trim(),
      )
    })
    test("strings, not equal", () => {
      expect("hello").not.toBe("world")
      const error = assert.error(() => {
        expect("hello").not.toBe("hello")
      }) as unknown as string
      assert.equals(
        error,
        `
expect(received).not.toBe(expected)

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
        expect(obj).not.toBe(obj)
      }) as unknown as string
      assert.equals(
        error,
        `expect(received).not.toBe(expected)\nUsing reference (rawequal) equality\n\n` +
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
    expect(1).toEqual(1)
    const error = assert.error(() => {
      expect(1).toEqual(2)
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).toEqual(expected)

Expected: 2
Received: 1
`.trim(),
    )

    expect(1).not.toEqual(2)
    const error2 = assert.error(() => {
      expect(1).not.toEqual(1)
    })
    assert.equals(
      error2,
      `
expect(received).not.toEqual(expected)

Expected: not 1
`.trim(),
    )
  })

  test("table equality", () => {
    expect({ a: 2 }).toEqual({ a: 2 })

    const error = assert.error(() => {
      expect({ a: 2 }).toEqual({ a: 3 })
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).toEqual(expected)

Expected: { a: 3 }
Received: {
 *a: 2
}
`.trim(),
    )

    // extra keys
    const error2 = assert.error(() => {
      expect({ a: 2, b: 3 }).toEqual({ a: 2 })
    })
    assert.equals(
      error2,
      `
expect(received).toEqual(expected)

Expected: { a: 2 }
Received: {
 +b: 3,
  a: 2
}
`.trim(),
    )
    // missing keys
    const error3 = assert.error(() => {
      expect({ a: 2 }).toEqual({ a: 2, b: 3 })
    }) as unknown as string
    assert.equals(
      error3,
      `
expect(received).toEqual(expected)

Expected: { a: 2, b: 3 }
Received: {
 -b: 3,
  a: 2
}
`.trim(),
    )

    const fn = () => 0
    expect(fn).toEqual(fn) // can't deep compare, but ok if same reference

    expect({ fn }).toEqual({ fn })

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
    expect(obj1).toEqual(obj2)

    obj2.c.f.g = 5
    const error4 = assert.error(() => {
      expect(obj1).toEqual(obj2)
    }) as unknown as string
    assert.equals(
      error4,
      `
expect(received).toEqual(expected)

Expected: ${prettyPrint(obj2)}
Received: ${getDiffString(obj2, obj1)!}
`.trim(),
    )
  })

  test("table equality, not", () => {
    expect({ a: 2 }).not.toEqual({ a: 3 })
    const error = assert.error(() => {
      expect({ a: 2 }).not.toEqual({ a: 2 })
    })
    assert.equals(
      error,
      `
expect(received).not.toEqual(expected)

Expected: not { a: 2 }
`.trim(),
    )

    const fn = () => 0
    const error2 = assert.error(() => {
      expect(fn).not.toEqual(fn)
    })
    assert.equals(
      error2,
      `
expect(received).not.toEqual(expected)

Expected: not [${tostring(fn)}]
`.trim(),
    )
  })

  test("matchTable", () => {
    expect({ a: 2, b: 3 }).toMatchTable({ a: 2 })
    expect({ a: 2, b: 3 }).toMatchTable({ a: 2, b: 3 })
    const error = assert.error(() => {
      expect({ a: 2 }).toMatchTable({ a: 2, b: 4 })
    })
    assert.equals(
      error,
      `
expect(received).toMatchTable(expected)

Expected: { a: 2, b: 4 }
Received: {
 -b: 4,
  a: 2
}
`.trim(),
    )
  })
  test("not.matchTable", () => {
    expect({ a: 2, b: 3 }).not.toMatchTable({ a: 2, b: 4 })
    const error = assert.error(() => {
      expect({ a: 2, b: 3 }).not.toMatchTable({ a: 2 })
    })
    assert.equals(
      error,
      `
expect(received).not.toMatchTable(expected)

Expected: not { a: 2 }
Received: { a: 2, b: 3 }
`.trim(),
    )
  })

  test("with matchers", () => {
    expect({ a: 2 }).toEqual({ a: expect.anything() })
    expect({ a: 2 }).toEqual({ a: expect.any("number") })

    const error = assert.error(() => {
      expect({ a: 2 }).toEqual({ a: expect.any("string") })
    }) as unknown as string
    assert.equals(
      error,
      `
expect(received).toEqual(expected)

Expected: { a: expect.any("string") }
Received: {
 *a: 2 (matcher failed)
}
`.trim(),
    )
  })
})

test("to.be.a", () => {
  expect(1).toBeA("number")
  expect("hello").toBeA("string")
  expect({}).toBeA("table")
  expect(() => 0).toBeA("function")

  expect(1).not.toBeA("string")

  const error = assert.error(() => {
    expect(1).toBeA("string")
  })
  assert.equals(
    error,
    `expect(received).toBeA(expected)

Expected: a string
Received: 1
`.trim(),
  )

  class Foo {}
  expect(new Foo()).toBeA(Foo)
  const error2 = assert.error(() => {
    expect("foo").toBeA(Foo)
  })
  assert.equals(
    error2,
    `
expect(received).toBeA(expected)

Expected: an instance of Foo
Received: "foo"
`.trim(),
  )
})

test("any", () => {
  expect(1).toBeAny()
  expect("hello").toBeAny()
  expect(nil).not.toBeAny()
  const error = assert.error(() => {
    expect(nil).toBeAny()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).toBeAny()

Received: nil
`.trim(),
  )
})

test("nil", () => {
  expect(nil).toBeNil()
  expect(1).not.toBeNil()
  const error = assert.error(() => {
    expect(1).toBeNil()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).toBeNil()

Received: 1
`.trim(),
  )
})

test("truthy", () => {
  expect(1).toBeTruthy()
  expect("hello").toBeTruthy()
  expect(true).toBeTruthy()
  expect(nil).not.toBeTruthy()
  expect(false).not.toBeTruthy()
  const error = assert.error(() => {
    expect(nil).toBeTruthy()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).toBeTruthy()

Received: nil
`.trim(),
  )
})

test("falsy", () => {
  expect(nil).toBeFalsy()
  expect(false).toBeFalsy()
  expect(1).not.toBeFalsy()
  expect(0).not.toBeFalsy() // lua!
  expect("").not.toBeFalsy()
  const error = assert.error(() => {
    expect(1).toBeFalsy()
  }) as unknown as string
  assert.equals(
    error,
    `
expect(received).toBeFalsy()

Received: 1
`.trim(),
  )
})

test("comment", () => {
  const error = assert.error(() => {
    expect(3).comment("hi").toBe(2)
  })
  assert.equals(
    error,
    `
hi
expect(received).toBe(expected)

Expected: 2
Received: 3
`.trim(),
  )
})
