# Changelog

## Unreleased

- Renamed "Assertion" to "Matchers", and old "Matchers" to "Asymmetric Matchers". Almost all functions have the same names, but the types are different.
- Moved mock functions and related functions to a separate importable namespace `mock`.
- Added the ability to mock properties on objects, using `mock.on` and `mock.all`.

## v0.1.0

- Initial release
