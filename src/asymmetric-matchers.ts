/** @noSelfInFile */
import { _createInternalMatcher } from "./asymmetric-matcher"
import { deepCompare, prettyPrint } from "./pretty-print-and-diff"
import { isTstlClass } from "./utils"
import { AsymmetricMatcher, LuaType, TstlClass } from "./types"

export function anything(): AsymmetricMatcher {
  return _createInternalMatcher({
    test: (v) => v != nil,
    description: () => "anything()",
  })
}

const luaTypeSet = keySet<Record<LuaType, true>>()
export function any(expected: LuaType | TstlClass): AsymmetricMatcher {
  assert(
    expected != nil,
    'expected must not be nil. Did you supply a type constructor e.g. expect.any(String)? Supply a type string instead e.g. expect.any("string")',
  )
  if (typeof expected == "string") {
    assert(expected in luaTypeSet, `expected must be a valid Lua type; got ${prettyPrint(expected)}`)
  } else if (!isTstlClass(expected)) {
    error("expected must be a valid Lua type or a TSTL class")
  }
  const name = typeof expected == "string" ? prettyPrint(expected) : expected.name
  return _createInternalMatcher({
    test: (r) => (typeof expected == "string" ? type(r) == expected : r instanceof expected),
    description: () => `any(${name})`,
  })
}

export function closeTo(expected: number, delta: number = 0.01): AsymmetricMatcher {
  return _createInternalMatcher({
    test: (r) => typeof r == "number" && math.abs(r - expected) <= delta,
    description: () => `closeTo(${expected}, ${delta})`,
  })
}

export function arrayContaining(values: readonly unknown[]): AsymmetricMatcher {
  if (!Array.isArray(values)) {
    error("Expected value must be an array")
  }
  return _createInternalMatcher({
    test: (r) => {
      if (!Array.isArray(r)) return false
      for (const value of values) {
        if (!r.includes(value)) return false
      }
      return true
    },
    description: () => `arrayContaining(${prettyPrint(values)})`,
  })
}

export function tableContaining(value: unknown): AsymmetricMatcher {
  if (typeof value != "object") {
    error("Expected value must be an object")
  }
  if (type(value) != "table") error("Expected value should be a table, got " + type(value))
  return _createInternalMatcher({
    test: (r) => deepCompare(value, r, true),
    description: () => `tableContaining(${prettyPrint(value)})`,
  })
}

export function stringContaining(value: unknown): AsymmetricMatcher {
  if (typeof value != "string") {
    error("Expected value must be a string")
  }
  return _createInternalMatcher({
    test: (r) => typeof r == "string" && r.includes(value),
    description: () => `stringContaining(${prettyPrint(value)})`,
  })
}

export function stringMatching(value: unknown): AsymmetricMatcher {
  if (typeof value != "string") {
    error("Expected value must be a string")
  }
  return _createInternalMatcher({
    test: (r) => typeof r == "string" && string.match(r, value)[0] != nil,
    description: () => `stringMatching(${prettyPrint(value)})`,
  })
}

export function exactly(value: unknown): AsymmetricMatcher {
  return _createInternalMatcher({
    test: (r) => rawequal(r, value),
    description: () => `reference(${prettyPrint(value)})`,
  })
}

export const allMatcher = _createInternalMatcher({
  test: () => true,
  description: () => "_",
})
