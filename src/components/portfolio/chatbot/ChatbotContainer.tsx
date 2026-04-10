import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';
import { useChatbot } from './useChatbot';
import { ChatWindow } from './ChatWindow';
import { cn } from '../../../lib/utils';
import { hasConsented } from '@/hooks/useCookieConsent';
import { useSettingsStore } from '@/stores/settingsStore';
import { envConfig } from '@/config/env';

export const ChatbotContainer: React.FC = () => {
  const chatbotEnabled = useSettingsStore((s) => s.chatbot.enabled);
  const isEnabled = envConfig.features.chatbot && chatbotEnabled;

  const {
    isOpen,
    messages,
    isTyping,
    isOffline,
    quickActions,
    toggleChat,
    sendMessage,
    resetChat,
  } = useChatbot();

  if (!isEnabled || !hasConsented()) return null;

  return (
    <>
      {/* Floating Trigger Button - hidden on mobile when chat is open */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 md:right-12 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center z-[110] shadow-2xl group overflow-hidden",
          isOpen
            ? "bg-background border border-border text-foreground hidden sm:flex"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute -top-1 -right-1 z-20">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && messages.length > 1 && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 w-3 h-3 bg-red-500 border-2 border-background rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            isOffline={isOffline}
            quickActions={quickActions}
            onClose={toggleChat}
            onSendMessage={sendMessage}
            onReset={resetChat}
          />
        )}
      </AnimatePresence>
    </>
  );
};
