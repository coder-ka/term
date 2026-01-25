import assert from "assert";
import { createTerm, createEffect } from "../src";

const expectedData = ["Hello, World!", "Hello, John!", "Hello, Alice!"];

export function test() {
  const GreetTo = createTerm<string>();

  createEffect(
    () => {
      assert.strictEqual(`Hello, ${GreetTo()}!`, expectedData.shift());
    },
    [GreetTo],
    [GreetTo],
  );

  GreetTo.set("World");
  GreetTo.set("John");
  GreetTo.set("Alice");

  assert.strictEqual(expectedData.length, 0);
}
