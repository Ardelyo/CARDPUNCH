import React, { useState, useRef, useEffect } from 'react';
import { playStab } from '../utils/audio';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export function ActiveLeverHUD({ onComplete, onCancel }: Props) {
  const [angle, setAngle] = useState(-30); // Initial angle in degrees (-30deg to 90deg)
  const [isHolding, setIsHolding] = useState(false);
  const [success, setSuccess] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHolding || success) return;

    const onGlobalMove = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      // Pivot point is at the bottom-center of the lever chassis
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.85;

      const px = e.clientX;
      const py = e.clientY;

      // Calculate angle in degrees
      const rad = Math.atan2(py - cy, px - cx);
      let deg = rad * (180 / Math.PI);

      // Convert to a friendly range where -90 is straight up, -180/180 is left/right
      // We want the lever to sweep from -50 (top-left) to 90 (bottom-right)
      if (deg < -150) deg = -150;
      if (deg > 110) deg = 110;

      // Smoothly constrain between -45 (unlocked/neutral) and 85 (fully engaged)
      const clampedDeg = Math.min(Math.max(-45, deg), 85);
      setAngle(clampedDeg);

      // Play friction vibrator ticking if angle changes significantly
      if (Math.abs(clampedDeg - angle) > 5) {
        try {
          if (navigator.vibrate) navigator.vibrate(12);
        } catch (err) {}
      }

      // Trigger complete if pulled all the way!
      if (clampedDeg >= 80) {
        setSuccess(true);
        setIsHolding(false);
        try {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } catch (err) {}
        
        // Secondary heavy clank success sound
        playStab();
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };

    const onGlobalUp = () => {
      setIsHolding(false);
      // Spring back if not succeeded
      if (!success) {
        const start = angle;
        const duration = 200; // ms
        const startTime = performance.now();

        const animateSpring = (now: number) => {
          const elapsed = now - startTime;
          if (elapsed < duration) {
            const t = elapsed / duration;
            const ease = 1 - Math.pow(1 - t, 3);
            setAngle(start - (start - (-30)) * ease);
            requestAnimationFrame(animateSpring);
          } else {
            setAngle(-30);
          }
        };
        requestAnimationFrame(animateSpring);
      }
    };

    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [isHolding, success, angle, onComplete]);

  // Use setPointerCapture to prevent any touch drag event loss on mobile!
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (success) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    setIsHolding(true);
  };

  const progressPercent = Math.min(100, Math.max(0, ((angle + 30) / 110) * 100));

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-6 rounded-md select-none touch-none border-4 border-neutral-800 shadow-2xl">
      {/* Header */}
      <div className="text-center mt-3 w-full">
        <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest animate-pulse font-sans">
          ⚙️ SISTEM TUAS PENGHUBUNG ⚙️
        </span>
        <h2 className="text-base font-bold font-sans text-neutral-200 mt-1 uppercase tracking-widest">
          Ayo Tarik Tuasnya
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[270px] mx-auto leading-relaxed">
          Tarik tuas besi ini memutar ke kanan bawah sampai mentok untuk membuka gerbang selanjutnya.
        </p>
      </div>

      {/* Tactile Control Panel */}
      <div 
        ref={trackRef}
        style={{ touchAction: 'none' }}
        className="w-full max-w-[280px] h-60 bg-neutral-900 border border-neutral-700 rounded-xl relative flex flex-col items-center justify-end pb-8 shadow-inner cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerDown={handlePointerDown}
      >
        {/* Steel Backplate with warning stripe marks */}
        <div className="absolute inset-0 opacity-10 pointer-events-none stripes-bg" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, transparent 10px, transparent 20px)'
        }} />

        {/* Angular Tick Marks on plate */}
        <div className="absolute top-10 w-44 h-44 rounded-full border-t border-dashed border-neutral-700 pointer-events-none flex justify-between items-center px-4 font-sans text-neutral-500">
          <span className="text-[10px] font-black -translate-y-4">-30°</span>
          <span className="text-[10px] font-black -translate-y-12">30°</span>
          <span className="text-[10px] text-neutral-400 font-black -translate-y-4 font-sans">MENTOK</span>
        </div>

        {/* Connection Chassis / Hinge Pivot Point */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 relative z-10 flex items-center justify-center shadow-lg mb-1">
          {/* Bolts around chassis wheel */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1.5 h-1.5 bg-neutral-950 rounded-full border border-neutral-800 shadow-sm"
              style={{
                transform: `rotate(${i * 60}deg) translateY(22px)`
              }}
            />
          ))}

          {/* Golden Core Hub Cap */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-600 border border-neutral-800 shadow-inner flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-500" />
            </div>
          </div>
        </div>

        {/* LEVER ARM SHAFT & TIP HANDLE */}
        <div 
          className="absolute origin-bottom transition-transform duration-75 pointer-events-none"
          style={{
            bottom: '44px', // aligned with bottom-center of the hinge chassis
            height: '110px',
            width: '20px',
            transform: `rotate(${angle}deg)`,
            transformOrigin: '50% 100%'
          }}
        >
          {/* Iron Shaft */}
          <div className="w-3.5 h-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-400 mx-auto border-x border-zinc-600 shadow-xl flex flex-col justify-between">
            <div className="w-full h-8 bg-gradient-to-b from-zinc-700 to-transparent" />
            {/* Grip grooves on shaft */}
            <div className="flex flex-col gap-1 items-center pb-8">
              <div className="w-2.5 h-0.5 bg-zinc-400" />
              <div className="w-2.5 h-0.5 bg-zinc-400" />
              <div className="w-2.5 h-0.5 bg-zinc-400" />
            </div>
          </div>

          {/* Heavy Red Gloss Knobby Handle */}
          <div 
            className={`absolute -top-7 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-red-950 shadow-2xl transition-all duration-150 flex items-center justify-center ${
              isHolding ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              backgroundImage: 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #dc2626 40%, #7f1d1d 90%)',
              boxShadow: success 
                ? '0 0 30px #22c55e, inset -2px -2px 8px rgba(0,0,0,0.6)' 
                : isHolding 
                ? '0 0 20px rgba(220,38,38,0.4), inset -2px -2px 8px rgba(0,0,0,0.6)' 
                : '0 8px 12px rgba(0,0,0,0.6), inset -2px -2px 8px rgba(0,0,0,0.6)'
            }}
          >
            {/* Golden lock status icon inside knob */}
            <div className="w-4 h-4 text-neutral-100 flex items-center justify-center opacity-70">
              {success ? (
                <svg className="w-4 h-4 fill-green-400" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              ) : (
                <svg className="w-4 h-4 fill-red-200" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              )}
            </div>
          </div>
        </div>

        {/* Progress feedback bar overlay */}
        <div className="absolute bottom-2 inset-x-8 h-1.5 bg-neutral-950 rounded-full border border-neutral-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-75 ${success ? 'bg-neutral-400' : 'bg-neutral-600'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Instructions / Action Prompt */}
      <div className="text-center mb-4 flex flex-col gap-2">
        <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider font-sans">
          {success ? '🔓 POWER AKTIF' : isHolding ? 'ROTASI KE BAWAH...' : 'TARIK TUAS'}
        </span>
        <button 
          onClick={onCancel}
          disabled={success}
          className="text-neutral-400 px-3 py-1 text-[10px] font-extrabold border border-neutral-700 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-all uppercase hover:text-neutral-200 disabled:opacity-30 disabled:pointer-events-none"
        >
          Kembali ke Kardus
        </button>
      </div>
    </div>
  );
}
