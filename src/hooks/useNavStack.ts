import { useCallback, useEffect, useRef, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "create" }
  | { name: "edit"; id: string }
  | { name: "detail"; id: string }
  | { name: "settings" }
  | { name: "labels" };

type HistoryState = {
  navIdx: number;
  dialog?: string;
};

function readIdx(state: unknown): number {
  if (state && typeof state === "object" && "navIdx" in state) {
    const idx = (state as HistoryState).navIdx;
    if (typeof idx === "number" && idx >= 0) return idx;
  }
  return 0;
}

/**
 * Pila de ventanas estilo Flutter, sincronizada con history del WebView
 * para que el gesto/botón atrás de Android haga pop.
 */
export function useNavStack(initial: Route = { name: "home" }) {
  const [stack, setStack] = useState<Route[]>([initial]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const stackRef = useRef(stack);
  const ignorePopRef = useRef(false);
  stackRef.current = stack;

  useEffect(() => {
    const current = window.history.state as HistoryState | null;
    if (!current || typeof current.navIdx !== "number") {
      window.history.replaceState({ navIdx: 0 } satisfies HistoryState, "");
    }

    const onPopState = (event: PopStateEvent) => {
      if (ignorePopRef.current) return;

      const state = (event.state ?? {}) as HistoryState;
      if (state.dialog) {
        // No debería ocurrir al ir atrás (el estado previo no tiene dialog),
        // pero por si acaso no tocamos la pila.
        return;
      }

      window.dispatchEvent(new Event("gastocosas:close-dialog"));

      const idx = readIdx(state);
      setDirection(-1);
      setStack((prev) => {
        if (idx + 1 >= prev.length) return prev;
        return prev.slice(0, idx + 1);
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const push = useCallback((route: Route) => {
    setDirection(1);
    setStack((prev) => {
      const next = [...prev, route];
      window.history.pushState(
        { navIdx: next.length - 1 } satisfies HistoryState,
        "",
      );
      return next;
    });
  }, []);

  const replace = useCallback((route: Route) => {
    setDirection(1);
    setStack((prev) => {
      const next = [...prev.slice(0, -1), route];
      window.history.replaceState(
        { navIdx: Math.max(0, next.length - 1) } satisfies HistoryState,
        "",
      );
      return next;
    });
  }, []);

  /** Volver: usa history.back para alinear gesto del sistema y botón UI. */
  const pop = useCallback(() => {
    if (stackRef.current.length <= 1) return false;
    setDirection(-1);
    window.history.back();
    return true;
  }, []);

  /** Vacía la pila hasta una ruta (p. ej. home tras borrar). */
  const resetTo = useCallback((route: Route) => {
    const depth = stackRef.current.length - 1;
    setDirection(-1);
    setStack([route]);
    if (depth > 0) {
      ignorePopRef.current = true;
      window.history.go(-depth);
      window.setTimeout(() => {
        window.history.replaceState({ navIdx: 0 } satisfies HistoryState, "");
        ignorePopRef.current = false;
      }, 0);
    } else {
      window.history.replaceState({ navIdx: 0 } satisfies HistoryState, "");
    }
  }, []);

  /** Abre un diálogo consumible con el gesto atrás (una entrada de history). */
  const pushDialog = useCallback((id: string) => {
    const idx = Math.max(0, stackRef.current.length - 1);
    window.history.pushState(
      { navIdx: idx, dialog: id } satisfies HistoryState,
      "",
    );
  }, []);

  const dismissDialog = useCallback(() => {
    const state = window.history.state as HistoryState | null;
    if (state?.dialog) {
      window.history.back();
      return true;
    }
    return false;
  }, []);

  return {
    stack,
    route: stack[stack.length - 1] ?? initial,
    direction,
    push,
    pop,
    replace,
    resetTo,
    pushDialog,
    dismissDialog,
    canPop: stack.length > 1,
  };
}
