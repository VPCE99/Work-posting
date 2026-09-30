import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AccountPage } from "../pages/account/AccountPage";
import { ConversationPage } from "../pages/chat/ConversationPage";
import { HomePage } from "../pages/chat/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PptEditorPage } from "../pages/ppt/PptEditorPage";
import { PptProjectsPage } from "../pages/ppt/PptProjectsPage";
import { SkillsPage } from "../pages/skills/SkillsPage";
import { TasksPage } from "../pages/tasks/TasksPage";
import { usePrototype } from "./PrototypeContext";

export function App() {
  const { pathname } = useLocation();
  const fullBleed = /^\/ppt\/.+/.test(pathname);

  return (
    <AppShell fullBleed={fullBleed}>
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<HomePage />} />
      <Route path="/chat/:conversationId" element={<ConversationPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/ppt" element={<PptProjectsPage />} />
      <Route path="/ppt/new" element={<Navigate to="/ppt" replace />} />
      <Route path="/ppt/:projectId" element={<PptEditorPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/account/plans" element={<DialogHome dialog="plans" />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </AppShell>
  );
}

function DialogHome({ dialog }: { dialog: "plans" }) {
  const { setActiveDialog } = usePrototype();
  useEffect(() => {
    setActiveDialog(dialog);
  }, [dialog, setActiveDialog]);
  return <HomePage />;
}
