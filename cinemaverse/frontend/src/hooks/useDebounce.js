// useDebounce.js
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}



export function useAuth() {
  const { user, token, loading } = useSelector((s) => s.auth);
  return {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: user?.subscriptionPlan === 'premium',
  };
}



export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | CinemaVerse` : 'CinemaVerse';
    return () => { document.title = 'CinemaVerse'; };
  }, [title]);
}



export function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
}
