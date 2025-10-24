// LitInvestorBlog-frontend/src/hooks/useThrottle.js

import { useRef, useCallback } from 'react';

export const useThrottle = (callback, delay = 300) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

export default useThrottle;
