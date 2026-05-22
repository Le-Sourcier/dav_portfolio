"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AppLocale } from "@/i18n/config";
import type { PortfolioTestimonialItem } from "@/services/portfolio/contentLoaders";

interface TestimonialsCarouselProps {
  testimonials: PortfolioTestimonialItem[];
  locale: AppLocale;
}

const COPY = {
  fr: {
    kicker: "Témoignages",
    title: "Une collaboration pensée pour la clarté et l'exécution.",
    lead: "Des retours bruts de partenaires et clients qui ont vu la mission passer du cadrage à la livraison.",
    previous: "Voir le témoignage précédent",
    next: "Voir le témoignage suivant",
    ratingLabel: (filled: number) => `Note: ${filled} sur 5`,
  },
  en: {
    kicker: "Testimonials",
    title: "Collaboration built for clarity and execution.",
    lead: "Honest feedback from clients and partners who saw the work move from scoping to delivery.",
    previous: "Show previous testimonial",
    next: "Show next testimonial",
    ratingLabel: (filled: number) => `Rating: ${filled} of 5`,
  },
} as const;

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function TestimonialsCarousel({ testimonials, locale }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideStep, setSlideStep] = useState(530);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const copy = COPY[locale] ?? COPY.fr;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const slides = track.querySelectorAll<HTMLElement>(".testimonials-slide");
      const section = track.closest<HTMLElement>(".testimonials-carousel-section");
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 24;

      if (slides.length > 0) {
        const firstSlide = slides[0];
        const step = firstSlide.offsetWidth + gap;
        const sectionPaddingLeft = section
          ? Number.parseFloat(getComputedStyle(section).paddingLeft) || 0
          : 20;
        const trackPaddingLeft = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const contentWidth = Math.min(window.innerWidth - 40, 1180);
        const slidesWidth = Array.from(slides).reduce(
          (total, node) => total + node.offsetWidth,
          0,
        );
        const lastCardRight =
          sectionPaddingLeft +
          trackPaddingLeft +
          slidesWidth +
          Math.max(0, slides.length - 1) * gap;
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
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const scroll = (direction: "previous" | "next") => {
    setActiveIndex((current) =>
      direction === "next"
        ? Math.min(current + 1, testimonials.length - 1)
        : Math.max(current - 1, 0),
    );
  };

  const currentTranslate = Math.min(activeIndex * slideStep, maxTranslate);
  const canPrevious = currentTranslate > 1;
  const canNext = currentTranslate < maxTranslate - 1;

  return (
    <section className="testimonials-carousel-section">
      <div className="testimonials-copy">
        <p className="section-kicker">{copy.kicker}</p>
        <h2>{copy.title}</h2>
        <p>{copy.lead}</p>
        <div className="carousel-controls" aria-label={copy.kicker}>
          <button
            type="button"
            onClick={() => scroll("previous")}
            aria-label={copy.previous}
            disabled={!canPrevious}>
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            aria-label={copy.next}
            disabled={!canNext}>
            ›
          </button>
        </div>
      </div>

      <div
        className="testimonials-track"
        ref={trackRef}
        style={{ transform: `translate3d(${-currentTranslate}px, 0, 0)` }}>
        {testimonials.map((testimonial) => {
          const filledStars = Math.round(testimonial.rating ?? 0);
          const initials = getInitials(testimonial.name);
          const subtitle = [testimonial.role, testimonial.company]
            .filter(Boolean)
            .join(" · ");
          const dateLabel = testimonial.createdAt
            ? dateFormatter.format(new Date(testimonial.createdAt))
            : null;

          return (
            <article className="testimonials-slide" key={testimonial.id}>
              <div className="testimonials-slide-header">
                <div
                  className={`testimonial-avatar${testimonial.avatar ? " has-image" : ""}`}
                  aria-hidden="true">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt="" loading="lazy" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="testimonials-slide-identity">
                  <strong>{testimonial.name}</strong>
                  {subtitle ? <span>{subtitle}</span> : null}
                </div>
              </div>
              {testimonial.rating ? (
                <div
                  className="testimonial-rating"
                  aria-label={copy.ratingLabel(filledStars)}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className={index < filledStars ? "is-filled" : ""}
                      aria-hidden="true">
                      ★
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="testimonials-slide-quote">“{testimonial.quote}”</p>
              {dateLabel ? (
                <time className="testimonial-date" dateTime={testimonial.createdAt}>
                  {dateLabel}
                </time>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
