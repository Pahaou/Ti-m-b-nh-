import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useNavbarScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback((targetId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (targetId === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
        else if (targetId === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        else {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      if (targetId === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (targetId === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.pathname, navigate]);

  return { scrollToSection };
}
