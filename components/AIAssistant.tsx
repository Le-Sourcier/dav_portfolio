
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PortfolioData } from '../types/index';

interface AIAssistantProps {
  data: PortfolioData;
}

/**
 * Fonction utilitaire pour parser le texte et extraire les gras et les liens
 */
const parseLineContent = (text: string) => {
  // Regex pour détecter les liens Markdown: [texte](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Ajouter le texte avant le lien (avec gestion des gras)
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText) {
      parts.push(...parseBoldText(beforeText));
    }

    // Ajouter le lien stylisé
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a 
        key={`link-${match.index}`} 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 underline hover:text-blue-400 font-bold inline-flex items-center gap-0.5"
      >
        {linkText}
        <ExternalLink className="w-2.5 h-2.5" />
      </a>
    );

    lastIndex = linkRegex.lastIndex;
  }

  // Ajouter le reste du texte après le dernier lien
  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    parts.push(...parseBoldText(remainingText));
  }

  return parts;
};

/**
 * Fonction utilitaire pour parser les textes en gras
 */
const parseBoldText = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Texte normal
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Texte en gras
    parts.push(
      <strong key={`bold-${match.index}`} className="font-black text-blue-600 dark:text-blue-400">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

/**
 * Composant pour formater proprement le Markdown retourné par l'IA
 */
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={i} className="h-1" />;

        // Détection de liste numérotée ou à puces
        const listMatch = trimmedLine.match(/^(\d+\.|\*|-)\s+(.*)/);
        
        if (listMatch) {
          return (
            <div key={i} className="pl-5 relative flex items-start gap-2">
              <span className="text-blue-500 font-black shrink-0 text-[10px] mt-0.5">
                {listMatch[1].includes('.') ? listMatch[1] : '•'}
              </span>
              <p className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300">
                {parseLineContent(listMatch[2])}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300">
            {parseLineContent(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: `Bonjour ! Je suis **Logan AI**, l'assistant virtuel de David. Comment puis-je vous aider aujourd'hui ?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tu es Logan AI, l'assistant personnel de Yao David Logan. 
        Données : ${JSON.stringify(data)}.
        
        RÈGLES DE RÉPONSE :
        1. Utilise du Markdown standard : **gras** pour emphase, [texte](url) pour TOUS les liens (LinkedIn, GitHub, Email mailto:, Portfolio).
        2. Formate tes listes de contact clairement avec des liens cliquables.
        3. Sois professionnel, précis et chaleureux.
        4. Ne réponds qu'à propos de David.
        
        Question : ${userMsg}`,
      });

      const aiText = response.text || "Désolé, j'ai rencontré une petite erreur technique.";
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Désolé, mes serveurs sont un peu occupés. Réessayez dans un instant !" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all group border-4 border-white dark:border-[#030712]"
        >
          <Bot className="w-7 h-7" />
          <div className="absolute bottom-full right-0 mb-4 bg-white dark:bg-[#1e293b] px-4 py-2 rounded-2xl text-[10px] font-black text-blue-600 dark:text-blue-400 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-blue-500/10 uppercase tracking-widest">
             Une question sur David ?
          </div>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] bg-white dark:bg-[#0f172a] rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-5 bg-blue-600 text-white flex justify-between items-center shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Logan AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-blue-100 font-bold">Expert Personnel</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 dark:bg-transparent">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20 shadow-lg text-xs font-medium' 
                    : 'bg-white dark:bg-white/5 dark:text-gray-300 border border-black/5 dark:border-white/5 rounded-tl-none shadow-sm'
                }`}>
                  {m.role === 'user' ? m.content : <FormattedMessage content={m.content} />}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-5 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0f172a] flex gap-3 shrink-0">
            <input 
              type="text" 
              placeholder="Ex: David maîtrise-t-il Kubernetes ?" 
              className="flex-1 bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 ring-blue-500/20 transition-all dark:text-white placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim()} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
