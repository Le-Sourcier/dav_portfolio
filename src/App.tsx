import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Hero } from './components/portfolio/Hero';
import { ProjectGallery } from './components/portfolio/ProjectGallery';
import { ProjectDetailPage } from './components/portfolio/ProjectDetailPage';
import { ExperienceDetailPage } from './components/portfolio/ExperienceDetailPage';
import { About } from './components/portfolio/About';
import { Testimonials } from './components/portfolio/Testimonials';
import { Contact } from './components/portfolio/Contact';
import { Navbar } from './components/portfolio/Navbar';
import { BlogPage } from './components/portfolio/BlogPage';
import { BlogPostDetail } from './components/portfolio/BlogPostDetail';
import { AppointmentBooking } from './components/portfolio/AppointmentBooking';
import { LatestBlogPosts } from './components/portfolio/LatestBlogPosts';
import { LegalMentions } from './components/portfolio/LegalMentions';
import { PrivacyPolicy } from './components/portfolio/PrivacyPolicy';
import { TermsOfService } from './components/portfolio/TermsOfService';
import { NotFoundPage } from './components/portfolio/NotFoundPage';
import { NewsletterUnsubscribe } from './components/portfolio/NewsletterUnsubscribe';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/layout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/portfolio/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatbotContainer } from './components/portfolio/chatbot/ChatbotContainer';
import { useProfile } from './hooks/useProfile';
import { envConfig } from './config/env';
import { SeoHead } from './components/shared/SeoHead';
import { CookieConsent } from './components/portfolio/CookieConsent';

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  return null;
}

function HomePage() {
  return (
    <main>
      <Hero />
      <ProjectGallery />
      <About />
      <LatestBlogPosts />
      <section id="booking" className="py-24 px-6 md:px-12 lg:px-24 bg-secondary/30 transition-colors duration-500 text-foreground">
        <div className="max-w-4xl mx-auto">
          <AppointmentBooking />
        </div>
      </section>
      <Testimonials />
      <Contact />
    </main>
  );
}

function Layout({ children, hideNavFooter = false }: { children: React.ReactNode; hideNavFooter?: boolean }) {
  const profile = useProfile();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased transition-colors duration-500">
      <SeoHead />
      {!hideNavFooter && <Navbar />}

      {children}

      {!hideNavFooter && (
        <footer className="py-24 px-6 md:px-12 lg:px-24 bg-card border-t border-border transition-colors duration-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-6">
              <Link to="/" className="text-3xl font-black tracking-tighter">
                {profile.brand}<span className="text-primary">.</span>
              </Link>
              <p className="text-muted-foreground font-medium text-center md:text-left">
                {profile.title}<br /> base a {profile.location}.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Plan du site</h4>
                <a href="/#work" className="font-bold hover:text-primary transition-colors">Projets</a>
                <a href="/#about" className="font-bold hover:text-primary transition-colors">A Propos</a>
                <Link to="/blog" className="font-bold hover:text-primary transition-colors">Blog</Link>
                <a href="/#contact" className="font-bold hover:text-primary transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Reseaux</h4>
                {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">GitHub</a>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">LinkedIn</a>}
                <a href={`mailto:${profile.email}`} className="font-bold hover:text-primary transition-colors">Email</a>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm font-medium italic">
              &copy; {new Date().getFullYear()} {profile.name}. Tous droits reserves.
            </p>
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
              <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Confidentialite</Link>
              <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions</Link>
              <Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link>
              <Link to="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      )}

      {!hideNavFooter && <ChatbotContainer />}
      {!hideNavFooter && <CookieConsent />}
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error.message?.includes('Access token') || error.message?.includes('401')) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ScrollToHash />
          <Toaster position="top-center" expand={true} richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/work/:id" element={<Layout><ProjectDetailPage /></Layout>} />
          <Route path="/experience/:id" element={<Layout><ExperienceDetailPage /></Layout>} />
          <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
          <Route path="/blog/:id" element={<Layout><BlogPostDetail /></Layout>} />
          <Route path="/mentions-legales" element={<Layout><LegalMentions /></Layout>} />
          <Route path="/politique-confidentialite" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/cgu" element={<Layout><TermsOfService /></Layout>} />
          <Route path="/newsletter/unsubscribe" element={<Layout><NewsletterUnsubscribe /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Layout hideNavFooter><AdminLogin /></Layout>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;