# Changelog

## v0.4.6

- Allow using "userdata" in place of "table" as subject in toEqual and toMatch.

## v0.4.5

- Fallback to `getmetatable` if `debug.getmetatable` is not available.

## v0.4.4

- .toMatchTable() now works even on tables having metatables with __eq.

## v0.4.2

- Fix issue with infinitely recursive type in DeepPartialValueOrMatcher

## v0.4.0

- Only support "full phrase" matchers (e.g. `toBeCalled()`), to simplify the API and increase parity with Jest.
- Mocks now support lua multi-return.
- Added optional type arguments to various matcher functions.

## v0.3.2

- Equal keys in diff strings are sorted.
- Handle metatables with __eq in diff strings.
- Nth call matchers do not accept 0 as valid nth value.

## v0.3.1

- Fix issues when number of expected params vs actual params is different in mock function matchers.

## v0.3.0

- Added a `stub` option to mocking functions that replace implementations.
- Fixed some type issues with mock functions and no-self.
- Added full phrase alternative option to matchers (e.g. `toBeCalled()` instead of `to.be.called()`).
- Tweaks to formatting of error messages.

## v0.2.0

- Renamed "Assertion" to "Matchers", and old "Matchers" to "Asymmetric Matchers". Almost all functions have the same
  names, but the types are different.
- Moved mock functions and related functions to a separate importable namespace `mock`.
- Added the ability to mock properties on objects, using `mock.on` and `mock.all`.

## v0.1.0

- Initial release
