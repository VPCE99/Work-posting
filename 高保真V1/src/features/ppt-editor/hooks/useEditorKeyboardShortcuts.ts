import { useEffect, type Dispatch } from "react";
import type { EditorAction } from "../model";

/** ⌘/Ctrl+Z undo, ⇧+Z redo. */
export function useEditorKeyboardShortcuts(dispatch: Dispatch<EditorAction>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      if (key === "z") {
        event.preventDefault();
        dispatch({ type: "undo" });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);
}
