import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  trend?: {
    value: number;
    label?: string;
  };
  delay?: number;
}

export function StatsCard({ label, value, icon: Icon, color = 'text-primary', trend, delay = 0 }: StatsCardProps) {
  const displayValue = typeof value === 'object' ? '0' : String(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.3, ease: 'easeOut' }}
      className="group relative bg-card/85 rounded-xl border border-border/70 p-5 shadow-sm backdrop-blur-xl hover:border-primary/35 hover:shadow-[0_18px_50px_var(--admin-shadow)] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-secondary border border-border/50', color)}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {trend && (
          <span className={cn(
            'text-[11px] font-semibold px-2 py-0.5 rounded-md',
            trend.value > 0
              ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
              : trend.value < 0
                ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-foreground tracking-tight">
        {displayValue}
      </p>
    </motion.div>
  );
}
