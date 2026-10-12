import type { PlanConfirmation } from "./planConfirmation";

type PlanConfirmationCardProps = {
  confirmation: PlanConfirmation;
  selectedId: string | null;
  resolved?: boolean;
  onSelect?: (optionId: string) => void;
  onConfirm?: () => void;
};

export function PlanConfirmationCard({
  confirmation,
  selectedId,
  resolved = false,
  onSelect,
  onConfirm,
}: PlanConfirmationCardProps) {
  if (resolved) {
    const selected = confirmation.options.find((option) => option.id === selectedId);
    return (
      <section className="plan-confirmation plan-confirmation--resolved" aria-label="计划确认">
        <p className="plan-confirmation__summary">
          <span>{confirmation.question}</span>
          <strong>{selected?.label}</strong>
        </p>
      </section>
    );
  }

  return (
    <section className="plan-confirmation" aria-label="计划确认">
      <h3 className="plan-confirmation__question">{confirmation.question}</h3>
      <div className="plan-confirmation__options" role="radiogroup" aria-label={confirmation.question}>
        {confirmation.options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`plan-confirmation__option${selected ? " plan-confirmation__option--selected" : ""}`}
              onClick={() => onSelect?.(option.id)}
            >
              <span className="plan-confirmation__radio" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="plan-confirmation__footer">
        <button type="button" className="button button--primary button--small" disabled={!selectedId} onClick={onConfirm}>
          确认
        </button>
      </div>
    </section>
  );
}
