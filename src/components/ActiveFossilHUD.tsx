import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HiddenItem } from '../types';
import { Fossil3D } from './Fossil3D';

interface Props {
  item: HiddenItem;
  onComplete: () => void;
}

export function ActiveFossilHUD({ item, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBrushing, setIsBrushing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill with dirt (darker gray/brown)
    ctx.fillStyle = '#6b5e52'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise/texture to make it look like soil
    for (let i = 0; i < 800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#574c42' : '#7c6d60';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4 + Math.random() * 4, 4 + Math.random() * 4);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
        e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    setIsBrushing(true);
    handlePointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsBrushing(false);
    try {
        e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    checkProgress();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isBrushing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Use a soft brush
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 35);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Check progress occasionally to avoid lag
    if (Math.random() > 0.85) {
        checkProgress();
    }
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    // Sample every 4th pixel for performance
    for (let i = 3; i < imageData.data.length; i += 16) {
      if (imageData.data[i] < 128) {
        transparentPixels++;
      }
    }
    const totalSamples = (canvas.width * canvas.height) / 4;
    const currentProgress = transparentPixels / totalSamples;
    
    // Scale progress artificially slightly so they don't have to get 100%
    const normalized = Math.min(1.0, currentProgress * 1.5);
    setProgress(normalized);

    if (normalized >= 0.95) {
      setTimeout(onComplete, 200);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 touch-none"
    >
      <div className="absolute top-24 text-center font-bold text-white text-3xl w-full px-4 drop-shadow-lg">
         Gosok Kotorannya! 🖌️
         <div className="max-w-[250px] w-full h-4 bg-white/20 rounded-full mt-4 mx-auto overflow-hidden border border-white/30">
            <div 
              className={`h-full transition-all duration-300 ${progress >= 0.95 ? 'bg-green-400' : 'bg-amber-400'}`} 
              style={{ width: `${progress * 100}%` }} 
            />
         </div>
      </div>

      <div className="relative w-80 h-80 cursor-crosshair">
         <div className="absolute inset-0 flex items-center justify-center scale-[4.5] touch-none pointer-events-none">
            <Fossil3D subtype={item.subtype || 'skull'} collected={false} />
         </div>
         {/* We place canvas above the fossil */}
         <canvas
           ref={canvasRef}
           onPointerDown={handlePointerDown}
           onPointerUp={handlePointerUp}
           onPointerMove={handlePointerMove}
           onPointerCancel={handlePointerUp}
           className="absolute inset-0 w-full h-full rounded-2xl touch-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
           style={{ touchAction: 'none' }} // Critical for preventing scrolling on mobile
         />
      </div>
    </motion.div>
  );
}
