import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Calendar, BookOpen, User, Mail } from 'lucide-react';
import type { QuickAction } from './types';

const ICON_MAP: Record<string, React.ElementType> = {
  'Mes Projets': Briefcase,
  'Rendez-vous': Calendar,
  'Mon Profil': User,
  'Competences': Sparkles,
  'Lire le Blog': BookOpen,
  'Contact': Mail,
};

const DEFAULT_ICON = Sparkles;

interface QuickActionsProps {
  quickActions?: QuickAction[];
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ quickActions, onAction }) => {
  const actions = quickActions?.length ? quickActions : [
    { id: '1', label: 'Mes Projets', prompt: 'Mes Projets' },
    { id: '2', label: 'Rendez-vous', prompt: 'Rendez-vous' },
    { id: '3', label: 'Mon Profil', prompt: 'Mon Profil' },
    { id: '4', label: 'Competences', prompt: 'Competences' },
    { id: '5', label: 'Lire le Blog', prompt: 'Lire le Blog' },
    { id: '6', label: 'Contact', prompt: 'Contact' },
  ];

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
        {actions.map((action, i) => {
          const Icon = ICON_MAP[action.label] || DEFAULT_ICON;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAction(action.prompt || action.label)}
              className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/20 hover:bg-primary/10 hover:border-primary/30 transition-all text-[11px] font-semibold tracking-tight text-muted-foreground hover:text-primary active:scale-95 group shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-105" />
              {action.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
