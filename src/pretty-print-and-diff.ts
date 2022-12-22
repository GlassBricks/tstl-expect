/** @noSelfInFile */

import { isMatcher } from "./asymmetric-matcher"

const INDENT = "  "
const MAX_SINGLE_LINE_KEYS = 3
const MAX_LINE_LENGTH = 120
const MAX_DEPTH = 4
const MAX_KEYS = 10

export function prettyPrint(obj: unknown, maxDepth: number = MAX_DEPTH): string {
  return doPrettyPrint(obj, "", MAX_DEPTH - maxDepth, new LuaMap())
}

function shouldChopDown(values: string[], indentLength: number) {
  return (
    values.length > MAX_SINGLE_LINE_KEYS ||
    values.some((value) => value.includes("\n") || string.match(value, "[{%[][%. \n]")[0]) ||
    values.reduce((a, b) => a + b.length + 2, 0) > MAX_LINE_LENGTH - indentLength - 6
  )
}

const keyPriority = {
  number: 1,
  string: 2,
  boolean: 3,
  table: 4,
  function: 5,
  userdata: 6,
  thread: 7,
  nil: 8,
} satisfies Record<ReturnType<typeof type>, number>

function compareKeys(this: void, a: unknown, b: unknown): boolean {
  const aType = type(a)
  const bType = type(b)
  if (aType != bType) {
    return keyPriority[aType] < keyPriority[bType]
  }
  if (aType == "number" || aType == "string") {
    return (a as number | string) < (b as number | string)
  }
  if (aType == "boolean") {
    return a as boolean
  }
  return false
}

function formatKey(a: unknown) {
  if (typeof a == "string") {
    return string.match(a, "^[%a_][%w_]*$")[0] ? a : "%q".format(a)
  }
  return `[${tostring(a)}]`
}

function doPrettyPrint(obj: unknown, indent: string, depth: number, refs: LuaMap): string {
  const objType = type(obj)
  if (objType == "string") {
    return "%q".format(obj)
  }
  if (objType == "number" || objType == "boolean" || objType == "nil") {
    return tostring(obj)
  }
  if (objType == "table") {
    return printTable(obj as LuaTable, indent, depth, refs)
  }
  return `[${tostring(obj)}]`
}
function isNumber(this: unknown, key: unknown): key is number {
  return type(key) == "number"
}

function printTable(obj: LuaTable, curIndent: string, depth: number, refs: LuaMap) {
  const metatable = getmetatable(obj)
  if (metatable && metatable.__tostring) {
    return tostring(obj)
  }

  if (refs.has(obj)) {
    return "<circular>"
  }

  if (next(obj)[0] == nil) {
    return "[]"
  }

  if (depth >= MAX_DEPTH) {
    return 1 in obj ? "[...]" : "{...}"
  }

  const keys: AnyNotNil[] = []
  let hitMaxKeys = false
  for (const [key] of obj) {
    if (keys.length >= MAX_KEYS) {
      hitMaxKeys = true
      break
    }
    keys.push(key)
  }

  refs.set(obj, true)
  const result: string = keys.every(isNumber)
    ? printArray(obj, keys, curIndent, depth, refs, hitMaxKeys)
    : printNormalTable(obj, keys, curIndent, depth, refs, hitMaxKeys)
  refs.delete(obj)
  return result
}

const MAX_GAP = 2

function printArray(
  arr: LuaTable,
  keys: number[],
  curIndent: string,
  depth: number,
  refs: LuaMap,
  hitMaxKeys: boolean,
) {
  table.sort(keys)
  // check for big gaps
  let gap = false
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] - keys[i - 1] > MAX_GAP) {
      gap = true
      break
    }
  }
  if (gap) return printNormalTable(arr, keys, curIndent, depth, refs, hitMaxKeys)

  const nextIndent = curIndent + INDENT
  const values: string[] = []
  const lastIndex = keys[keys.length - 1]
  for (const i of $range(1, lastIndex)) {
    values.push(doPrettyPrint(arr.get(i), nextIndent, depth + 1, refs))
  }
  if (hitMaxKeys) values.push("...")
  if (shouldChopDown(values, curIndent.length)) {
    return "[\n%s%s\n%s]".format(nextIndent, values.join(`,\n${nextIndent}`), curIndent)
  }
  return `[${values.join(", ")}]`
}

