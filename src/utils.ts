/** @noSelfInFile */

import { AnySelflessFun, TstlClass } from "./types"

export const primitiveTypes = newLuaSet("string", "number", "boolean", "nil")

export function isPrimitiveType(value: unknown): value is string | number | boolean | undefined {
  return primitiveTypes.has(type(value))
}
export function isTstlClass(v: unknown): v is TstlClass {
  if (type(v) != "table") return false
  return (v as any).prototype.constructor == v
}

export function isCallable(v: unknown): v is AnySelflessFun {
  const vType = type(v)
  return vType == "function" || (vType == "table" && getmetatable(v)?.__call != nil)
}
