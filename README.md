# term.js

A small library for reactive programming.

## Getting Started

```bash
npm i @coder-ka/term
```

## Hello World

```ts
const GreetTo = createTerm<string>();

createEffect(
() => {
    console.log(`Hello, ${GreetTo()}!`);
},
[GreetTo],
[GreetTo],
);

GreetTo.set("World");
GreetTo.set("John");
GreetTo.set("Alice");
```

This code produces the following output:

```
Hello, World!
Hello, John!
Hello, Alice!
```

## Term and Effect

Term.js consists of two core concepts: **“Term”** and **“Effect”**.

A *Term* is similar to a variable in mathematics, while an *Effect* is a process that reacts to Terms.

The idea is to first define Terms and Effects that operate on them, and then assign concrete values to the Terms—much like defining a mathematical formula and later substituting specific values for its variables.

This is the basic concept of Term.js.

## API

### `createTerm`

```ts
createTerm<T>(): Term<T>
```

The `createTerm` function is very simple.

```ts
const Count = createTerm<number>();

Count.set(0);

console.log(Count()); // 0
```

### `createEffect`

```ts
createEffect(
    fn: () => (() => void) | void,
    dirtyCheckDeps: Term[],
    timingDeps: Term[]
): { dispose(): void }
```

An Effect takes three arguments.

The first argument is a function that defines the effect’s logic.
This function may return a cleanup function, which will be executed before the effect is re-run.

The second argument is an array of Terms used to determine whether the effect should run.
If any of these Terms is marked as dirty, the effect will be executed.
A Term becomes dirty when its value is updated.

The third argument is an array of Terms that determine the timing of execution.
The effect will run in response to changes in any of these Terms.

```ts
const Created = createTerm<{}>();
const Position = createTerm<{ x: number; y: number }>();
const AnimationFrame = createTerm<{ delta: number }>();

createEffect(
  () => {
    const position = Position();
    const frame = AnimationFrame();

    Position.set({
      x: position.x + frame.delta,
      y: position.y + frame.delta,
    });
  },
  // Only when position is dirty
  [Position],
  // Execute per animation frame
  [AnimationFrame],
);

createEffect(
  () => {
    let now = performance.now();
    let animationId = requestAnimationFrame(setFrame);
    function setFrame() {
      const next = performance.now();
      AnimationFrame.set({
        delta: next - now,
      });
      now = next;
      animationId = requestAnimationFrame(setFrame);
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  },
  [Created],
  [Created],
);

Position.set({
  x: 0,
  y: 0,
});
Created.set({});
```

In the above example, the Created term is used only to trigger the initialization effect.

You can dispose of an effect by calling the dispose method on the object returned by `createEffect`.

```ts
const effect = createEffect(() => {
    return () => {};
});

effect.dispose();
```

When an effect is disposed, its cleanup function is also executed.
