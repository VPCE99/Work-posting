export function TemplateCover({
  ratio,
  label,
  coverUrl,
  alt,
}: {
  ratio: string;
  label: string;
  coverUrl?: string;
  alt: string;
}) {
  if (coverUrl) {
    return (
      <div className="template-library-card__preview template-library-card__preview--cover">
        <img src={coverUrl} alt={alt} />
      </div>
    );
  }
  return (
    <div className="template-library-card__preview">
      <span>{ratio}</span>
      <strong>{label}</strong>
    </div>
  );
}
