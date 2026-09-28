import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFoundPage() {
  return <AppShell><EmptyState title="页面不存在" description="当前地址没有对应的低保真页面。" action={<Link className="button button--primary" to="/chat">返回主页</Link>} /></AppShell>;
}
