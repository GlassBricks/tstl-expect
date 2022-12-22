import { getDiffString, prettyPrint } from "../pretty-print-and-diff"

require("busted.runner")()

describe("pretty print", () => {
  test("primitives", () => {
    assert.equal('"hello"', prettyPrint("hello"))
    assert.equal("1", prettyPrint(1))
    assert.equal("true", prettyPrint(true))
    assert.equal("false", prettyPrint(false))
    assert.equal("nil", prettyPrint(nil))
  })

  test("simple tables", () => {
    assert.equal("[]", prettyPrint({}))
    assert.equal("{ a: 1, b: 2 }", prettyPrint({ a: 1, b: 2 }))
    assert.equal("[1, 2, 3]", prettyPrint([1, 2, 3]))
    assert.equal("{ a: 1, b: 2 }", prettyPrint({ b: 2, a: 1 }))

    const mixed: any = [1, 2, 3]
    mixed.a = 1
    mixed.b = 2
    // big table
    assert.equal(
      `{
  [1]: 1,
  [2]: 2,
  [3]: 3,
  a: 1,
  b: 2
}`,
      prettyPrint(mixed),
    )

    const arrayWithGaps: any = []
    arrayWithGaps[1] = 1
    arrayWithGaps[5] = 5
    assert.equal("{ [1]: 1, [5]: 5 }", prettyPrint(arrayWithGaps))
  })

  test("nested tables", () => {
    assert.equal(
      `{
  a: { b: 1 }
}`,
      prettyPrint({ a: { b: 1 } }),
    )
    assert.equal(
      `{
  a: { b: 1, c: 2 }
}`,
      prettyPrint({ a: { b: 1, c: 2 } }),
    )
    assert.equal(
      `{
  a: { b: 1, c: 2 },
  d: 3
}`,
      prettyPrint({ d: 3, a: { c: 2, b: 1 } }),
    )
    assert.equal(
      `[
  { a: 1 },
  { b: 2 }
]`,
      prettyPrint([{ a: 1 }, { b: 2 }]),
    )
    // big nested table
    const obj = {
      a: {
        b: {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
        },
      },
    }
    assert.equal(
      `{
  a: {
    b: {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    }
  }
}`,
      prettyPrint(obj),
    )

    // max depth of 4
    const obj2 = {
      a: {
        // 1
        b: {
          // 2
          c: {
            // 3
            d: {
              // 4 - should be truncated
              e: {
                f: 1,
              },
            },
          },
        },
      },
    }
    assert.equal(
      `{
  a: {
    b: {
      c: {
        d: {...}
      }
    }
  }
}`,
      prettyPrint(obj2),
    )

    // non-id keys
    const obj3 = { "a.b": 1 }
    assert.equal(`{ "a.b": 1 }`, prettyPrint(obj3))
  })

  test("arrays", () => {
    const arr = [
      {
        a: 1,
        big: 2,
        table: 3,
        thing: 4,
      },
      2,
    ]
    assert.equal(
      `[
  {
    a: 1,
    big: 2,
    table: 3,
    thing: 4
  },
  2
]`,
      prettyPrint(arr),
    )
  })

  test("tables with object keys", () => {
    const obj = Symbol("obj")
    assert.equal("{ [Symbol(obj)]: 1 }", prettyPrint({ [obj]: 1 }))
    assert.equal(
      `{
  [Symbol(obj)]: { a: 1 }
}`,
      prettyPrint({ [obj]: { a: 1 } }),
    )

    const tableWithToString = setmetatable({}, { __tostring: () => "tableWithToString" })
    assert.equal("{ [tableWithToString]: 1 }", prettyPrint({ [tableWithToString as any]: 1 }))
  })

  test("function", () => {
    const fn = () => 0
    assert.equal(`[${tostring(fn)}]`, prettyPrint(fn))
  })

  test("circular tables", () => {
    const c: any = {}
    c.c = c
    assert.equal("{ c: <circular> }", prettyPrint(c))

    const a: any = {}
    const b: any = {}
    a.b = b
    b.a = a
    assert.equal(
      `{
  b: { a: <circular> }
}`,
      prettyPrint(a),
    )
  })

  test("tables with metatables prettyPrint using tostring", () => {
    const tableWithMetatable = setmetatable(
      {},
      {
        __tostring() {
          return "hello"
        },
      },
    )
    assert.equal("hello", prettyPrint(tableWithMetatable))
  })

  test("max keys", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    // max keys is 10
    assert.equal(
      `[
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  ...
]`,
      prettyPrint(arr),
    )
  })
})

describe("diff", () => {
  test("primitive diffs", () => {
    assert.Nil(getDiffString("hello", "hello"))
    assert.Nil(getDiffString(1, 1))
    assert.Nil(getDiffString(true, true))

    assert.equal("2", getDiffString(1, 2))
    assert.equal('"hello"', getDiffString("goodbye", "hello"))
    assert.equal('"hello"', getDiffString(2, "hello"))
    assert.equal("true", getDiffString(false, true))
    assert.equal("nil", getDiffString(1, nil))
    assert.equal("[1, 2]", getDiffString(1, [1, 2]))
  })

  describe("table diffs", () => {
    test("equal tables", () => {
      assert.Nil(getDiffString({}, {}))
      assert.Nil(getDiffString({ a: 1 }, { a: 1 }))
      assert.Nil(getDiffString({ a: 1, b: 2 }, { a: 1, b: 2 }))

      // circular tables
      const a: any = { a: 1 }
      a.b = { a }

      const c: any = { a: 1 }
      c.b = { a }

      assert.Nil(getDiffString(a, c))
    })

    test("different value", () => {
      assert.equal(
        `{
 *a: 2
}`,
        getDiffString({ a: 1 }, { a: 2 }),
      )
      assert.equal(
        `{
 *a: {
   *b: 2
  }
}`,
        getDiffString({ a: { b: 1 } }, { a: { b: 2 } }),
      )
      assert.equal(
        `{
 *a: {
   *b: 2
  },
  c: 3
}`,
        getDiffString({ a: { b: 1 }, c: 3 }, { a: { b: 2 }, c: 3 }),
      )
      assert.equal(
        `{
 *[1]: 2
}`,
        getDiffString([1], [2]),
      )
    })
    test("extra key", () => {
      assert.equal(
        `{
 +a: 1
}`,
        getDiffString({}, { a: 1 }),
      )
    })
    test("missing key", () => {
      assert.equal(
        `{
 -a: 1
}`,
        getDiffString({ a: 1 }, {}),
      )
    })
    test("too deeply nested", () => {
      assert.equal(
        `{
 *a: {
   *b: {
     *c: {
       *d: ...
      }
    }
  }
}`,
        getDiffString({ a: { b: { c: { d: { e: 1 } } } } }, { a: { b: { c: { d: { e: 2 } } } } }),
      )
    })
    test("allowing extra keys", () => {
      const diff = getDiffString({ a: 1 }, { a: 1, b: 2 }, true)
      assert.Nil(diff)

      const diff2 = getDiffString({ a: 1 }, { a: 2, b: 2 }, true)
      assert.equal(
        `{
 *a: 2,
  b: 2
}`,
        diff2,
      )
    })
  })

  test("metatables with __eq", () => {
    const metatable: LuaMetatable<any> = {
      __eq(other) {
        return this.a == other.a
      },
    }
    const a = setmetatable({ a: 1 }, metatable)
    const b = setmetatable({ a: 1 }, metatable)
    assert.Nil(getDiffString(a, b))
    assert.equal(`{ a: 1 }`, getDiffString(a, { a: 1 }))
  })
})
