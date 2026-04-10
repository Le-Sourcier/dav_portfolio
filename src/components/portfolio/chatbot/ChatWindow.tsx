import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, ShieldCheck, WifiOff } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { Message, QuickAction } from './types';
import { ScrollArea } from '../../ui/scroll-area';
import { cn } from '../../../lib/utils';
import { envConfig } from '@/config/env';
import { useTranslation } from 'react-i18next';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  isOffline?: boolean;
  quickActions?: QuickAction[];
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onReset: () => void;
}

const AI_AVATAR = envConfig.chatbot.avatar;

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isTyping,
  isOffline = false,
  quickActions,
  onClose,
  onSendMessage,
  onReset,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed z-[120] flex flex-col overflow-hidden",
        "bg-card/95 backdrop-blur-2xl border border-border/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)]",
        // Mobile: fullscreen with safe area
        "inset-0 sm:inset-auto",
        // Desktop: positioned bottom-right, capped to viewport
        "sm:bottom-6 md:bottom-8",
        "sm:right-6 md:right-12",
        "sm:w-[400px] md:w-[440px] lg:w-[480px]",
        "sm:h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)]",
        "rounded-none sm:rounded-xl"
      )}
    >
      {/* Header */}
      <div className="shrink-0 p-4 sm:p-5 md:p-6 border-b border-border/50 flex items-center justify-between bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 border-primary/20 bg-primary/10">
              <img src={AI_AVATAR} alt={t('chatbot.assistant')} className="w-full h-full object-cover" />
            </div>
            <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 border-4 border-card rounded-full",
                isOffline ? "bg-orange-400" : "bg-green-500"
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm md:text-base tracking-tight">{t('chatbot.assistant')}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
                {isOffline ? (
                  <span className="text-[10px] md:text-[11px] text-orange-400 font-medium flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> {t('chatbot.offline')}
                  </span>
                ) : (
                  <span className="text-[10px] md:text-[11px] text-muted-foreground font-medium">
                    {t('chatbot.online')}
                  </span>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onReset} className="p-2 md:p-2.5 rounded-full hover:bg-secondary/80 transition-all text-muted-foreground active:scale-90" title={t('chatbot.newConversation')}>
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 md:p-2.5 rounded-full hover:bg-secondary/80 transition-all text-muted-foreground active:scale-90">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 px-4 py-4 md:py-6">
        <div className="space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-primary/20">
                <img src={AI_AVATAR} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="bg-secondary/50 px-4 py-3 rounded-xl rounded-tl-none border border-border/50">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 p-4 bg-gradient-to-t from-background via-background to-transparent space-y-3 md:space-y-4">
        <QuickActions quickActions={quickActions} onAction={onSendMessage} />
        <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>
    </motion.div>
  );
};
