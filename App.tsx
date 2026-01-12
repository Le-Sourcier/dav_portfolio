
import React, { useState, useEffect } from 'react';
import { portfolioData as initialData } from './data/portfolio';
import { BlogPost, Comment, PortfolioData } from './types/index';
import { Navbar } from './components/Navbar';
import { Hero, ProjectsSection, ExperienceSection, ContactSection, SkillsSection, PackagesSection } from './components/HomeSections';
import { BlogList, BlogDetail } from './components/BlogComponents';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { AdminDashboard } from './components/AdminDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'blog' | 'blog-detail' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Persistence des données du portfolio
  const [data, setData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('portfolio_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(data));
  }, [data]);

  // Thème
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setView('blog-detail');
    window.scrollTo(0, 0);
  };

  const handleAddComment = (newComment: Omit<Comment, 'id' | 'date'>) => {
    const comment: Comment = {
      ...newComment,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setComments(prev => [comment, ...prev]);
  };

  const isAdminView = view === 'admin';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#030712] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
      {!isAdminView && (
        <Navbar 
          currentView={view} 
          setView={setView} 
          isScrolled={isScrolled} 
          isDark={isDark} 
          toggleTheme={() => setIsDark(!isDark)} 
          data={data} 
        />
      )}
      
      <main className={isAdminView ? "" : "pt-20"}>
        {view === 'home' && (
          <div className="animate-in fade-in duration-500">
            <Hero data={data} />
            <SkillsSection skills={data.skills} />
            <ProjectsSection projects={data.projects} />
            <PackagesSection packages={data.npmPackages} />
            <ExperienceSection experiences={data.experiences} />
            <ContactSection contact={data.contact} />
          </div>
        )}
        {view === 'blog' && (
          <div className="animate-in fade-in duration-500">
            <BlogList blogs={data.blogs} onPostClick={handlePostClick} />
          </div>
        )}
        {view === 'blog-detail' && selectedPost && (
          <div className="animate-in fade-in duration-500">
            <BlogDetail 
              post={selectedPost} 
              allBlogs={data.blogs}
              onBack={() => setView('blog')} 
              onPostClick={handlePostClick}
              comments={comments.filter(c => c.postId === selectedPost.id)}
              onAddComment={handleAddComment}
            />
          </div>
        )}
        {view === 'admin' && (
          <div className="animate-in fade-in duration-500">
            <AdminDashboard data={data} onUpdate={setData} onExit={() => setView('home')} />
          </div>
        )}
      </main>

      {!isAdminView && <Footer setView={setView} />}
      
      {!isAdminView && <AIAssistant data={data} />}
    </div>
  );
};

export default App;
