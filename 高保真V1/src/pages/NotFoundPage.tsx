import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFoundPage() {
  return <EmptyState title="页面不存在" description="当前地址没有对应的 ChopChat 页面。" action={<Link className="button button--primary" to="/chat">返回主页</Link>} />;
}
