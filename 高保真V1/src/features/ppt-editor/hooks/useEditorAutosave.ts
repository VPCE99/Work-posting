import { useEffect, type Dispatch } from "react";
import { formatSavedLabel, type EditorDocumentState, type EditorAction } from "../model";

/** dirty → saving (500ms) → saved (450ms). */
export function useEditorAutosave(
  doc: EditorDocumentState,
  dispatch: Dispatch<EditorAction>,
  scheduleSave: (fn: () => void, ms: number) => void,
) {
  useEffect(() => {
    if (doc.saveStatus !== "dirty") return;
    scheduleSave(() => {
      dispatch({ type: "markSaving" });
      scheduleSave(() => {
        dispatch({ type: "markSaved", label: formatSavedLabel() });
      }, 450);
    }, 500);
  }, [doc.saveStatus, doc.past.length, scheduleSave, dispatch]);
}
