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
  checkInitialized: () => boolean;
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
    Pick<Term<T>, "set" | "subscribe" | "dirtyMap" | "checkInitialized">
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
      checkInitialized() {
        return initialized;
      },
    },
  );
}

export function createEffect(
  fn: () => void | (() => void),
  dirtyCheckDeps: Term<unknown>[],
  timingDeps: Term<unknown>[],
) {
  let cleanup: void | (() => void) = undefined;

  const dirtyCheckDepsUnsubscribes = dirtyCheckDeps.map((dep) => {
    dep.dirtyMap.set(fn, false);
    return dep.subscribe(() => {
      dep.dirtyMap.set(fn, true);
    });
  });

  function effectFn() {
    const isDirty =
      dirtyCheckDeps.length === 0 ||
      dirtyCheckDeps.reduce((isDirty, dep) => {
        const depIsDirty = dep.dirtyMap.get(fn) === true;
        dep.dirtyMap.set(fn, false);
        return isDirty || depIsDirty;
      }, false);

    if (!isDirty) return;

    if (cleanup) {
      cleanup();
    }
    cleanup = fn();
  }

  const timingDepsUnsubscribes = timingDeps.map((dep) =>
    dep.subscribe(() => {
      if (dirtyCheckDeps.some((x) => !x.checkInitialized())) return;
      queueMicrotask(effectFn);
    }),
  );
  if (timingDeps.length === 0) queueMicrotask(effectFn);

  return {
    dispose: () => {
      if (cleanup) {
        cleanup();
      }
      for (const unsubscribe of dirtyCheckDepsUnsubscribes) {
        unsubscribe();
      }
      for (const unsubscribe of timingDepsUnsubscribes) {
        unsubscribe();
      }
    },
  };
}
