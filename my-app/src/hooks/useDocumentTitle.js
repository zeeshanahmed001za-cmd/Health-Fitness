import { useEffect } from 'react';

/**
 * Custom hook to update the browser tab title dynamically.
 * @param {string} title - The title to be set.
 * @param {boolean} prevailOnUnmount - Whether to keep the title after component unmounts.
 */
const useDocumentTitle = (title, prevailOnUnmount = false) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | Health&Fitness`;

    return () => {
      if (!prevailOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, prevailOnUnmount]);
};

export default useDocumentTitle;
