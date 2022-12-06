type WithMetatable<T, M> = {
  [P in keyof M]: M[P] extends (arg1: T, ...args: infer A) => infer R ? (this: T, ...args: A) => R : never
}
interface String extends WithMetatable<string, typeof string> {
  match(this: string, pattern: string, init?: number): LuaMultiReturn<string[]>
}
