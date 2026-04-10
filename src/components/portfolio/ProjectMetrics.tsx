import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ProjectMetric, ChartData } from '../../data/mockData';

interface ProjectMetricsProps {
  metrics: ProjectMetric[];
  chartData: ChartData[];
  category: string;
}

export function ProjectMetrics({ metrics, chartData, category }: ProjectMetricsProps) {
  return (
    <div className="space-y-12">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => {
          const diff = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
          const isPositive = diff > 0;
          
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-secondary/50 backdrop-blur-sm border border-border p-6 rounded-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {metric.name}
                </span>
                <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(Math.round(diff))}%
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">{metric.value}</span>
                <span className="text-lg font-bold text-muted-foreground">{metric.unit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Visualization */}
      <div className="bg-secondary/30 border border-border p-8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-lg font-bold mb-1">Impact Visuel</h4>
            <p className="text-sm text-muted-foreground font-medium">Évolution de la performance post-lancement</p>
          </div>
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '1rem',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}