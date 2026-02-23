import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
  isTransitioning: boolean;
  transitionPosition: { x: number; y: number } | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Store click position for animation origin
let clickX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
let clickY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Circle reveal transition — same pattern as DevPortfolio
  const performTransition = useCallback((newResolved: Theme) => {
    const root = document.documentElement;
    const oldResolved = root.classList.contains('dark') ? 'dark' : 'light';

    if (newResolved === oldResolved) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('light', 'dark');
      root.classList.add(newResolved);
      return;
    }

    setIsTransitioning(true);

    const x = clickX;
    const y = clickY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const isDarkening = newResolved === 'dark';

    const doSwitch = () => {
      root.classList.remove('light', 'dark');
      root.classList.add(newResolved);
    };

    // Strategy A: View Transitions API (Chrome 111+)
    if ((document as any).startViewTransition) {
      const transition = (document as any).startViewTransition(doSwitch);

      transition.ready.then(() => {
        root.animate(
          {
            clipPath: isDarkening
              ? [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
              : [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: isDarkening
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          }
        );
      });

      transition.finished.finally(() => setIsTransitioning(false));
      return;
    }

    // Strategy B: Overlay fallback (Firefox, Safari)
    const oldBg = isDarkening ? '#fafafa' : '#09090b';
    const newBg = isDarkening ? '#09090b' : '#fafafa';

    const oldOverlay = document.createElement('div');
    oldOverlay.style.cssText = `position:fixed;inset:0;z-index:99998;pointer-events:none;background-color:${oldBg};`;

    const newOverlay = document.createElement('div');
    newOverlay.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;background-color:${newBg};clip-path:circle(0px at ${x}px ${y}px);`;

    document.body.appendChild(oldOverlay);
    document.body.appendChild(newOverlay);

    doSwitch();

    requestAnimationFrame(() => {
      const animation = newOverlay.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ],
        { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      );
      animation.onfinish = () => {
        oldOverlay.remove();
        newOverlay.remove();
        setIsTransitioning(false);
      };
    });
  }, []);

  // Initial theme — no animation
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, []);

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    if (event) {
      clickX = event.clientX;
      clickY = event.clientY;
    } else {
      clickX = window.innerWidth / 2;
      clickY = window.innerHeight / 2;
    }

    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    performTransition(newTheme);
  }, [theme, performTransition]);

  const transitionPosition = isTransitioning ? { x: clickX, y: clickY } : null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning, transitionPosition }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
