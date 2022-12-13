/** @noSelfInFile */

import { extend, newMatcher } from "./expect"
import { createInvertedFactory } from "./asymmetric-matcher"
import {
  allMatcher,
  any,
  anything,
  arrayContaining,
  closeTo,
  exactly,
  stringContaining,
  stringMatching,
  tableContaining,
} from "./asymmetric-matchers"
import { BuiltinExpectMatchers, ExpectObj, InvertedExpectMatchers, Matchers } from "./types"

const expect = function expect<T>(this: void, subject: T): Matchers<T> {
  return newMatcher(subject)
}
expect.extend = extend

const builtinMatchers: BuiltinExpectMatchers = {
  any,
  anything,
  arrayContaining,
  closeTo,
  tableContaining,
  exactly,
  stringContaining,
  stringMatching,
}

expect._ = allMatcher

Object.assign(expect, builtinMatchers)

const inverted: Partial<InvertedExpectMatchers> = {}
for (const key of keys<InvertedExpectMatchers>()) {
  inverted[key] = createInvertedFactory<any>(builtinMatchers[key])
}
expect.not = inverted as InvertedExpectMatchers

export default expect as ExpectObj
export * from "./types"
export * from "./asymmetric-matcher"
export * from "./mock"
