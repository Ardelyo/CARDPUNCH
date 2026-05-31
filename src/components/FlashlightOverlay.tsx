import { useEffect, useRef } from 'react';

export function FlashlightOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial center position
    const setInitialPos = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate3d(0px, 0px, 0)`;
      }
    };
    setInitialPos();

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let x, y;
      if ('touches' in e) {
         if (e.touches.length > 0) {
             x = e.touches[0].clientX;
             y = e.touches[0].clientY;
         } else return;
      } else {
         x = (e as MouseEvent).clientX;
         y = (e as MouseEvent).clientY;
      }
      
      if (overlayRef.current) {
         const w = window.innerWidth;
         const h = window.innerHeight;
         // Center of the huge div is its origin, shift it to match pointer
         const moveX = x - w / 2;
         const moveY = y - h / 2;
         overlayRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    };
    
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('resize', setInitialPos);
    
    return () => {
       window.removeEventListener('mousemove', handleMove);
       window.removeEventListener('touchmove', handleMove);
       window.removeEventListener('resize', setInitialPos);
    }
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-multiply opacity-95">
        <div 
           ref={overlayRef}
           className="absolute top-1/2 left-1/2"
           style={{
               width: '300vw',
               height: '300vh',
               marginTop: '-150vh',
               marginLeft: '-150vw',
               background: 'radial-gradient(circle 350px at center, transparent 0%, rgba(20,20,20,0.85) 50%, #050505 85%)',
               willChange: 'transform'
           }}
        />
    </div>
  );
}
