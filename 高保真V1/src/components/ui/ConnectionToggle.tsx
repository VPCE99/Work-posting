type ConnectionToggleProps = {
  online: boolean;
  onToggle: () => void;
};

export function ConnectionToggle({ online, onToggle }: ConnectionToggleProps) {
  return (
    <button
      type="button"
      className={`connection-toggle ${online ? "connection-toggle--on" : ""}`}
      role="switch"
      aria-checked={online}
      aria-label="联网"
      title={`联网：${online ? "开" : "关"}`}
      onClick={onToggle}
    >
      <svg className="connection-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 0 20" />
        <path d="M12 2a15.3 15.3 0 0 0 0 20" />
      </svg>
      <span className="connection-toggle__label">联网</span>
      <span className="connection-toggle__track" aria-hidden="true"><span className="connection-toggle__thumb" /></span>
    </button>
  );
}
