"use client";

import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/portfolio";

export function ExpertiseCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideStep, setSlideStep] = useState(530);
  const [maxTranslate, setMaxTranslate] = useState(0);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    const measure = () => {
      const slide = track.querySelector<HTMLElement>(".expertise-slide");
      const section = track.closest<HTMLElement>(".expertise-carousel-section");
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 24;

      if (slide) {
        const step = slide.offsetWidth + gap;
        const sectionPaddingLeft = section ? Number.parseFloat(getComputedStyle(section).paddingLeft) || 0 : 20;
        const trackPaddingLeft = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const contentWidth = Math.min(window.innerWidth - 40, 1180);
        const lastCardRight =
          sectionPaddingLeft + trackPaddingLeft + services.length * slide.offsetWidth + (services.length - 1) * gap;
        const contentRight = sectionPaddingLeft + contentWidth;

        setSlideStep(step);
        setMaxTranslate(Math.max(0, lastCardRight - contentRight));
      }
    };

    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scroll = (direction: "previous" | "next") => {
    setActiveIndex((current) =>
      direction === "next" ? Math.min(current + 1, services.length - 1) : Math.max(current - 1, 0),
    );
  };

  const currentTranslate = Math.min(activeIndex * slideStep, maxTranslate);
  const canPrevious = currentTranslate > 1;
  const canNext = currentTranslate < maxTranslate - 1;

  return (
    <section id="expertise" className="expertise-carousel-section">
      <div className="expertise-copy">
        <p className="section-kicker">Expertise</p>
        <h2>Des expertises pensées comme des leviers produit.</h2>
        <p>
          Chaque intervention vise un résultat concret: livrer plus vite, clarifier l&apos;architecture, sécuriser les flux
          et réduire la charge opérationnelle.
        </p>
        <div className="carousel-controls" aria-label="Contrôles expertise">
          <button
            type="button"
            onClick={() => scroll("previous")}
            aria-label="Voir l'expertise précédente"
            disabled={!canPrevious}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            aria-label="Voir l'expertise suivante"
            disabled={!canNext}
          >
            ›
          </button>
        </div>
      </div>

      <div
        className="expertise-track"
        ref={trackRef}
        style={{ transform: `translate3d(${-currentTranslate}px, 0, 0)` }}
      >
        {services.map((service) => (
          <article className="expertise-slide" key={service.title}>
            <span>{service.eyebrow}</span>
            <h3>{service.title}</h3>
            <h4>{service.headline}</h4>
            <p>{service.description}</p>
            <div>
              {service.points.map((point) => (
                <small key={point}>{point}</small>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
