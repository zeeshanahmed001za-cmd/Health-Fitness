import { useEffect } from 'react';

/**
 * useKeyboardShortcuts: Global hook to handle app-wide shortcuts.
 * Ctrl+K: Open Quick Log
 * Ctrl+B: Toggle Sidebar
 * Esc: Close any open modal/state
 */
export default function useKeyboardShortcuts({ toggleSidebar, toggleQuickLog, isQuickLogOpen }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ctrl + B (Sidebar)
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (toggleSidebar) toggleSidebar();
      }

      // 2. Ctrl + K (Quick Log)
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (toggleQuickLog) toggleQuickLog(true);
      }

      // 3. Esc (Close everything)
      if (e.key === 'Escape') {
        if (isQuickLogOpen && toggleQuickLog) {
            toggleQuickLog(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleQuickLog, isQuickLogOpen]);
}
