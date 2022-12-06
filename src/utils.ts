/** @noSelfInFile */

import { TstlClass } from "./types"

export const primitiveTypes = newLuaSet("string", "number", "boolean", "nil")

export function isPrimitiveType(value: unknown): value is string | number | boolean | undefined {
  return primitiveTypes.has(type(value))
}
export function isTstlClass(v: unknown): v is TstlClass {
  if (type(v) != "table") return false
  return (v as any).prototype.constructor == v
}

export function pack<A extends any[]>(...args: A): A & { n: number } {
  const n = select("#", ...args)
  const res = [...args] as A & { n: number }
  res.n = n
  return res
}
