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

const expectObj = function expect<T>(this: void, subject: T): Matchers<T> {
  return newMatcher(subject)
}
expectObj.extend = extend

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

expectObj._ = allMatcher

Object.assign(expectObj, builtinMatchers)

const inverted: Partial<InvertedExpectMatchers> = {}
for (const key of keys<InvertedExpectMatchers>()) {
  inverted[key] = createInvertedFactory<any>(builtinMatchers[key])
}
expectObj.not = inverted as InvertedExpectMatchers

const expect = expectObj as ExpectObj

// noinspection JSUnusedGlobalSymbols
export default expect
export * from "./types"
export * from "./asymmetric-matcher"
export * from "./mock"
