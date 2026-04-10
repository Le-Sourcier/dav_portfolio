import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Message, QuickAction } from './types';
import { processUserMessage } from './chatbotEngine';
import { chatbotApi } from '@/services/api/chatbot.api';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useChatbot() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';
  const store = useChatbotStore();
  const chatbotSettings = useSettingsStore((s) => s.chatbot);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(
    chatbotSettings.quickActions.map((a) => ({
      id: a.id,
      label: lang === 'en' && a.label_en ? a.label_en : a.label,
      label_en: a.label_en,
      prompt: lang === 'en' && a.prompt_en ? a.prompt_en : a.prompt,
      prompt_en: a.prompt_en,
    }))
  );

  // Sync quick actions when settings or language change
  useEffect(() => {
    if (chatbotSettings.quickActions.length > 0) {
      setQuickActions(
        chatbotSettings.quickActions.map((a) => ({
          id: a.id,
          label: lang === 'en' && a.label_en ? a.label_en : a.label,
          label_en: a.label_en,
          prompt: lang === 'en' && a.prompt_en ? a.prompt_en : a.prompt,
          prompt_en: a.prompt_en,
        }))
      );
    }
  }, [chatbotSettings.quickActions, lang]);

  // Build welcome message from settings (bilingual)
  const buildWelcomeMessage = useCallback((): Message => ({
    id: '1',
    role: 'assistant',
    content: lang === 'en' && chatbotSettings.welcomeMessage_en ? chatbotSettings.welcomeMessage_en : chatbotSettings.welcomeMessage,
    timestamp: new Date(),
    type: 'text',
  }), [chatbotSettings.welcomeMessage, chatbotSettings.welcomeMessage_en, lang]);

  // Initialize on first load (no cached messages)
  useEffect(() => {
    if (store.messages.length > 0) return;

    const init = async () => {
      try {
        const [initialMsg, actions] = await Promise.all([
          chatbotApi.getInitialMessage(lang),
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
    const currentWelcome = lang === 'en' && chatbotSettings.welcomeMessage_en ? chatbotSettings.welcomeMessage_en : chatbotSettings.welcomeMessage;
    if (first.content === currentWelcome) return;
    // Replace the welcome message, keep rest of conversation
    store.setMessages([
      buildWelcomeMessage(),
      ...store.messages.slice(1),
    ]);
  }, [chatbotSettings.welcomeMessage, chatbotSettings.welcomeMessage_en, lang]);

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
      const response = await chatbotApi.sendMessage(content, history, lang);
      store.addMessage({
        id: response.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content || t('chatbot.errorMessage'),
        timestamp: new Date(),
        type: response.type || 'text',
        metadata: response.metadata,
      });
      store.setOffline(false);
    } catch {
      // Fallback to local engine
      try {
        const localResponse = await processUserMessage(content, lang);
        store.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: localResponse.content || t('chatbot.errorMessage'),
          timestamp: new Date(),
          type: (localResponse.type as Message['type']) || 'text',
          metadata: localResponse.metadata,
        });
        store.setOffline(true);
      } catch {
        store.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('chatbot.notAvailable'),
          timestamp: new Date(),
          type: 'text',
        });
      }
    } finally {
      setIsTyping(false);
    }
  }, [store, t]);

  const resetChat = useCallback(async () => {
    try {
      const initialMsg = await chatbotApi.getInitialMessage(lang);
      store.setMessages([{ ...initialMsg, timestamp: new Date() }]);
    } catch {
      store.setMessages([buildWelcomeMessage()]);
    }
  }, [store, buildWelcomeMessage, lang]);

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
