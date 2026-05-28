import type { AppLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

interface RadarPoint {
  label: string;
  value: number;
}

interface ExperienceRadarProps {
  points: RadarPoint[];
  locale: AppLocale;
}

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 130;
const LEVELS = 4;

function polarToCartesian(angle: number, radius: number) {
  const x = CENTER + radius * Math.cos(angle);
  const y = CENTER + radius * Math.sin(angle);
  return { x, y };
}

/**
 * Diagramme de Kiviat (radar chart) — affiche plusieurs axes d'impact
 * sur un polygone radial. Rendu SVG pur, sans dépendance.
 */
export async function ExperienceRadar({ points, locale }: ExperienceRadarProps) {
  const t = await getTranslations({ locale, namespace: "ExperienceRadar" });
  if (points.length < 3) {
    return (
      <div className="experience-radar-fallback">
        {t("fallbackMessage")}
      </div>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value), 100);
  const angleStep = (Math.PI * 2) / points.length;
  const startAngle = -Math.PI / 2;

  const axes = points.map((point, index) => {
    const angle = startAngle + index * angleStep;
    const tip = polarToCartesian(angle, RADIUS);
    const labelAnchor = polarToCartesian(angle, RADIUS + 32);
    const valueRadius = (point.value / maxValue) * RADIUS;
    const valuePoint = polarToCartesian(angle, valueRadius);
    return {
      label: point.label,
      value: point.value,
      angle,
      tip,
      labelAnchor,
      valuePoint,
    };
  });

  const polygonPoints = axes
    .map((axis) => `${axis.valuePoint.x},${axis.valuePoint.y}`)
    .join(" ");

  const gridLevels = Array.from({ length: LEVELS }, (_, i) => {
    const ratio = (i + 1) / LEVELS;
    return axes
      .map((axis) => {
        const point = polarToCartesian(axis.angle, RADIUS * ratio);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  });

  return (
    <div className="experience-radar">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={t("chartAriaLabel")}>
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-strong)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--accent-strong)" stopOpacity="0.06" />
          </radialGradient>
        </defs>

        {gridLevels.map((levelPoints, index) => (
          <polygon
            key={`grid-${index}`}
            points={levelPoints}
            className="experience-radar-grid"
          />
        ))}

        {axes.map((axis) => (
          <line
            key={`axis-${axis.label}`}
            x1={CENTER}
            y1={CENTER}
            x2={axis.tip.x}
            y2={axis.tip.y}
            className="experience-radar-axis"
          />
        ))}

        <polygon
          points={polygonPoints}
          className="experience-radar-shape"
          fill="url(#radar-fill)"
        />

        {axes.map((axis) => (
          <circle
            key={`dot-${axis.label}`}
            cx={axis.valuePoint.x}
            cy={axis.valuePoint.y}
            r="4.5"
            className="experience-radar-dot"
          />
        ))}

        {axes.map((axis) => (
          <text
            key={`label-${axis.label}`}
            x={axis.labelAnchor.x}
            y={axis.labelAnchor.y}
            className="experience-radar-label"
            textAnchor="middle"
            dominantBaseline="middle">
            {axis.label}
          </text>
        ))}
      </svg>

      <ul className="experience-radar-legend">
        {axes.map((axis) => (
          <li key={axis.label}>
            <span className="experience-radar-legend-label">{axis.label}</span>
            <strong>{axis.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
