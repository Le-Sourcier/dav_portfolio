import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

const VALID_TABS = [
  'dashboard', 'projects', 'experiences', 'blog',
  'tags', 'comments', 'contacts', 'appointments', 'testimonials', 'newsletter', 'settings',
];

/**
 * Syncs the Zustand activeTab with the URL search param `?tab=`.
 * - On mount: reads `?tab=` from URL and sets the store
 * - On tab change (store): updates the URL
 * - Supports browser back/forward navigation
 */
export function useTabSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const isInitialized = useRef(false);

  // On mount: read tab from URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && VALID_TABS.includes(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
    isInitialized.current = true;
  }, []);

  // When store changes: update URL
  useEffect(() => {
    if (!isInitialized.current) return;

    const currentUrlTab = searchParams.get('tab') || 'dashboard';
    if (activeTab !== currentUrlTab) {
      if (activeTab === 'dashboard') {
        // Remove ?tab= for dashboard (clean URL)
        searchParams.delete('tab');
      } else {
        searchParams.set('tab', activeTab);
      }
      if (activeTab !== 'comments') {
        searchParams.delete('postId');
        searchParams.delete('commentId');
      }
      setSearchParams(searchParams, { replace: true });
    }
  }, [activeTab]);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') || 'dashboard';
      if (VALID_TABS.includes(urlTab) && urlTab !== useUIStore.getState().activeTab) {
        setActiveTab(urlTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab]);
}
