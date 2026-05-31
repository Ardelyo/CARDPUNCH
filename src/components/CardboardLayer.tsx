import React, { useEffect, useRef, useState } from 'react';
import { HiddenItem } from '../types';
import { playStab, playTear } from '../utils/audio';
import { Chest3D } from './Chest3D';
import { Bomb3D } from './Bomb3D';
import { Fossil3D } from './Fossil3D';

interface Props {
  levelNum: number;
  items: HiddenItem[];
  onItemClick: (item: HiddenItem) => void;
  width: number;
  height: number;
}

export function CardboardLayer({ items, onItemClick, width, height, levelNum }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStabbing, setIsStabbing] = useState(false);
  const lastStab = useRef<{x: number, y: number} | null>(null);

  // Keep a ref of items to load inside the useEffect without triggering redraws on item collection
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Serialize item positions so the cardboard background & clues only redraw when structures change
  const itemsPositionsKey = JSON.stringify(items.map(i => `${i.id}-${i.type}-${i.x}-${i.y}-${i.size}`));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Fill deep cardboard color
    const baseColor = '#5c4b3c';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw subtle vertical corrugated lines
    ctx.strokeStyle = '#4a3b2b';
    ctx.lineWidth = 3;
    for(let x = 0; x < width; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Render subtle clues for items using our stable ref
    itemsRef.current.forEach(item => {
        const itemX = item.x * width;
        const itemY = item.y * height;
        
        ctx.beginPath();
        const grad = ctx.createRadialGradient(itemX, itemY, 0, itemX, itemY, 50);
        
        if (item.type === 'lever') {
             // Very faint darker/reddish stain for the lever clue
             grad.addColorStop(0, 'rgba(60, 20, 20, 0.15)');
             grad.addColorStop(1, 'rgba(60, 20, 20, 0)');
        } else if (item.type === 'bomb') {
             // Semi soot-like grey stain for dangerous bomb clue
             grad.addColorStop(0, 'rgba(30, 30, 30, 0.2)');
             grad.addColorStop(1, 'rgba(30, 30, 30, 0)');
        } else {
             // Faint yellowish/lighter stain for treasure clue
             grad.addColorStop(0, 'rgba(100, 80, 40, 0.15)');
             grad.addColorStop(1, 'rgba(100, 80, 40, 0)');
         }
        
        ctx.fillStyle = grad;
        ctx.arc(itemX, itemY, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Slight physical indent lines for texture clue
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(itemX, itemY, item.size * width * 0.35, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Noise map (using pixels) to blend it all together
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for(let i=0; i < (width * height) / 20; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
  }, [width, height, levelNum, itemsPositionsKey]); // Re-draw only on level, resize or model structure changes

  const spawnParticles = (x: number, y: number, isTear = false) => {
    if (!containerRef.current) return;
    const count = isTear ? 2 : 6;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;
        particle.className = `absolute pointer-events-none rounded-sm blur-[0.5px] ${Math.random() > 0.5 ? 'bg-[#8b7355]' : 'bg-[#5c4b3c]'}`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        particle.style.zIndex = '50';
        containerRef.current.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * (isTear ? 15 : 35);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist + 15; // adding some gravity feel

        // Trigger reflow
        void particle.offsetWidth;

        particle.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 180}deg)`;
        particle.style.opacity = '0';

        setTimeout(() => {
            particle.remove();
        }, 500);
    }
  };

  const stabHole = (x: number, y: number, isTear = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const steps = 30;
    const baseRadius = isTear ? 18 : 30; 
    const points: {x: number, y: number}[] = [];

    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const noise = Math.sin(angle * 7) * 2.5 + Math.sin(angle * 13) * 1.2 + (Math.random() - 0.5) * 1.5;
        const r = baseRadius + noise;
        points.push({
            x: x + Math.cos(angle) * r,
            y: y + Math.sin(angle) * r
        });
    }

    // Check if we are poking a bomb spot to make it break much faster
    let isBombHole = false;
    itemsRef.current.forEach(item => {
        if (item.type === 'bomb') {
            const itemX = item.x * width;
            const itemY = item.y * height;
            const itemRadius = (item.size * width) / 2;
            const dist = Math.hypot(itemX - x, itemY - y);
            if (dist <= (itemRadius + baseRadius)) {
                isBombHole = true;
            }
        }
    });

    // 1. FIRST, erase the center of the cardboard to form the transparent hole
    ctx.globalCompositeOperation = 'destination-out';
    const baseAlpha = Math.max(0.2, Math.min(1.0, 1.25 / levelNum));
    const layerAlpha = isBombHole ? Math.max(0.7, baseAlpha) : baseAlpha;
    ctx.globalAlpha = isTear ? layerAlpha * 0.75 : layerAlpha;

    ctx.beginPath();
    points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();

    // 2. SECOND, draw shadows and details on the cardboard rim only, using 'source-atop'
    // This absolutely guarantees that lines do not draw/overlay over transparent holes
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 1.0;

    // A subtle dark gradient outer shadows to simulate indentation/crushing of the board
    ctx.strokeStyle = 'rgba(20, 10, 4, 0.45)';
    ctx.lineWidth = isTear ? 8 : 16;
    ctx.beginPath();
    points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    // The dark cardboard compressed cross-section rim
    ctx.strokeStyle = 'rgba(25, 12, 5, 0.9)';
    ctx.lineWidth = isTear ? 3 : 5;
    ctx.beginPath();
    points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Faint torn paper fibers extending outward across the remaining solid cardboard face
    if (!isTear && Math.random() > 0.4) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            const angle = Math.random() * Math.PI * 2;
            const startDist = baseRadius * 0.95;
            const endDist = baseRadius * 1.35;
            ctx.moveTo(x + Math.cos(angle) * startDist, y + Math.sin(angle) * startDist);
            ctx.lineTo(x + Math.cos(angle) * endDist, y + Math.sin(angle) * endDist);
            ctx.stroke();
        }
    }

    // 3. Reset composite operation to normal
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (ctx) {
       const dpr = window.devicePixelRatio || 1;
       const pixelX = Math.min(Math.max(0, Math.floor(x * dpr)), canvasRef.current.width - 1);
       const pixelY = Math.min(Math.max(0, Math.floor(y * dpr)), canvasRef.current.height - 1);
       const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
       const alpha = pixel[3];

       // Clicked on a transparent spot (a hole)
       if (alpha < 50) {
           const hitItem = items.find(item => {
               const itemX = item.x * width;
               const itemY = item.y * height;
               const itemRadius = (item.size * width) / 2;
               
               const dist = Math.hypot(itemX - x, itemY - y);
               return dist <= (itemRadius + 20); // slightly generous hitbox
           });

           if (hitItem && !hitItem.collected) {
               onItemClick(hitItem);
               return; // Interacted with item, don't stab
           }
       }
    }

    // Otherwise, perform a stab
    setIsStabbing(true);
    setTimeout(() => setIsStabbing(false), 50);
    
    try {
        if (navigator.vibrate) {
            navigator.vibrate(40); // Stronger haptic for initial stab
        }
    } catch (err) {
        // Safe fallback when vibration is disabled in cross-origin iframe
    }
    
    playStab();
    spawnParticles(x, y, false);
    
    containerRef.current.setPointerCapture(e.pointerId);
    stabHole(x, y);
    lastStab.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (e.buttons > 0 && lastStab.current) {
       const rect = containerRef.current?.getBoundingClientRect();
       if (!rect) return;
       const x = e.clientX - rect.left;
       const y = e.clientY - rect.top;
       
       const dist = Math.hypot(x - lastStab.current.x, y - lastStab.current.y);
       // Require meaningful distance to tear, abandoning the "brush stroke" feel
       if (dist > 25) {
           playTear();
           spawnParticles(x, y, true);
           stabHole(x, y, true);
           lastStab.current = { x, y };
           try {
               if (navigator.vibrate) {
                   navigator.vibrate(10); // Lighter haptic for tearing
               }
           } catch (err) {
               // Safe fallback when vibration is disabled in cross-origin iframe
           }
       }
     }
  };

  const handlePointerUp = () => {
      lastStab.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="relative touch-none overflow-hidden rounded-md bg-[#050505]"
      style={{ 
          width, 
          height, 
          boxShadow: '0 20px 50px rgba(0,0,0,1), inset 0 0 40px rgba(0,0,0,1)',
          transform: isStabbing ? 'scale(0.98) translate(0, 2px)' : 'scale(1) translate(0, 0)',
          transition: 'transform 0.05s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* The empty dark void inside the box */}
      <div 
         className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,1)]"
         style={{
             backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 8px), radial-gradient(circle at center, #1c1510 0%, #050505 100%)`
         }}
      >
           {items.map(item => (
                <div 
                   key={item.id}
                   className="absolute flex items-center justify-center transition-all duration-500"
                   style={{
                       left: `${item.x * 100}%`,
                       top: `${item.y * 100}%`,
                       width: `${item.size * 100}%`,
                       height: `${item.size * 100}%`,
                       transform: `translate(-50%, -50%)`,
                       filter: item.collected ? 'drop-shadow(0 0 20px rgba(250,204,21,0.4))' : 'drop-shadow(0 5px 12px rgba(0,0,0,0.9))'
                   }}
                >
                    {item.type === 'lever' ? (
                       <div className="relative w-14 h-14 flex items-center justify-center" style={{ perspective: '300px' }}>
                          <div 
                             className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 shadow-[inset_0_0_12px_rgba(0,0,0,0.9)] relative flex items-center justify-center"
                             style={{ transformStyle: 'preserve-3d', transform: 'rotateX(25deg)' }}
                          >
                              {/* Metalloid plate rim */}
                              <div className="absolute inset-0.5 rounded-full border border-neutral-800 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900"></div>
                              {/* Real interactive lever shaft */}
                              <div 
                                 className="w-2.5 h-12 bg-gradient-to-t from-zinc-600 to-zinc-300 rounded-full origin-bottom transition-transform duration-700"
                                 style={{ 
                                    transform: item.collected ? 'rotateX(55deg) translateY(-8px)' : 'rotateX(-20deg) translateY(-8px)',
                                    boxShadow: '0 5px 10px rgba(0,0,0,0.5)'
                                 }}
                              />
                              {/* Lever handle jewel knob */}
                              <div 
                                 className="absolute w-4.5 h-4.5 rounded-full transition-all duration-700"
                                 style={{ 
                                    transform: item.collected ? 'translateY(-14px) translateZ(10px)' : 'translateY(-22px) translateZ(-4px)',
                                    backgroundColor: item.collected ? '#22c55e' : '#ef4444',
                                    boxShadow: item.collected ? '0 0 20px #22c55e' : '0 0 20px #ef4444'
                                 }}
                              />
                          </div>
                       </div>
                    ) : item.type === 'bomb' ? (
                       <Bomb3D 
                          collected={item.collected} 
                          isDefused={item.isDefused} 
                          isTriggered={item.isTriggered} 
                       />
                    ) : item.type === 'fossil' ? (
                       <Fossil3D subtype={item.subtype || 'skull'} collected={item.collected} />
                    ) : (
                       <Chest3D collected={item.collected} />
                    )}
                </div>
           ))}
      </div>

      {/* The cardboard cover canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.9))' }}
      />
    </div>
  );
}
