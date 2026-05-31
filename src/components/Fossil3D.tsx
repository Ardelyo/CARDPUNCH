import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  subtype: 'skull' | 'ribs' | 'spine' | 'leg';
  collected?: boolean;
}

export function Fossil3D({ subtype, collected }: Props) {
  const [showDust, setShowDust] = useState(false);

  useEffect(() => {
    if (collected) {
      setShowDust(true);
      const t = setTimeout(() => setShowDust(false), 2000);
      return () => clearTimeout(t);
    }
  }, [collected]);

  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() * 0.5);
      const distance = 25 + Math.random() * 35;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 15,
        scale: 0.5 + Math.random() * 1.5,
        delay: Math.random() * 0.2
      };
    });
  }, []);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center transition-all duration-700" style={{ perspective: '300px' }}>
       {/* Small dirt patch underneath */}
       <div 
         className="absolute w-14 h-14 bg-neutral-800 rounded-full blur-md opacity-60" 
         style={{ transform: 'rotateX(60deg) translateY(10px)' }}
       />
       
       <AnimatePresence>
         {showDust && particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0.8 }}
              animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full bg-[#d4d4d8] blur-[1px]"
              style={{ zIndex: 10 }}
            />
         ))}
       </AnimatePresence>

       <motion.div
           initial={{ y: 0, rotateZ: 0 }}
           animate={{ 
              y: collected ? -15 : 0, 
              rotateZ: collected ? [0, -10, 10, -5, 0] : 0,
              scale: collected ? 1.2 : 1
           }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="relative flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
       >
         {/* Render different SVGs based on subtype, all styled like ancient bones */}
         {subtype === 'skull' && (
             <svg width="48" height="48" viewBox="0 0 24 24" fill="#e5e5e5" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 1.94.7 3.73 1.86 5.09-1.07 1.28-2.6 1.8-4.22 1.85-.43.01-.64.55-.32.83 1.96 1.74 3.96 3.03 6.68 3.23.01 0 .04 0 .06.01.27.01.55.02.83.02 0 0 1.25.15 2.11-.85l.08-.1 1.92-2.3c.69-.82 1.39-1.63 2.1-2.43.08-.09.18-.18.28-.27.4-.35.8-.68 1.25-.97.97-.62 2.1-1.01 3.37-1.11H21c1.1 0 2-.9 2-2V9c0-3.87-3.13-7-7-7z" fill="#d4d4d8" />
                <circle cx="9" cy="10" r="2" fill="#18181b" stroke="none" />
                <path d="M12 16h3M12 19h2" stroke="#18181b" strokeWidth="1" />
             </svg>
         )}
         {subtype === 'ribs' && (
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M8 6c0 1.5-2 3-5 3" />
                <path d="M16 6c0 1.5 2 3 5 3" />
                <path d="M8 10c0 1.5-2 3-5 3" />
                <path d="M16 10c0 1.5 2 3 5 3" />
                <path d="M9 14c0 1.5-1.5 2.5-4 2.5" />
                <path d="M15 14c0 1.5 1.5 2.5 4 2.5" />
             </svg>
         )}
         {subtype === 'spine' && (
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)'}}>
                <path d="M12 2v20" />
                <path d="M9 6h6" />
                <path d="M9 10h6" />
                <path d="M9 14h6" />
                <path d="M9 18h6" />
             </svg>
         )}
         {subtype === 'leg' && (
             <svg width="48" height="48" viewBox="0 0 24 24" fill="#d4d4d8" stroke="#a3a3a3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2a2 2 0 0 1 4 0c0 1.1-.9 2-2 2s-2-.9-2-2z" />
                <path d="M11 4v16M13 4v16" strokeWidth="3" />
                <path d="M8 22c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2z" />
             </svg>
         )}
       </motion.div>
    </div>
  );
}
