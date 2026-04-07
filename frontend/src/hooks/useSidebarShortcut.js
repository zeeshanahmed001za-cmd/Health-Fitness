import { useEffect } from 'react';

/**
 * useSidebarShortcut: Hook to handle global keyboard shortcut for sidebar toggle.
 * Shortcut: Ctrl + .
 */
export default function useSidebarShortcut(toggleFn) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + .
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        toggleFn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFn]);
}