function printNormalTable(
  obj: LuaTable,
  keys: AnyNotNil[],
  curIndent: string,
  depth: number,
  refs: LuaMap,
  hitMaxKeys: boolean,
): string {
  table.sort(keys, compareKeys)

  const nextIndent = curIndent + INDENT
  const values = keys.map((key) =>
    "%s: %s".format(formatKey(key), doPrettyPrint(obj.get(key), nextIndent, depth + 1, refs)),
  )
  if (hitMaxKeys) values.push("...")

  if (shouldChopDown(values, curIndent.length)) {
    return "{\n%s%s\n%s}".format(nextIndent, values.join(`,\n${nextIndent}`), curIndent)
  } else {
    return "{ %s }".format(values.join(", "))
  }
}

const getmeta = getmetatable
/**
 * Returns:
 *
 * - nil : if tables are equal
 * - string: if not equal, and are both comparable tables
 * - true, if not equal, and are not comparable tables
 */
function doGetDiff(
  expected: unknown,
  actual: unknown,
  curIndent: string,
  depth: number,
  expectedRefs: LuaMap,
  allowExtraKeys: boolean,
): string | true | undefined {
  if (expected == actual) return nil
  if (isMatcher(expected)) {
    return expected.test(actual) ? nil : prettyPrint(actual, 1) + " (matcher failed)"
  }
  const expectedType = type(expected)
  const actualType = type(actual)
  if (expectedType == "table" && actualType == "table") {
    const meta = getmeta(expected)
    if (meta && (meta.__eq || (meta as any).__pairs)) return true

    return getTableDiff(expected as LuaTable, actual as LuaTable, curIndent, depth, expectedRefs, allowExtraKeys)
  }
  return true
}

function getTableDiff(
  expected: LuaTable,
  actual: LuaTable,
  curIndent: string,
  depth: number,
  expectedRefs: LuaMap,
  allowExtraKeys: boolean,
): string | undefined {
  if (expectedRefs.has(expected)) {
    if (expectedRefs.get(expected) == actual) return nil
    return "<unequal circular table>"
  }

  const differences = new LuaMap<AnyNotNil, string>()
  const equalKeys: AnyNotNil[] = []
  const depthExceeded = depth >= MAX_DEPTH

  const nextIndent = curIndent + INDENT
  for (const [key, value] of pairs(expected)) {
    const actualValue = actual.get(key)
    const keyStr = formatKey(key)
    if (actualValue == nil) {
      // missing key
      if (depthExceeded) return "..."
      differences.set(
        key,
        "%s -%s: %s".format(curIndent, keyStr, doPrettyPrint(value, nextIndent, depth + 1, expectedRefs as any)),
      )
    } else {
      const diff = doGetDiff(value, actualValue, nextIndent, depth + 1, expectedRefs as any, allowExtraKeys)
      if (diff == nil) {
        equalKeys.push(key)
      } else if (depthExceeded) {
        return "..."
      } else if (diff == true) {
        differences.set(
          key,
          "%s *%s: %s".format(
            curIndent,
            keyStr,
            doPrettyPrint(actualValue, nextIndent, depth + 1, expectedRefs as any),
          ),
        )
      } else {
        // table diff
        differences.set(key, "%s *%s: %s".format(curIndent, keyStr, diff satisfies string))
      }
    }
  }
  for (const [key, value] of pairs(actual)) {
    if (expected.get(key) == nil) {
      if (allowExtraKeys) {
        equalKeys.push(key)
      } else if (depthExceeded) {
        return "..."
      } else {
        differences.set(
          key,
          "%s +%s: %s".format(
            curIndent,
            formatKey(key),
            doPrettyPrint(value, nextIndent, depth + 1, expectedRefs as any),
          ),
        )
      }
    }
  }
  if (next(differences)[0] == nil) return nil

  const diffKeys = Object.keys(differences)
  table.sort(diffKeys, compareKeys)
  const diffLength = diffKeys.length

  const values: string[] = []
  for (const key of diffKeys) {
    values.push(differences.get(key)!)
  }

  // print equal keys up until MAX_KEYS - diffLength

  const len = math.min(MAX_KEYS - diffLength, equalKeys.length)
  for (const index of $range(1, len)) {
    const key = equalKeys[index - 1]
    values.push("%s%s: %s".format(nextIndent, formatKey(key), prettyPrint(actual.get(key), 1)))
  }
  if (len < equalKeys.length) values.push(curIndent + "...")
  return "{\n%s\n%s}".format(values.join(`,\n`), curIndent)
}

export function getDiffString(expected: unknown, actual: unknown, allowExtraKeys = false): string | undefined {
  const diff = doGetDiff(expected, actual, "", 0, new LuaMap(), allowExtraKeys)
  if (diff == true) return prettyPrint(actual)
  return diff
}
export function deepCompare(expected: unknown, actual: unknown, allowExtraKeys = false): boolean {
  return doGetDiff(expected, actual, "", MAX_DEPTH, new LuaMap(), allowExtraKeys) == nil
}
