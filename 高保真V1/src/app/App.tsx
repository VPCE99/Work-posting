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

export function App() {
  const { pathname } = useLocation();
  const pptEditor = /^\/ppt\/.+/.test(pathname) && pathname !== "/ppt/new";
  const fullBleed = pptEditor;

  return (
    <AppShell fullBleed={fullBleed} pptEditor={pptEditor}>
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<HomePage />} />
      <Route path="/chat/:conversationId" element={<ConversationPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/ppt" element={<PptProjectsPage />} />
      <Route path="/ppt/new" element={<Navigate to="/ppt" replace />} />
      <Route path="/ppt/:projectId" element={<PptEditorPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/account/plans" element={<HomePage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </AppShell>
  );
}
