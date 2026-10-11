import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { PrototypeProvider } from "./app/PrototypeContext";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/components/overlay.css";
import "./styles/components/topbar.css";
import "./styles/components/form.css";
import "./styles/components/button.css";
import "./styles/components/modal.css";
import "./styles/components/popover.css";
import "./styles/features/chat-home.css";
import "./styles/components/chat-controls.css";
import "./styles/components/composer.css";
import "./styles/foundations.css";
import "./styles/components/sidebar.css";
import "./styles/features/tasks.css";
import "./styles/features/skills.css";
import "./styles/features/account.css";
import "./styles/features/ppt-projects.css";
import "./styles/layout/page-chrome.css";
import "./styles/features/conversation.css";
import "./styles/features/ppt-editor/00-shell-and-topbar.css";
import "./styles/features/ppt-editor/10-navigation-and-canvas.css";
import "./styles/features/ppt-editor/20-slide-content.css";
import "./styles/features/ppt-editor/30-agent-and-dialogs.css";
import "./styles/features/ppt-editor/40-element-properties.css";
import "./styles/features/ppt-editor/99-responsive.css";
import "./styles/features/chart.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PrototypeProvider>
        <App />
      </PrototypeProvider>
    </BrowserRouter>
  </StrictMode>,
);
