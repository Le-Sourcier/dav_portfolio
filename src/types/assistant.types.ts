/**
 * Types du chatbot assistant — alignés sur le backend chatbot.service.ts
 * (cf. ChatMessage / MessageType dans backend/src/types/entities.types.ts).
 */

export type AssistantMessageRole = "user" | "assistant";

export type AssistantMessageType =
  | "text"
  | "project_link"
  | "experience_link"
  | "blog_link"
  | "contact_form"
  | "appointment_picker";

export interface AssistantBlogPostRef {
  id: string;
  title: string;
  slug?: string;
}

export interface AssistantMessageMetadata {
  projectId?: string;
  projectTitle?: string;
  experienceId?: string;
  experienceTitle?: string;
  posts?: AssistantBlogPostRef[];
  availableTimes?: string[];
  date?: string;
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  type: AssistantMessageType;
  timestamp: string;
  metadata?: AssistantMessageMetadata;
  /** Texte effectivement affiché (utilisé pour le streaming caractère par caractère). */
  displayContent?: string;
  /** Vrai pendant le streaming, faux quand displayContent === content. */
  isStreaming?: boolean;
}

export interface AssistantQuickAction {
  id: string;
  label: string;
  prompt: string;
}

export interface AssistantHistoryEntry {
  role: AssistantMessageRole;
  content: string;
}
