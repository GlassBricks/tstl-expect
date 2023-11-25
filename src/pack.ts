import { ArrayWithN } from "./types"

let pack: (this: void, ...args: any[]) => ArrayWithN = (table as any).pack as any

if (!pack) {
  const sel = select
  pack = (...args: unknown[]): ArrayWithN => {
    const n = sel("#", ...args)
    const result = [...args] as ArrayWithN
    result.n = n
    return result
  }
}

const unpack: <T extends any[]>(this: void, list: T) => LuaMultiReturn<T> = (table as any).unpack ?? _G.unpack

export { pack, unpack }
