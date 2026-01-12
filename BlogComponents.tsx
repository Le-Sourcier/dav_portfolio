
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Hash, Search, X, ChevronRight, 
  ArrowLeft, RefreshCw, Loader2, Sparkles, 
  MessageSquare, User, Send, Copy, CheckCircle2,
  FileCode
} from 'lucide-react';
import { BlogPost, Comment } from './types';
import { highlightCode } from './utils';
import { GoogleGenAI } from "@google/genai";

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
    <div className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/5 shadow-xl group ring-1 ring-white/5">
      {/* Barre de titre VSCode */}
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
        {/* Numéros de lignes */}
        <div className="w-10 pt-4 pb-4 flex flex-col items-center text-gray-600 select-none bg-[#1e1e1e] border-r border-white/5">
          {lines.map((_, i) => (
            <div key={i} className="h-6 text-[12px]">{i + 1}</div>
          ))}
        </div>
        {/* Code */}
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
  
  useEffect(() => {
    setDisplayedImage(post.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post]);

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
      return (
        <div key={index} className="prose dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-gray-300 mb-8">
          {part.split('\n\n').map((p, i) => <p key={i} className="mb-6 leading-relaxed text-lg">{p}</p>)}
        </div>
      );
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
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-12 hover:text-blue-500 transition-all font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>
        
        <header className="mb-12">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
            <Hash className="w-3 h-3" /> {post.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 dark:text-white text-gray-900 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 font-medium text-xs">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime} de lecture</span>
          </div>
        </header>

        <div className="mb-12 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 relative group shadow-lg">
          {isGenerating && <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">Mise à jour de l'image...</div>}
          <img src={displayedImage} alt={post.title} className="w-full aspect-video object-cover" />
          <button onClick={handleGenerateAIImage} className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white border border-white/10">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-16">{renderContent(post.content)}</div>

        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-black/5 dark:border-white/5">
            <h3 className="text-2xl font-black mb-8 dark:text-white text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> Recommandés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <button key={related.id} onClick={() => onPostClick(related)} className="group text-left space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-sm dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">{related.title}</h4>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 py-12 border-t border-black/5 dark:border-white/5">
          <h3 className="text-2xl font-black mb-8 dark:text-white text-gray-900">Commentaires ({comments.length})</h3>
          <form onSubmit={handleSubmitComment} className="bg-gray-50 dark:bg-white/[0.03] p-6 rounded-2xl mb-12 space-y-4 border border-black/5 dark:border-white/5">
            <input 
              type="text" placeholder="Nom" value={newAuthor} 
              onChange={e => setNewAuthor(e.target.value)}
              className="w-full p-3 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl dark:text-white outline-none"
              required 
            />
            <textarea 
              placeholder="Votre message..." value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full p-3 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl dark:text-white min-h-[100px] outline-none"
              required
            />
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer
            </button>
          </form>

          <div className="space-y-8">
            {comments.map(c => (
              <div key={c.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm dark:text-white mb-1">{c.author} <span className="text-[9px] text-gray-500 ml-2 font-medium uppercase">{c.date}</span></h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};
