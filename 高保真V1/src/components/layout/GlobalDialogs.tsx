import { useLocation } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { MobileBindingDialog } from "../account/MobileBindingDialog";
import { PlansDialog } from "../account/PlansDialog";
import { ChartDialog } from "../chart/ChartDialog";

export function GlobalDialogs() {
  const { pathname } = useLocation();
  const { activeDialog } = usePrototype();
  if (activeDialog === "binding") return <MobileBindingDialog />;
  if (activeDialog === "chart") return <ChartDialog />;
  if (pathname === "/account/plans") return <PlansDialog />;
  return null;
}
