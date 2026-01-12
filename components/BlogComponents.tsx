
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Hash, Search, X, ChevronRight, 
  ArrowLeft, RefreshCw, Loader2, Sparkles, 
  MessageSquare, User, Send, Copy, CheckCircle2,
  FileCode, Volume2, Square, Play, Pause, Share2,
  Twitter, Linkedin as LinkedinIcon, PlayCircle
} from 'lucide-react';
import { BlogPost, Comment } from '../types/index';
import { highlightCode } from '../utils/highlight';
import { GoogleGenAI, Modality } from "@google/genai";

// --- Utilitaires de décodage Audio pour Gemini TTS ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Helper pour parser le gras (**) dans le texte
 */
const parseInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

/**
 * Composant pour transformer une section de texte Markdown en HTML stylisé
 */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-8 space-y-3 text-gray-600 dark:text-gray-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Titres
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white tracking-tight uppercase">{parseInlineMarkdown(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={index} className="text-3xl font-black mt-16 mb-8 text-gray-900 dark:text-white tracking-tighter uppercase border-l-4 border-blue-600 pl-6">{parseInlineMarkdown(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={index} className="text-4xl font-black mt-20 mb-10 text-gray-900 dark:text-white tracking-tighter uppercase">{parseInlineMarkdown(trimmed.slice(2))}</h1>);
    } 
    // Média : Image ![Alt](URL)
    else if (trimmed.startsWith('![') && trimmed.includes('](')) {
      flushList();
      const alt = trimmed.match(/!\[(.*?)\]/)?.[1] || "";
      const url = trimmed.match(/\((.*?)\)/)?.[1] || "";
      elements.push(
        <figure key={index} className="my-10">
          <img src={url} alt={alt} className="w-full rounded-[32px] border border-black/5 dark:border-white/10 shadow-lg object-cover" />
          {alt && <figcaption className="text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">{alt}</figcaption>}
        </figure>
      );
    }
    // Média : Vidéo [video](URL) ou YouTube embed
    else if (trimmed.startsWith('[video]') || (trimmed.startsWith('[') && trimmed.includes('](video)')) || (trimmed.startsWith('[video]('))) {
      flushList();
      const url = trimmed.match(/\((.*?)\)/)?.[1] || "";
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      if (isYouTube) {
        const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
        elements.push(
          <div key={index} className="my-10 aspect-video rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        );
      } else {
        elements.push(
          <div key={index} className="my-10 aspect-video rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg bg-black flex items-center justify-center">
            <video controls className="w-full h-full">
              <source src={url} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        );
      }
    }
    // Listes
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(<li key={index} className="leading-relaxed font-medium">{parseInlineMarkdown(trimmed.slice(2))}</li>);
    }
    // Paragraphes ou lignes vides
    else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={index} className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-8 font-medium">{parseInlineMarkdown(trimmed)}</p>);
    }
  });

  flushList();
  return <div className="markdown-body">{elements}</div>;
};

// ----------------------------------------------------

/**
 * Composant de bloc de code style VSCode
 */
