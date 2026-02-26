import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

// In-memory cache shared across all hook instances
const cache = {
  settings: null,
  sections: {},
  testimonials: null,
};

/**
 * Fetch site settings (contact, social, footer, stats).
 * Falls back to provided defaults silently on error.
 */
export function useSiteSettings(defaults = {}) {
  const [data, setData] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (cache.settings) {
      setData(cache.settings);
      setLoading(false);
      return;
    }

    api
      .get('/site-settings')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          cache.settings = res.data.data;
          setData(res.data.data);
        }
      })
      .catch(() => {
        // Silent fallback to defaults
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/**
 * Fetch a single page content section by key.
 * Falls back to provided defaults silently on error.
 */
export function usePageContent(sectionKey, defaults = null) {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (cache.sections[sectionKey]) {
      setContent(cache.sections[sectionKey]);
      setLoading(false);
      return;
    }

    api
      .get(`/page-content/${encodeURIComponent(sectionKey)}`)
      .then((res) => {
        if (res.data?.success && res.data.data?.content) {
          cache.sections[sectionKey] = res.data.data.content;
          setContent(res.data.data.content);
        }
      })
      .catch(() => {
        // Silent fallback to defaults
      })
      .finally(() => setLoading(false));
  }, [sectionKey]);

  return { content, loading };
}

/**
 * Fetch active testimonials from API.
 * Falls back to empty array on error.
 */
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (cache.testimonials) {
      setTestimonials(cache.testimonials);
      setLoading(false);
      return;
    }

    api
      .get('/testimonials')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          cache.testimonials = res.data.data;
          setTestimonials(res.data.data);
        }
      })
      .catch(() => {
        // Silent fallback to empty
      })
      .finally(() => setLoading(false));
  }, []);

  return { testimonials, loading };
}

/**
 * Invalidate cache (call after admin edits)
 */
export function invalidateCache(type) {
  if (type === 'settings') cache.settings = null;
  else if (type === 'testimonials') cache.testimonials = null;
  else if (type === 'sections') cache.sections = {};
  else if (type) delete cache.sections[type];
  else {
    cache.settings = null;
    cache.sections = {};
    cache.testimonials = null;
  }
}
