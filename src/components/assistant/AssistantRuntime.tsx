"use client";

import { useAssistant } from "@/hooks/useAssistant";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

type AssistantRuntimeProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AssistantRuntime({ isOpen, onClose }: AssistantRuntimeProps) {
  const {
    isOffline,
    isTyping,
    messages,
    quickActions,
    sendMessage,
    resetConversation,
  } = useAssistant();

  return (
    <AssistantPanel
      isOpen={isOpen}
      isOffline={isOffline}
      isTyping={isTyping}
      messages={messages}
      quickActions={quickActions}
      onClose={onClose}
      onReset={resetConversation}
      onSend={sendMessage}
    />
  );
}
