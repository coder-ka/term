import { createEffect, createTerm } from "@coder-ka/term";
import { Counter } from "./Counter";

const DOMContentLoaded = createTerm<Event>();

createEffect(
  () => {
    // create component instance
    const counter = Counter();

    // define effects
    const effects = [
      createEffect(
        () => {
          const button = counter.terms.Button();
          const app = document.getElementById("app")!;
          app.appendChild(button);
          return () => {
            app.removeChild(button);
          };
        },
        [counter.terms.Button],
        [counter.terms.Button],
      ),
    ];

    // init component instance
    const button = document.createElement("button");
    counter.terms.Button.set(button);
    counter.terms.Count.set(0);

    return () => {
      counter.dispose();
      effects.forEach((eff) => eff.dispose());
    };
  },
  [DOMContentLoaded],
  [DOMContentLoaded],
);

document.addEventListener("DOMContentLoaded", (e) => {
  DOMContentLoaded.set(e);
});
