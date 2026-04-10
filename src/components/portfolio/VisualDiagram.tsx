import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Globe, 
  Server, 
  Database, 
  Cloud, 
  Cpu, 
  ShieldCheck, 
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { SolutionDiagramData, ImpactData, DiagramNode } from '../../data/cvData';

interface VisualDiagramProps {
  solutionDiagram?: SolutionDiagramData;
  impactGraph?: ImpactData[];
  title?: string;
}

const NodeIcon = ({ type }: { type: DiagramNode['type'] }) => {
  switch (type) {
    case 'client': return <Smartphone className="w-5 h-5" />;
    case 'gateway': return <Globe className="w-5 h-5" />;
    case 'service': return <Server className="w-5 h-5" />;
    case 'database': return <Database className="w-5 h-5" />;
    case 'external': return <Cloud className="w-5 h-5" />;
    case 'ai': return <Sparkles className="w-5 h-5" />;
    default: return <Cpu className="w-5 h-5" />;
  }
};

const SolutionDiagram = ({ data }: { data: SolutionDiagramData }) => {
  // Simple layout logic: group nodes by type to create layers
  const layers = useMemo(() => {
    const l = {
      clients: data.nodes.filter(n => n.type === 'client'),
      middleware: data.nodes.filter(n => ['gateway', 'ai'].includes(n.type)),
      services: data.nodes.filter(n => n.type === 'service'),
      storage: data.nodes.filter(n => ['database', 'external'].includes(n.type))
    };
    return l;
  }, [data]);

  return (
    <div className="relative w-full min-h-[400px] flex flex-col items-center justify-between gap-12 p-8 bg-background/50 rounded-xl border border-border/50 overflow-hidden">
      {/* Background Decorative Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary via-secondary to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Layers */}
      {[layers.clients, layers.middleware, layers.services, layers.storage].map((layer, lIdx) => (
        <div key={lIdx} className="flex flex-wrap justify-center gap-8 md:gap-16 w-full relative z-10">
          {layer.map((node, nIdx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: (lIdx * 0.2) + (nIdx * 0.1) }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5 group-hover:border-primary group-hover:shadow-primary/20 transition-all duration-500 relative z-20">
                  <NodeIcon type={node.type} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-center max-w-[100px]">{node.label}</span>
              </div>

              {/* Connecting lines - simplistic SVG logic for visualization */}
              {lIdx < 3 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-primary/50 to-transparent pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

const ImpactRadar = ({ data }: { data: ImpactData[] }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return { x, y };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col md:flex-row items-center gap-12 p-8 bg-background/50 rounded-xl border border-border/50">
      <div className="relative w-[300px] h-[300px]">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid Circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * step}
              fill="none"
              stroke="currentColor"
              className="text-border/30"
              strokeDasharray="4 4"
            />
          ))}

          {/* Grid Axes */}
          {data.map((_, i) => {
            const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
            const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-border/30"
              />
            );
          })}

          {/* Impact Shape */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            points={polygonPath}
            fill="rgba(var(--primary-rgb), 0.2)"
            stroke="rgb(var(--primary))"
            strokeWidth="2"
            className="fill-primary/20 stroke-primary"
          />

          {/* Points & Labels */}
          {data.map((d, i) => {
            const x = center + (radius + 25) * Math.cos(i * angleStep - Math.PI / 2);
            const y = center + (radius + 25) * Math.sin(i * angleStep - Math.PI / 2);
            return (
              <g key={i}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-[10px] font-black uppercase tracking-tighter fill-muted-foreground"
                >
                  {d.label}
                </text>
                <circle
                  cx={points[i].x}
                  cy={points[i].y}
                  r="4"
                  className="fill-primary"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-6 w-full">
        {data.map((d, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
              <span>{d.label}</span>
              <span className="text-primary">{d.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${d.value}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function VisualDiagram({ solutionDiagram, impactGraph, title }: VisualDiagramProps) {
  return (
    <div className="space-y-24">
      {solutionDiagram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary">Architecture Solution</h3>
          </div>
          <SolutionDiagram data={solutionDiagram} />
        </motion.div>
      )}

      {impactGraph && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary">Impact Visuel & Performance</h3>
          </div>
          <ImpactRadar data={impactGraph} />
        </motion.div>
      )}
    </div>
  );
}