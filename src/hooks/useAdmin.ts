import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type {
  Project,
  Experience,
  BlogPost,
  Contact,
  Appointment,
  NewsletterSubscriber,
  Testimonial,
  DashboardStats,
} from '@/types/admin.types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: Omit<Project, 'id'>) => {
    try {
      const newProject = await api.projects.create(data);
      setProjects((prev) => [newProject, ...prev]);
      toast.success('Projet cree avec succes');
      return newProject;
    } catch (error) {
      toast.error('Erreur lors de la creation');
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      const updated = await api.projects.update(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success('Projet mis a jour');
      return updated;
    } catch (error) {
      toast.error('Erreur lors de la mise a jour');
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await api.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Projet supprime');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  }, []);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.experiences.getAll();
      setExperiences(data);
    } catch {
      toast.error('Erreur lors du chargement des experiences');
    } finally {
      setLoading(false);
    }
  }, []);

  const createExperience = useCallback(async (data: Omit<Experience, 'id'>) => {
    try {
      const newExp = await api.experiences.create(data);
      setExperiences((prev) => [newExp, ...prev]);
      toast.success('Experience creee avec succes');
      return newExp;
    } catch (error) {
      toast.error('Erreur lors de la creation');
      throw error;
    }
  }, []);

  const updateExperience = useCallback(async (id: string, data: Partial<Experience>) => {
    try {
      const updated = await api.experiences.update(id, data);
      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast.success('Experience mise a jour');
      return updated;
    } catch (error) {
      toast.error('Erreur lors de la mise a jour');
      throw error;
    }
  }, []);

  const deleteExperience = useCallback(async (id: string) => {
    try {
      await api.experiences.delete(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      toast.success('Experience supprimee');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  }, []);

  return {
    experiences,
    loading,
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
  };
}

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.blog.getAll();
      setPosts(data);
    } catch {
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: Omit<BlogPost, 'id' | 'slug' | 'readTime'>) => {
    try {
      const newPost = await api.blog.create(data);
      setPosts((prev) => [newPost, ...prev]);
      toast.success('Article cree avec succes');
      return newPost;
    } catch (error) {
      toast.error('Erreur lors de la creation');
      throw error;
    }
  }, []);

  const updatePost = useCallback(async (id: string, data: Partial<BlogPost>) => {
    try {
      const updated = await api.blog.update(id, data);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success('Article mis a jour');
      return updated;
    } catch (error) {
      toast.error('Erreur lors de la mise a jour');
      throw error;
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      await api.blog.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Article supprime');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.contacts.getAll();
      setContacts(data);
      setUnreadCount(data.filter((c) => !c.read).length);
    } catch {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const updated = await api.contacts.markAsRead(id);
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Erreur lors du marquage');
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    try {
      const contact = contacts.find((c) => c.id === id);
      await api.contacts.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (contact && !contact.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Message supprime');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, [contacts]);

  return {
    contacts,
    loading,
    unreadCount,
    fetchContacts,
    markAsRead,
    deleteContact,
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.appointments.getAll();
      setAppointments(data);
    } catch {
      toast.error('Erreur lors du chargement des RDV');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Appointment['status']) => {
    try {
      const updated = await api.appointments.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success('Statut mis a jour');
    } catch {
      toast.error('Erreur lors de la mise a jour');
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await api.appointments.delete(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success('RDV supprime');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, []);

  return {
    appointments,
    loading,
    fetchAppointments,
    updateStatus,
    deleteAppointment,
  };
}

export function useNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, statsData] = await Promise.all([
        api.newsletter.getAllSubscribers(),
        api.newsletter.getStats(),
      ]);
      setSubscribers(subs);
      setStats(statsData);
    } catch {
      toast.error('Erreur lors du chargement des abonnes');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribers,
    stats,
    loading,
    fetchSubscribers,
  };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.testimonials.getAll();
      setTestimonials(data);
    } catch {
      toast.error('Erreur lors du chargement des temoignages');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestimonial = useCallback(async (data: Omit<Testimonial, 'id' | 'visible'>) => {
    try {
      const newTest = await api.testimonials.create(data);
      setTestimonials((prev) => [newTest, ...prev]);
      toast.success('Temoignage cree');
      return newTest;
    } catch (error) {
      toast.error('Erreur lors de la creation');
      throw error;
    }
  }, []);

  const toggleVisibility = useCallback(async (id: string) => {
    try {
      const updated = await api.testimonials.toggleVisibility(id);
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Visibilite modifiee');
    } catch {
      toast.error('Erreur lors de la modification');
    }
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    try {
      await api.testimonials.delete(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success('Temoignage supprime');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, []);

  return {
    testimonials,
    loading,
    fetchTestimonials,
    createTestimonial,
    toggleVisibility,
    deleteTestimonial,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [projects, experiences, posts, contacts, appointments, newsletterStats] =
        await Promise.all([
          api.projects.getAll(),
          api.experiences.getAll(),
          api.blog.getAll(),
          api.contacts.getAll(),
          api.appointments.getUpcoming(),
          api.newsletter.getStats(),
        ]);

      setStats({
        projects: projects.length,
        experiences: experiences.length,
        blogPosts: posts.length,
        contacts: contacts.length,
        appointments: appointments.length,
        newsletterSubscribers: newsletterStats.total,
        unreadMessages: contacts.filter((c) => !c.read).length,
        upcomingAppointments: appointments.filter((a) => a.status === 'pending').length,
      });
    } catch {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, fetchStats };
}
