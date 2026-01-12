
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { portfolioData as initialData } from './data/portfolio';
import { PortfolioData, Comment } from './types/index';
import { Navbar } from './components/Navbar';
import { Hero, ProjectsSection, ExperienceSection, ContactSection, SkillsSection, PackagesSection } from './components/HomeSections';
import { BlogList, BlogDetail } from './components/BlogComponents';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { AdminDashboard } from './components/AdminDashboard';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicLayout: React.FC<{ data: PortfolioData; isDark: boolean; toggleTheme: () => void; comments: Comment[]; onAddComment: (c: any) => void }> = ({ data, isDark, toggleTheme, comments, onAddComment }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#030712] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
      <Navbar 
        isScrolled={isScrolled} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        data={data} 
      />
      
      <main className="pt-20">
        <Routes>
          <Route path="/" element={
            <div className="animate-in fade-in duration-500">
              <Hero data={data} />
              <SkillsSection skills={data.skills} />
              <ProjectsSection projects={data.projects} />
              <PackagesSection packages={data.npmPackages} />
              <ExperienceSection experiences={data.experiences} />
              <ContactSection contact={data.contact} />
            </div>
          } />
          <Route path="/blog" element={<BlogList blogs={data.blogs} />} />
          <Route path="/blog/:id" element={<BlogDetail allBlogs={data.blogs} comments={comments} onAddComment={onAddComment} />} />
          {/* Redirection vers l'accueil pour les routes inconnues hors admin */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <AIAssistant data={data} />
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('portfolio_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return true;
  });

  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleAddComment = (newComment: Omit<Comment, 'id' | 'date'>) => {
    const comment: Comment = {
      ...newComment,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setComments(prev => [comment, ...prev]);
  };

  const handleUpdateData = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('portfolio_data', JSON.stringify(newData));
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Route Admin prioritaire */}
        <Route path="/admin/*" element={<AdminDashboard data={data} onUpdate={handleUpdateData} />} />
        
        {/* Toutes les autres routes passent par le PublicLayout */}
        <Route path="/*" element={
          <PublicLayout 
            data={data} 
            isDark={isDark} 
            toggleTheme={() => setIsDark(!isDark)} 
            comments={comments}
            onAddComment={handleAddComment}
          />
        } />
      </Routes>
    </Router>
  );
};

export default App;
