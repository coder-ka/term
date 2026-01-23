/**
 * Term is a reactive primitive with the following features:
 *
 * - lazy initialization
 * - observable
 * - holds dirty state
 */
export type Term<T> = {
  (): T;
  set(value: T): void;
  subscribe(fn: (value: T) => void): () => void;
  dirtyMap: WeakMap<object, boolean>;
};

export function createTerm<T>(): Term<T> {
  let initialized = false;
  let value: T;
  let subscribers = new Set<(x: T) => void>();

  return Object.assign<
    {
      // Callable form of getter
      (): T;
    },
    Pick<Term<T>, "set" | "subscribe" | "dirtyMap">
  >(
    function get() {
      if (!initialized) {
        throw new Error("Term is not initialized");
      }
      return value;
    },
    {
      set(newValue: T) {
        value = newValue;
        initialized = true;
        for (const subscriber of subscribers) {
          subscriber(newValue);
        }
      },
      subscribe(fn: (value: T) => void) {
        subscribers.add(fn);

        return () => {
          subscribers.delete(fn);
        };
      },
      dirtyMap: new WeakMap<object, boolean>(),
    },
  );
}

export function createEffect(
  fn: () => void | (() => void),
  deps: Term<unknown>[],
) {
  let cleanup: void | (() => void) = undefined;

  const unsubscribes = deps.map((dep) => {
    dep.dirtyMap.set(fn, true);
    return dep.subscribe(() => {
      dep.dirtyMap.set(fn, true);
    });
  });

  return {
    invoke: () => {
      const isDirty =
        deps.length === 0 ||
        deps.reduce((isDirty, dep) => {
          const depIsDirty = dep.dirtyMap.get(fn) === true;
          dep.dirtyMap.set(fn, false);
          return isDirty || depIsDirty;
        }, false);

      if (!isDirty) return;

      if (cleanup) {
        cleanup();
      }
      cleanup = fn();
    },
    dispose: () => {
      if (cleanup) {
        cleanup();
      }
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    },
  };
}
