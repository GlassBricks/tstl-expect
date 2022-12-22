import { CalledParams } from "./types"

type Pack = (this: void, ...args: unknown[]) => CalledParams

let pack = (table as any).pack as Pack

if (!pack) {
  const sel = select
  pack = (...args: unknown[]): CalledParams => {
    const n = sel("#", ...args)
    const result = [...args] as CalledParams
    result.n = n
    return result
  }
}

export { pack }
