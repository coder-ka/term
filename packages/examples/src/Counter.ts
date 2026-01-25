import { createEffect, createTerm } from "@coder-ka/term";

// A simple counter component
export function Counter() {
  const Count = createTerm<number>();
  const Button = createTerm<HTMLButtonElement>();

  const effects = [
    createEffect(
      () => {
        const button = Button();
        button.textContent = `${Count()}`;
      },
      [Button, Count],
      [Button, Count],
    ),

    createEffect(
      () => {
        const button = Button();

        function onClick() {
          Count.set(Count() + 1);
        }

        button.addEventListener("click", onClick);

        return () => {
          button.removeEventListener("click", onClick);
        };
      },
      [Button],
      [Button],
    ),
  ];

  return {
    terms: {
      Button,
      Count,
    },
    dispose() {
      effects.forEach((eff) => eff.dispose());
    },
  };
}
