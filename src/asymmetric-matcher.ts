/** @noSelfInFile */

import { AsymmetricMatcher, AsymmetricMatcherFuncs } from "./types"

const matcherMt: LuaMetatable<AsymmetricMatcher> = {
  __eq(other: unknown) {
    return rawequal(this, other)
  },
  __tostring() {
    if ((this as InternalMatcher)._isInternal == true) {
      return "expect." + this.description()
    }
    return this.description()
  },
}
export function isMatcher(obj: unknown): obj is AsymmetricMatcherFuncs {
  return rawequal(getmetatable(obj), matcherMt)
}

interface InternalMatcher extends AsymmetricMatcher {
  _isInternal?: unknown
}
/** @internal */
export function _createInternalMatcher(matcher: AsymmetricMatcherFuncs): AsymmetricMatcher {
  const result = createMatcher(matcher) as InternalMatcher
  result._isInternal = true
  return result
}

export function createMatcher(matcher: AsymmetricMatcherFuncs): AsymmetricMatcher {
  return setmetatable(matcher, matcherMt) as AsymmetricMatcher
}

export function invertMatcher(matcher: AsymmetricMatcher): AsymmetricMatcher {
  if ("_inverted" in matcher) {
    return matcher._inverted as AsymmetricMatcher
  }
  const obj = {
    test: (v) => !matcher.test(v),
    description: () => "not." + matcher.description(),
    _inverted: matcher,
  } satisfies AsymmetricMatcherFuncs & { _inverted: AsymmetricMatcher }
  return _createInternalMatcher(obj)
}

export function createInvertedFactory<A extends any[]>(
  factory: (...args: A) => AsymmetricMatcher,
): (...args: A) => AsymmetricMatcher {
  return (...args) => invertMatcher(factory(...args))
}
