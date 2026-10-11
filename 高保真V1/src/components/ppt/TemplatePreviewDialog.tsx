import { useEffect, useState } from "react";
import type { PptTemplate, TemplatePreviewSlide } from "../../types";
import { Modal } from "../ui/Modal";

function PreviewSlideView({ slide, templateName }: { slide: TemplatePreviewSlide; templateName: string }) {
  if (slide.imageUrl) {
    return (
      <div className="template-preview-slide template-preview-slide--image">
        <img src={slide.imageUrl} alt={`${templateName} · ${slide.title}`} />
      </div>
    );
  }

  return (
    <div className={`template-preview-slide template-preview-slide--${slide.kind}`} data-kind={slide.kind}>
      <div className="template-preview-slide__chrome" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {slide.eyebrow && <p className="template-preview-slide__eyebrow">{slide.eyebrow}</p>}
      <h3>{slide.title}</h3>
      {slide.body && <p className="template-preview-slide__body">{slide.body}</p>}
      {slide.kind === "chart" && (
        <div className="template-preview-slide__chart" aria-hidden="true">
          <i style={{ height: "42%" }} />
          <i style={{ height: "68%" }} />
          <i style={{ height: "54%" }} />
          <i style={{ height: "86%" }} />
          <i style={{ height: "62%" }} />
        </div>
      )}
      {slide.kind === "content" && (
        <ul className="template-preview-slide__bullets" aria-hidden="true">
          <li />
          <li />
          <li />
        </ul>
      )}
    </div>
  );
}

export function TemplatePreviewDialog({
  template,
  onClose,
}: {
  template: PptTemplate;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const slides = template.slides;
  const current = slides[index] ?? slides[0];
  const pageLabel = `${index + 1} / ${slides.length}`;

  useEffect(() => {
    setIndex(0);
  }, [template.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((value) => Math.max(0, value - 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((value) => Math.min(slides.length - 1, value + 1));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  if (!current) return null;

  return (
    <Modal
      title={`预览 · ${template.name}`}
      size="xl"
      variant="template-preview"
      onClose={onClose}
      footer={(
        <>
          <span className="template-preview-dialog__page">{pageLabel}</span>
          <button className="button" onClick={onClose}>关闭预览</button>
        </>
      )}
    >
      <div className="template-preview-dialog">
        <header className="template-preview-dialog__meta">
          <div>
            <strong>{template.name}</strong>
            <small>
              {template.source === "official" ? "官方模板" : "我的模板"} · {template.category} · {template.ratio} · 共 {slides.length} 页
            </small>
          </div>
          <div className="template-preview-dialog__nav">
            <button
              type="button"
              className="button button--small"
              disabled={index <= 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
            >
              上一页
            </button>
            <button
              type="button"
              className="button button--small"
              disabled={index >= slides.length - 1}
              onClick={() => setIndex((value) => Math.min(slides.length - 1, value + 1))}
            >
              下一页
            </button>
          </div>
        </header>

        <div className="template-preview-dialog__stage" aria-live="polite">
          <PreviewSlideView slide={current} templateName={template.name} />
        </div>

        <div className="template-preview-dialog__thumbs" role="tablist" aria-label="预览页缩略图">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              className={slideIndex === index ? "template-preview-thumb template-preview-thumb--active" : "template-preview-thumb"}
              onClick={() => setIndex(slideIndex)}
            >
              <span className="template-preview-thumb__frame">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" />
                ) : (
                  <span className={`template-preview-thumb__mock template-preview-thumb__mock--${slide.kind}`} />
                )}
              </span>
              <small>{slideIndex + 1}. {slide.title}</small>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
