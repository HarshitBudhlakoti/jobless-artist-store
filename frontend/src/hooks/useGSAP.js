import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for GSAP ScrollTrigger animations.
 * @param {Function} animationFn - receives (element, gsap, ScrollTrigger) and returns a timeline or tween
 * @param {Array} deps - dependency array for re-running the animation
 * @returns {React.RefObject} ref to attach to the animated element
 */
export function useGSAPAnimation(animationFn, deps = []) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      animationFn(el, gsap, ScrollTrigger);
    }, el);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return elementRef;
}

/**
 * Fade in and move up animation
 */
export function useFadeInUp(options = {}) {
  const { delay = 0, duration = 0.8, y = 40, trigger } = options;

  return useGSAPAnimation((el, gsapInstance) => {
    gsapInstance.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: trigger !== false
          ? {
              trigger: el,
              start: 'top 85%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
              ...options.scrollTrigger,
            }
          : undefined,
      }
    );
  });
}

/**
 * Stagger children animation
 */
export function useStaggerIn(options = {}) {
  const { stagger = 0.1, duration = 0.6, y = 30, childSelector = ':scope > *' } = options;

  return useGSAPAnimation((el, gsapInstance) => {
    const children = el.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsapInstance.fromTo(
      children,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          ...options.scrollTrigger,
        },
      }
    );
  });
}

/**
 * Parallax effect
 */
export function useParallax(options = {}) {
  const { speed = 0.5 } = options;

  return useGSAPAnimation((el, gsapInstance) => {
    gsapInstance.to(el, {
      y: () => -speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        ...options.scrollTrigger,
      },
    });
  });
}

/**
 * Split text reveal animation
 */
export function useSplitTextReveal(options = {}) {
  const { duration = 0.8, stagger = 0.03 } = options;

  return useGSAPAnimation((el, gsapInstance) => {
    const text = el.textContent;
    el.textContent = '';
    el.style.visibility = 'visible';

    const chars = text.split('').map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      el.appendChild(span);
      return span;
    });

    gsapInstance.to(chars, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        ...options.scrollTrigger,
      },
    });
  });
}
