import { useCallback, useState } from "react";

/** Parse / export / template / file-menu overlay flags for the PPT editor. */
export function useEditorDialogs(initialParseOpen = false) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(initialParseOpen);
  const [exportOpen, setExportOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const closeActions = useCallback(() => setActionsOpen(false), []);
  const toggleActions = useCallback(() => setActionsOpen((value) => !value), []);
  const openParse = useCallback(() => setParseOpen(true), []);
  const closeParse = useCallback(() => setParseOpen(false), []);
  const openExport = useCallback(() => setExportOpen(true), []);
  const closeExport = useCallback(() => setExportOpen(false), []);
  const openTemplates = useCallback(() => setTemplatesOpen(true), []);
  const closeTemplates = useCallback(() => setTemplatesOpen(false), []);

  return {
    actionsOpen,
    setActionsOpen,
    toggleActions,
    closeActions,
    parseOpen,
    setParseOpen,
    openParse,
    closeParse,
    exportOpen,
    openExport,
    closeExport,
    generating,
    setGenerating,
    templatesOpen,
    openTemplates,
    closeTemplates,
  };
}
