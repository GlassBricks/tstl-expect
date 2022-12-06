/** @noSelfInFile */

import { Matcher, MatcherFuncs } from "./types"

const matcherMt: LuaMetatable<Matcher> = {
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
export function isMatcher(obj: unknown): obj is MatcherFuncs {
  return rawequal(getmetatable(obj), matcherMt)
}

interface InternalMatcher extends Matcher {
  _isInternal?: unknown
}
/** @internal */
export function _createInternalMatcher(matcher: MatcherFuncs): Matcher {
  const result = createMatcher(matcher) as InternalMatcher
  result._isInternal = true
  return result
}

export function createMatcher(matcher: MatcherFuncs): Matcher {
  return setmetatable(matcher, matcherMt) as Matcher
}

export function invertMatcher(matcher: Matcher): Matcher {
  if ("_inverted" in matcher) {
    return matcher._inverted as Matcher
  }
  const obj = {
    test: (v) => !matcher.test(v),
    description: () => "not." + matcher.description(),
    _inverted: matcher,
  } satisfies MatcherFuncs & { _inverted: Matcher }
  return _createInternalMatcher(obj)
}

export function createInvertedFactory<A extends any[]>(factory: (...args: A) => Matcher): (...args: A) => Matcher {
  return (...args) => invertMatcher(factory(...args))
}
