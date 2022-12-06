/** @noSelfInFile */

import { extend, newAssertion } from "./expect"
import { createInvertedFactory } from "./matcher"
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
} from "./matchers"
import { Assertion, BuiltinExpectMatchers, ExpectObj, InvertedExpectMatchers } from "./types"

const expect = function expect<T>(this: void, subject: T): Assertion<T> {
  return newAssertion(subject)
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
export * from "./matcher"
export * from "./mock"