export const CodeBlock: React.FC<{ code: string, language?: string }> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="relative my-10 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/5 shadow-2xl group ring-1 ring-white/5">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-black/20">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 font-mono">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>index.{language === 'typescript' ? 'ts' : language}</span>
          </div>
        </div>
        <button 
          onClick={handleCopy} 
          className={`p-1.5 rounded-md transition-all ${copied ? 'text-green-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          title="Copier le code"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex font-mono text-sm leading-6 overflow-x-auto custom-vscode-scrollbar">
        <div className="w-10 pt-4 pb-4 flex flex-col items-center text-gray-600 select-none bg-[#1e1e1e] border-r border-white/5">
          {lines.map((_, i) => (
            <div key={i} className="h-6 text-[12px]">{i + 1}</div>
          ))}
        </div>
        <div className="flex-1 p-4 pt-4 pb-4">
          <pre className="text-[#d4d4d4]">
            <code dangerouslySetInnerHTML={{ __html: highlightCode(code.trim()) }} />
          </pre>
        </div>
      </div>
    </div>
  );
};

export const BlogList: React.FC<{ blogs: BlogPost[], onPostClick: (post: BlogPost) => void }> = ({ blogs, onPostClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlogs = blogs.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    return post.title.toLowerCase().includes(query) || 
           post.category.toLowerCase().includes(query) || 
           post.tags.some(tag => tag.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase dark:text-white text-gray-900 tracking-tight">Journal Technique</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl italic">Pensées sur le développement et l'architecture.</p>
        </div>
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" placeholder="Rechercher..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map(post => (
          <article 
            key={post.id} 
            onClick={() => onPostClick(post)}
            className="group cursor-pointer bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all shadow-sm"
          >
            <div className="aspect-video overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white text-gray-900 group-hover:text-blue-500 transition-colors">{post.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-1 text-blue-500 text-xs font-bold uppercase tracking-widest">
                Lire la suite <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const BlogDetail: React.FC<{ 
  post: BlogPost, 
  allBlogs: BlogPost[],
  onBack: () => void, 
  onPostClick: (post: BlogPost) => void,
  comments: Comment[], 
  onAddComment: (comment: Omit<Comment, 'id' | 'date'>) => void 
}> = ({ post, allBlogs, onBack, onPostClick, comments, onAddComment }) => {
  const [displayedImage, setDisplayedImage] = useState(post.image);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Audio States
  const [isReading, setIsReading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  useEffect(() => {
    setDisplayedImage(post.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => stopReading();
  }, [post]);

  const stopReading = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleToggleRead = async () => {
    if (isReading) {
      stopReading();
      return;
    }

    try {
      setIsLoadingAudio(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const cleanContent = post.content.replace(/```[\s\S]*?```/g, ' [bloc de code technique omis] ').replace(/[#*]/g, '');
      const textToRead = `Voici un article intitulé ${post.title}. Introduction : ${post.excerpt}. Contenu : ${cleanContent}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Lisez cet article de manière calme et professionnelle : ${textToRead}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const bytes = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsReading(false);
        
        audioSourceRef.current = source;
        source.start(0);
        setIsReading(true);
      }
    } catch (err) {
      console.error("Erreur TTS:", err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleGenerateAIImage = async () => {
    try {
      setIsGenerating(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Professional tech illustration for: ${post.title}` }] },
      });
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            setDisplayedImage(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAddComment({ postId: post.id, author: newAuthor, content: newContent });
      setNewAuthor(""); setNewContent(""); setIsSubmitting(false);
    }, 600);
  };

  const renderContent = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.trim().split('\n');
        const lang = lines[0] || 'typescript';
        const code = lines.slice(1).join('\n');
        return <CodeBlock key={index} code={code} language={lang} />;
      }
      return <MarkdownRenderer key={index} content={part} />;
    });
  };

  const relatedPosts = allBlogs
    .filter(p => p.id !== post.id)
    .map(p => {
      let score = 0;
      if (p.category === post.category) score += 5;
      const sharedTags = p.tags.filter(t => post.tags.includes(t));
      score += sharedTags.length * 2;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.post);

  return (
    <div className="bg-light-bg dark:bg-dark-bg min-h-screen pb-20">
      <article className="max-w-3xl mx-auto py-20 px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-12 hover:text-blue-500 transition-all font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>
        
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
              <Hash className="w-3 h-3" /> {post.category}
            </div>
            
            <button 
              onClick={handleToggleRead}
              disabled={isLoadingAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                isReading 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white'
              } disabled:opacity-50`}
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Génération...
                </>
              ) : isReading ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  Arrêter la lecture
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Écouter l'article
                </>
              )}
            </button>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 dark:text-white text-gray-900 leading-none tracking-tighter uppercase">{post.title}</h1>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime} de lecture</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="hover:text-blue-500 transition-colors"><Twitter className="w-4 h-4" /></button>
              <button className="hover:text-blue-500 transition-colors"><LinkedinIcon className="w-4 h-4" /></button>
              <button className="hover:text-blue-500 transition-colors"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>
        </header>

        <div className="mb-16 rounded-[40px] overflow-hidden border border-black/5 dark:border-white/10 relative group shadow-2xl">
          {isGenerating && <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">Mise à jour de l'image...</div>}
          <img src={displayedImage} alt={post.title} className="w-full aspect-video object-cover" />
          <button onClick={handleGenerateAIImage} className="absolute bottom-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all text-white border border-white/10 hover:bg-white/20">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-20 blog-content">{renderContent(post.content)}</div>

        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-black/5 dark:border-white/5">
            <h3 className="text-2xl font-black mb-10 dark:text-white text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
              <Sparkles className="w-6 h-6 text-blue-500" /> Lectures suggérées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <button key={related.id} onClick={() => onPostClick(related)} className="group text-left space-y-4">
                  <div className="aspect-[4/3] rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
                    <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h4 className="font-bold text-md dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{related.title}</h4>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 py-16 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black dark:text-white text-gray-900 uppercase tracking-tighter">Échanges ({comments.length})</h3>
            <div className="h-px flex-1 bg-black/5 dark:bg-white/5 ml-8" />
          </div>
          
          <form onSubmit={handleSubmitComment} className="bg-gray-50 dark:bg-white/[0.02] p-8 rounded-[32px] mb-16 space-y-5 border border-black/5 dark:border-white/5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Identité</label>
                <input 
                  type="text" placeholder="Votre nom" value={newAuthor} 
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl dark:text-white outline-none focus:ring-2 ring-blue-500/30 transition-all font-medium"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
               <textarea 
                  placeholder="Partagez votre avis ou posez une question..." value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full p-5 bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-[24px] dark:text-white min-h-[140px] outline-none focus:ring-2 ring-blue-500/30 transition-all font-medium resize-none"
                  required
                />
            </div>
            <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-[20px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 uppercase text-[11px] tracking-[0.2em]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publier le commentaire
            </button>
          </form>

          <div className="space-y-10">
            {comments.map(c => (
              <div key={c.id} className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center font-black text-blue-600 text-lg shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-md dark:text-white uppercase tracking-tight">{c.author}</h4>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{c.date}</span>
                  </div>
                  <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed font-medium bg-white dark:bg-white/[0.02] p-5 rounded-2xl border border-black/5 dark:border-white/5">{c.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-white/[0.01] rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Soyez le premier à réagir</p>
              </div>
            )}
          </div>
        </section>
      </article>
    </div>
  );
};
