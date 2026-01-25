import { createTerm, createEffect } from "@coder-ka/term";

const Count = createTerm<number>();
const Button = createTerm<HTMLButtonElement>();

createEffect(
  () => {
    const button = Button();
    button.textContent = `${Count()}`;
  },
  [Button, Count],
  [Button, Count],
);

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
);

createEffect(
  () => {
    const button = Button();
    document.body.appendChild(button);
    return () => {
      document.body.removeChild(button);
    };
  },
  [Button],
  [Button],
);

const button = document.createElement("button");
Button.set(button);
Count.set(0);
