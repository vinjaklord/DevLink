import { useEffect, useState } from 'react';

export default function useAnimationOnResize(breakpoint = 1300) {
  const [isAbove, setIsAbove] = useState(window.innerWidth > breakpoint);
  const [justResized, setJustResized] = useState(false);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      const newIsAbove = window.innerWidth > breakpoint;
      if (newIsAbove !== isAbove) {
        setJustResized(true);
        setIsAbove(newIsAbove);

        // Remove animation trigger after a short delay
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => setJustResized(false), 700);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isAbove, breakpoint]);

  return { isAbove, justResized };
}
