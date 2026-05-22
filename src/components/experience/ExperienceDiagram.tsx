"use client";

import { useEffect, useRef, useState } from "react";
import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";

interface ExperienceDiagramProps {
  diagram: NonNullable<PortfolioExperienceDetail["solutionDiagram"]>;
}

const COLUMN_ORDER = ["client", "gateway", "service", "database", "external", "ai"] as const;
const COLUMN_LABELS: Record<(typeof COLUMN_ORDER)[number], string> = {
  client: "Clients",
  gateway: "Passerelle",
  service: "Services",
  database: "Données",
  external: "Externes",
  ai: "Intelligence",
};

type NodeRect = { x: number; y: number; width: number; height: number };

export function ExperienceDiagram({ diagram }: ExperienceDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [rects, setRects] = useState<Map<string, NodeRect>>(new Map());
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const grouped = COLUMN_ORDER.map((type) => ({
    type,
    nodes: diagram.nodes.filter((node) => node.type === type),
  })).filter((column) => column.nodes.length > 0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerBox = container.getBoundingClientRect();
      const next = new Map<string, NodeRect>();
      nodeRefs.current.forEach((node, id) => {
        const box = node.getBoundingClientRect();
        next.set(id, {
          x: box.left - containerBox.left,
          y: box.top - containerBox.top,
          width: box.width,
          height: box.height,
        });
      });
      setRects(next);
      setSize({ width: containerBox.width, height: containerBox.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [diagram.nodes.length]);

  const registerNode = (id: string) => (node: HTMLElement | null) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  };

  const paths = diagram.connections
    .map((connection, index) => {
      const from = rects.get(connection.from);
      const to = rects.get(connection.to);
      if (!from || !to) return null;
      const startX = from.x + from.width;
      const startY = from.y + from.height / 2;
      const endX = to.x;
      const endY = to.y + to.height / 2;
      const dx = Math.max(40, (endX - startX) / 2);
      const path = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      return {
        id: `${connection.from}-${connection.to}-${index}`,
        path,
        label: connection.label,
        midX,
        midY,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="xp-diagram" ref={containerRef}>
      {size.width > 0 ? (
        <svg
          className="xp-diagram-lines"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          aria-hidden="true">
          <defs>
            <marker
              id="xp-diagram-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent-strong)" />
            </marker>
          </defs>
          {paths.map((entry) => (
            <g key={entry.id}>
              <path d={entry.path} className="xp-diagram-line" markerEnd="url(#xp-diagram-arrow)" />
              {entry.label ? (
                <text
                  x={entry.midX}
                  y={entry.midY - 6}
                  className="xp-diagram-line-label"
                  textAnchor="middle">
                  {entry.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      ) : null}

      <div className="xp-diagram-grid">
        {grouped.map((column) => (
          <div key={column.type} className="xp-diagram-column" data-type={column.type}>
            <p className="xp-diagram-column-label">{COLUMN_LABELS[column.type]}</p>
            <div className="xp-diagram-stack">
              {column.nodes.map((node) => (
                <article
                  key={node.id}
                  ref={registerNode(node.id)}
                  className="xp-diagram-node"
                  data-type={node.type}>
                  <span className="xp-diagram-node-dot" aria-hidden="true" />
                  <strong>{node.label}</strong>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
