import React, { useState, useEffect, useRef } from 'react';
import { playStab } from '../utils/audio';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export function ActiveChestHUD({ onComplete, onCancel }: Props) {
  // States: 'insert' (sliding key into keyhole) | 'twist' (twisting key) | 'open' (complete)
  const [phase, setPhase] = useState<'insert' | 'twist' | 'open'>('insert');
  
  // Slide position for the insert phase (0 to 100 percentage)
  const [slideX, setSlideX] = useState(10);
  const [isSliding, setIsSliding] = useState(false);

  // Rotate angle for the twist phase (0 to 90 degrees)
  const [twistAngle, setTwistAngle] = useState(0);
  const [isTwisting, setIsTwisting] = useState(false);

  const [success, setSuccess] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Handle mobile and desktop key sliding
  useEffect(() => {
    if (phase !== 'insert' || !isSliding) return;

    const onGlobalMove = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedX = Math.min(Math.max(10, relativeX), 82);
      setSlideX(clampedX);

      try {
        if (navigator.vibrate) navigator.vibrate(8);
      } catch (err) {}

      // If key reaches keyhole (around 80% to 82%), snap and advance to TWIST phase!
      if (clampedX >= 79) {
        setIsSliding(false);
        setPhase('twist');
        playStab(); // Satisfying click sound
        try {
          if (navigator.vibrate) navigator.vibrate([15, 10, 30]);
        } catch (err) {}
      }
    };

    const onGlobalUp = () => {
      setIsSliding(false);
    };

    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [phase, isSliding]);

  // Handle key twisting in phase 2
  useEffect(() => {
    if (phase !== 'twist' || !isTwisting) return;

    const onGlobalMove = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const cy = rect.top + rect.height / 2;
      const cx = rect.left + rect.width * 0.8; // around the keyhole

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const rad = Math.atan2(dy, dx);
      let deg = rad * (180 / Math.PI);

      if (deg < 0) deg = 0;
      if (deg > 95) deg = 95;

      const clampedAngle = Math.min(Math.max(0, deg), 90);
      setTwistAngle(clampedAngle);

      try {
        if (navigator.vibrate && Math.floor(clampedAngle) % 15 === 0) {
          navigator.vibrate(6);
        }
      } catch (err) {}

      // Twist completely to 90 degrees to unlock chest!
      if (clampedAngle >= 88) {
        setIsTwisting(false);
        setPhase('open');
        setSuccess(true);
        playStab(); // Pop clank
        try {
          if (navigator.vibrate) navigator.vibrate([100, 40, 200]);
        } catch (err) {}

        // Complete the HUD
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    };

    const onGlobalUp = () => {
      setIsTwisting(false);
      // spring twist back if released early
      if (!success) {
        const start = twistAngle;
        const duration = 200;
        const startTime = performance.now();
        const anim = (now: number) => {
          const t = (now - startTime) / duration;
          if (t < 1) {
            setTwistAngle(start * (1 - t));
            requestAnimationFrame(anim);
          } else {
            setTwistAngle(0);
          }
        };
        requestAnimationFrame(anim);
      }
    };

    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [phase, isTwisting, twistAngle, success, onComplete]);

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-6 rounded-md select-none touch-none border-4 border-amber-600 shadow-2xl">
      
      {/* Header */}
      <div className="text-center mt-3 w-full">
        <span className="text-xs text-amber-500 font-bold uppercase tracking-widest animate-pulse font-sans">
          🗝️ GEMBOK KUNINGAN 🗝️
        </span>
        <h2 className="text-base font-bold font-sans text-neutral-200 mt-1 uppercase tracking-widest">
          Ayo Putar Kuncinya
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[270px] mx-auto leading-relaxed">
          {phase === 'insert' 
            ? 'Geser kunci usang di bawah ke dalam lubang!' 
            : phase === 'twist' 
            ? 'Kunci terpasang. Putar kunci searah jarum jam untuk meretas gembok.' 
            : '🔓 BERHASIL TERBUKA! Wow, harta karun yang indah berkilau.'
          }
        </p>
      </div>

      {/* Main Chest Lockbox Display Area */}
      <div 
        ref={trackRef}
        style={{ touchAction: 'none' }}
        className="w-full max-w-[280px] h-52 bg-neutral-900 border border-neutral-700 rounded-xl relative flex flex-col justify-center items-center shadow-inner overflow-hidden"
      >
        {/* Subtle wooden plank paneling behind */}
        <div className="absolute inset-y-0 w-px bg-neutral-800 left-1/4" />
        <div className="absolute inset-y-0 w-px bg-neutral-800 left-1/2" />
        <div className="absolute inset-y-0 w-px bg-neutral-800 left-3/4" />

        {/* Vintage Heavy Metal Lockplate in Center */}
        <div 
          className="w-28 h-28 rounded-lg bg-neutral-900 border border-neutral-600 flex flex-col items-center justify-center relative shadow-lg z-10"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #262626 0%, #0a0a0a 95%)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          {/* Iron corner bolts */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 bg-neutral-500 rounded-full border border-neutral-800" 
              style={{
                top: i < 2 ? '6px' : 'auto',
                bottom: i >= 2 ? '6px' : 'auto',
                left: i % 2 === 0 ? '6px' : 'auto',
                right: i % 2 !== 0 ? '6px' : 'auto'
              }}
            />
          ))}

          {/* Keyhole frame */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border border-amber-800 flex items-center justify-center relative shadow-md z-20">
            {/* The inner rotation slot core */}
            <div 
              className="w-9 h-9 rounded-full bg-black border border-amber-900 flex items-center justify-center relative transition-all duration-300"
              style={{
                transform: `rotate(${twistAngle}deg)`
              }}
            >
              {/* Actual Keyhole notch shape */}
              <div className="w-2 h-5 bg-neutral-950 rounded-b relative flex justify-center">
                <div className="absolute -top-1 w-3.5 h-3.5 bg-neutral-950 rounded-full" />
              </div>

              {/* The Key's Bit inside the keyhole (Only visible when inserted) */}
              {phase !== 'insert' && (
                <div 
                  className="absolute w-4 h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-sm"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* --- PHASE 1: Slide Key Track --- */}
        {phase === 'insert' && (
          <div className="absolute inset-x-3 bottom-3 h-11 bg-black/80 border border-neutral-800 rounded-lg flex items-center px-1.5 shadow-inner z-20">
            {/* Soft guide line */}
            <div className="absolute left-8 right-12 h-0.5 border-t border-dashed border-neutral-700 pointer-events-none" />

            {/* Interactive draggable Key */}
            <div 
              onPointerDown={(e) => {
                e.preventDefault();
                setIsSliding(true);
              }}
              style={{
                left: `${slideX}%`,
                touchAction: 'none'
              }}
              className={`absolute cursor-grab active:cursor-grabbing flex items-center transition-transform hover:scale-105 active:scale-95 ${
                isSliding ? 'scale-110' : ''
              }`}
            >
              {/* Golden skeleton key design */}
              <div 
                className="w-14 h-6 flex items-center relative opacity-80"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
              >
                {/* Loop handle ring */}
                <div className="w-5 h-5 rounded-full border-2 border-amber-600 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                </div>
                {/* Stem shaft */}
                <div className="w-8 h-1.5 bg-gradient-to-r from-amber-600 to-amber-700 border-y border-amber-800" />
                {/* Key bit (the teeth) */}
                <div className="w-2.5 h-3 items-end absolute right-1 top-2.5 bg-amber-600 border border-amber-800 rounded-b flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-neutral-900" />
                  <div className="w-full h-0.5 bg-neutral-900" />
                </div>
              </div>

              {/* Action Finger Indicator helper overlay */}
              {!isSliding && (
                <div className="absolute -top-3 left-1 flex flex-col items-center animate-bounce pointer-events-none">
                  <span className="text-[8px] bg-neutral-700 text-neutral-300 px-1 py-0.5 font-bold rounded shadow font-sans">SERET</span>
                </div>
              )}
            </div>

            {/* Target text on right */}
            <div className="absolute right-4 text-[9px] text-neutral-600 font-bold tracking-widest uppercase animate-pulse font-sans">
              LUBANG ▶
            </div>
          </div>
        )}

        {/* --- PHASE 2: Twist Key Interactive Area --- */}
        {phase === 'twist' && (
          <div 
            onPointerDown={(e) => {
              e.preventDefault();
              setIsTwisting(true);
            }}
            style={{ touchAction: 'none' }}
            className={`absolute z-30 cursor-grab active:cursor-grabbing w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center transition-all ${
              isTwisting ? 'scale-110 bg-neutral-800/50' : 'hover:scale-105'
            }`}
          >
            {/* Outer grip circular dash */}
            <svg className="absolute w-full h-full animate-spin-slow text-neutral-600" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
            </svg>

            {/* Arrow indicators showing clockwise direction curve */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
              <span className="text-[10px] text-neutral-400 font-extrabold animate-pulse uppercase tracking-wider font-sans">◀ PUTAR</span>
            </div>
          </div>
        )}

        {/* --- PHASE 3: Open Golden Burst sparks --- */}
        {phase === 'open' && (
          <div className="absolute inset-0 bg-yellow-900/10 pointer-events-none animate-pulse flex items-center justify-center z-40">
            <div className="w-24 h-24 bg-yellow-600 rounded-full blur-2xl opacity-40 animate-ping" />
            <span className="text-yellow-500 font-extrabold tracking-widest text-sm text-center font-sans">
              🔓 TERBUKA
            </span>
          </div>
        )}
      </div>

      {/* Footer Instructions / Cancel Button */}
      <div className="text-center mb-2 flex flex-col gap-2">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest font-sans">
          {success ? '🌟 GEMBOK TERBUKA' : phase === 'twist' ? '✦ PUTAR KUNCI' : '✦ GESER KUNCI'}
        </span>
        <button 
          onClick={onCancel}
          disabled={success}
          className="text-neutral-500 px-3 py-1 text-[10px] font-extrabold border border-neutral-800 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-all uppercase hover:text-neutral-300 disabled:opacity-30 disabled:pointer-events-none"
        >
          Kembali ke Kardus
        </button>
      </div>
    </div>
  );
}
