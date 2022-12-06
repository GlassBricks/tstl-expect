# tstl-expect

An expect-style assertion library for [TypeScriptToLua](https://typescripttolua.github.io/). Contains several features/traits specifically for TSTL.

This is a TypescriptToLua Library (see https://typescripttolua.github.io/docs/publishing-modules). Simply `npm install tstl-expect` or `yarn add tstl-expect` into your TSTL project, and you're good to go.

Inspired by [jest](https://jestjs.io/) and [expect.js](htpps://github.com/Automattic/expect.js).

## Features

Supports:

- Matchers with fluent syntax
- Asymmetric matchers,
- Spy/mock functions with and without the self parameter
- Printing in Typescript-ish syntax

Examples

```ts
import { mockFn, mockFnNoSelf } from "./mock";

expect(1).to.be(1);

expect(true).not.to.be(false);

expect(0).to.be.truthy(); // 0 is truthy in lua!

expect("foo").to.be.a("string");

expect([1, 2, 3]).to.contain(2);

expect({ foo: "bar" }).to.equal({ foo: "bar" });

expect(1).to.be.not.gt(2);

expect({ a: 1, b: 2 }).to.matchTable({
  a: expect.any("number")
});

const fn = mockFnNoSelf((a, b) => a + b);
fn(1, 2);
fn.returnsOnce(0);
fn(2, 3);
fn(3, 4);

expect(fn.calls).to.have.length(3);

expect(fn).to.have.been.calledWith(1, 2)
  .and.calledWith(2, expect.closeTo(3, 0.1))
  .and.haveReturned(0)
  .and.lastCalledWith(3, 4)
  .and.not.calledWith(expect._, expect.any("string"));

const fn2 = mockFn()
expect(fn2.hasSelfParam).to.be(true);
// This the first parameter (self) does not show up in calls, instead it is in `context`
fn2.call({ foo: "bar" }, 1, 2);
expect(fn).to.have.been.calledWith(1, 2)
expect(fn.contexts).to.equal([{ foo: "bar" }]);
```

You can add custom matchers:

```ts
import expect from "tstl-expect";
import { prettyPrint } from "tstl-expect/pretty-print-and-diff";

expect.extend({
  metatable(this: AssertionContext, recieved: unknown) {
    const pass = getmetatable(recieved) !== undefined;
    if (pass == this.isNot) {
      this.fail(`Expected: value with ${this.isNot ? "no " : ""}metatable\n`
        + `Recieved: ${prettyPrint(recieved)}`);
    }
  }
});

declare module "tstl-expect" {
  interface Assertions<T> {
    metatable(): this;
  }
}
expect({}).not.to.have.metatable();
```

You can also create custom asymmetric matchers:

```ts
import { createMatcher } from "tstl-expect";

const customMatcher = createMatcher({
  test: (v) => v == "foo",
  description: () => "is foo"
});

expect("foo").to.equal(customMatcher);
```

For more details, see the documentation comments in `src/types.ts`.
