const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusableElements(root: ParentNode) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => {
    if (element.closest("[inert]")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    return element.getClientRects().length > 0;
  });
}

export function inertOutside(boundary: HTMLElement) {
  const restored: HTMLElement[] = [];
  let node: HTMLElement | null = boundary;
  while (node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || sibling.hasAttribute("inert") || sibling.classList.contains("form-select__menu")) continue;
      sibling.setAttribute("inert", "");
      sibling.setAttribute("data-focus-inert", "");
      restored.push(sibling as HTMLElement);
    }
    if (node.parentElement === document.body || node.parentElement.id === "root") break;
    node = node.parentElement;
  }
  return () => {
    restored.forEach((element) => {
      element.removeAttribute("inert");
      element.removeAttribute("data-focus-inert");
    });
  };
}

export function trapTab(event: KeyboardEvent, root: HTMLElement) {
  if (event.key !== "Tab") return;
  const items = focusableElements(root);
  if (!items.length) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !root.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}
