import { usePrototype } from "../../app/PrototypeContext";
import { MobileBindingDialog } from "../account/MobileBindingDialog";
import { PlansDialog } from "../account/PlansDialog";
import { ChartDialog } from "../chart/ChartDialog";

export function GlobalDialogs() {
  const { activeDialog } = usePrototype();
  if (activeDialog === "plans") return <PlansDialog />;
  if (activeDialog === "binding") return <MobileBindingDialog />;
  if (activeDialog === "chart") return <ChartDialog />;
  return null;
}
