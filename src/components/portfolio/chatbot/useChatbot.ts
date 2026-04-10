import { useState, useCallback, useEffect } from 'react';
import { Message, QuickAction } from './types';
import { processUserMessage } from './chatbotEngine';
import { chatbotApi } from '@/services/api/chatbot.api';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useChatbot() {
  const store = useChatbotStore();
  const chatbotSettings = useSettingsStore((s) => s.chatbot);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(chatbotSettings.quickActions);

  // Sync quick actions when settings change
  useEffect(() => {
    if (chatbotSettings.quickActions.length > 0) {
      setQuickActions(chatbotSettings.quickActions);
    }
  }, [chatbotSettings.quickActions]);

  // Build welcome message from settings
  const buildWelcomeMessage = useCallback((): Message => ({
    id: '1',
    role: 'assistant',
    content: chatbotSettings.welcomeMessage,
    timestamp: new Date(),
    type: 'text',
  }), [chatbotSettings.welcomeMessage]);

  // Initialize on first load (no cached messages)
  useEffect(() => {
    if (store.messages.length > 0) return;

    const init = async () => {
      try {
        const [initialMsg, actions] = await Promise.all([
          chatbotApi.getInitialMessage(),
          chatbotApi.getQuickActions(),
        ]);
        store.setMessages([{ ...initialMsg, timestamp: new Date() }]);
        if (actions?.length) setQuickActions(actions);
        store.setOffline(false);
      } catch {
        store.setMessages([buildWelcomeMessage()]);
        store.setOffline(true);
      }
    };
    init();
  }, []);

  // Keep welcome message in sync with settings changes
  useEffect(() => {
    if (store.messages.length === 0) return;
    const first = store.messages[0];
    if (first.role !== 'assistant' || first.id !== '1') return;
    if (first.content === chatbotSettings.welcomeMessage) return;
    // Replace the welcome message, keep rest of conversation
    store.setMessages([
      buildWelcomeMessage(),
      ...store.messages.slice(1),
    ]);
  }, [chatbotSettings.welcomeMessage]);

  const toggleChat = useCallback(() => {
    store.toggleOpen();
  }, [store]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text',
    };

    store.addMessage(userMessage);
    setIsTyping(true);

    // Build conversation history for the AI
    const history = [...store.messages, userMessage]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-16)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await chatbotApi.sendMessage(content, history);
      store.addMessage({
        id: response.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content || "Desole, j'ai rencontre une erreur.",
        timestamp: new Date(),
        type: response.type || 'text',
        metadata: response.metadata,
      });
      store.setOffline(false);
    } catch {
      // Fallback to local engine
      try {
        const localResponse = await processUserMessage(content);
        store.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: localResponse.content || "Desole, j'ai rencontre une erreur.",
          timestamp: new Date(),
          type: (localResponse.type as Message['type']) || 'text',
          metadata: localResponse.metadata,
        });
        store.setOffline(true);
      } catch {
        store.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Desole, je ne suis pas disponible pour le moment. Contactez-moi par email.",
          timestamp: new Date(),
          type: 'text',
        });
      }
    } finally {
      setIsTyping(false);
    }
  }, [store]);

  const resetChat = useCallback(async () => {
    try {
      const initialMsg = await chatbotApi.getInitialMessage();
      store.setMessages([{ ...initialMsg, timestamp: new Date() }]);
    } catch {
      store.setMessages([buildWelcomeMessage()]);
    }
  }, [store, buildWelcomeMessage]);

  return {
    isOpen: store.isOpen,
    messages: store.messages,
    isTyping,
    isOffline: store.isOffline,
    quickActions,
    toggleChat,
    sendMessage,
    resetChat,
  };
}
