import { useState, useEffect } from 'react';

export default function useIsMobile(breakpoint = 768) {
  // Check if window is available to be SSR/Prerender safe
  const isBrowser = typeof window !== 'undefined';
  
  const [isMobile, setIsMobile] = useState(isBrowser ? window.innerWidth < breakpoint : false);

  useEffect(() => {
    if (!isBrowser) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    // Trigger initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint, isBrowser]);

  return isMobile;
}
