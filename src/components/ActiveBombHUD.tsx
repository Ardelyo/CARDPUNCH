import React, { useState, useEffect, useRef } from 'react';
import { playStab } from '../utils/audio';

interface Props {
  onComplete: () => void;
  onExplode: () => void;
  onCancel: () => void;
}

export function ActiveBombHUD({ onComplete, onExplode, onCancel }: Props) {
  const [pressure, setPressure] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [targetMin] = useState(55 + Math.floor(Math.random() * 10)); // random green target between 55%
  const [targetMax] = useState(targetMin + 18); // narrow 18% width slot
  const [timerLeft, setTimerLeft] = useState(6.00); // 6s countdown
  const [active, setActive] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chargeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    // Countdown clock
    timerIntervalRef.current = setInterval(() => {
      setTimerLeft(t => {
        if (t <= 0.03) {
          clearInterval(timerIntervalRef.current!);
          // BOOM! Timer reached 0!
          triggerBoom();
          return 0;
        }
        return Number((t - 0.02).toFixed(2));
      });
    }, 20);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [active]);

  // Charging mechanism
  useEffect(() => {
    if (!active || !isCharging) return;

    const chargeInterval = setInterval(() => {
      const next = chargeRef.current + 2.5;
      if (next >= 100) {
        chargeRef.current = 100;
        setPressure(100);
        clearInterval(chargeInterval);
        // Overcharged! It blows up!
        triggerBoom();
      } else {
         chargeRef.current = next;
         setPressure(next);
      }
      try {
        if (navigator.vibrate) navigator.vibrate(10);
      } catch (e) {}
    }, 25);

    return () => clearInterval(chargeInterval);
  }, [isCharging, active]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!active) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    setIsCharging(true);
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (!active || !isCharging) return;
    setIsCharging(false);
    
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    // Evaluate pressure release spot
    const currentVal = chargeRef.current;
    if (currentVal >= targetMin && currentVal <= targetMax) {
      // Safe defusal!
      handleDefused();
    } else {
      // Failed defusal -> Trigger explosion!
      triggerBoom();
    }
  };

  const handleDefused = () => {
    setActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    try {
      if (navigator.vibrate) navigator.vibrate([40, 40, 150]);
    } catch (e) {}
    playStab(); // play a clear clank trigger
    setTimeout(() => {
      onComplete();
    }, 850);
  };

  const triggerBoom = () => {
    setActive(false);
    setIsCharging(false);
    setPressure(100);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Multi shake vibration
    try {
      if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 400]);
    } catch (e) {}

    setTimeout(() => {
      onExplode();
    }, 300);
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-6 rounded-md select-none touch-none border-4 border-red-900 shadow-2xl">
      {/* HUD Header */}
      <div className="text-center mt-3 w-full">
        <div className="flex justify-center items-center gap-1.5 text-xs text-red-500 font-bold uppercase tracking-widest animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 block animate-ping" />
          <span>⚠️ BAHAYA LEDAKAN ⚠️</span>
        </div>
        <h2 className="text-base font-bold font-sans text-neutral-200 mt-1 uppercase tracking-widest">
          Jinakkan Petasan
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[270px] mx-auto leading-relaxed">
          Tahan tombol merah untuk mengisi tekanan. Lepaskan <span className="text-neutral-200 font-extrabold text-xs">PAS DI SEGMENT AMAN</span> untuk memotong sumbu!
        </p>
      </div>

      {/* Ticking Bomb core Timer HUD */}
      <div className="flex items-center gap-4 py-2 border-y border-neutral-800 w-full justify-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-neutral-500 font-extrabold tracking-widest uppercase font-sans">Sisa Sumbu</span>
          <span className={`font-mono text-xl font-black tracking-wider ${timerLeft < 2.5 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
            {timerLeft.toFixed(2)}s
          </span>
        </div>
        <div className="w-0.5 h-8 bg-neutral-800" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-neutral-500 font-extrabold tracking-widest uppercase font-sans">Tekanan</span>
          <span className={`text-base font-black font-mono tracking-widest ${pressure < targetMin ? 'text-amber-500' : pressure > targetMax ? 'text-red-500' : 'text-neutral-300'}`}>
            {pressure.toFixed(0)} PSI
          </span>
        </div>
      </div>

      {/* Dynamic CALIBRATION PRESSURE GAUGE slider */}
      <div className="w-full max-w-[260px] h-36 border border-neutral-800 bg-neutral-900 rounded-xl relative flex flex-col justify-end p-4 shadow-inner overflow-hidden">
        {/* Highlight target zone inside the gauge track */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-8 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center relative overflow-hidden">
          {/* Target Safe Segment */}
          <div 
            className="absolute h-full bg-neutral-800/80 border-x border-neutral-600 flex items-center justify-center"
            style={{
              left: `${targetMin}%`,
              width: `${targetMax - targetMin}%`
            }}
          >
            <div className="w-full text-center text-[10px] font-sans font-black text-neutral-400 uppercase tracking-widest pointer-events-none">
              AMAN
            </div>
          </div>

          {/* Sliding Indicator Point overlay */}
          <div 
            className="absolute h-10 w-2.5 bg-red-600 rounded border border-neutral-950 shadow-[0_0_8px_#dc2626] transition-all duration-75 z-10"
            style={{
              left: `calc(${pressure}% - 5px)`,
            }}
          />
        </div>

        {/* Gauge Ticks */}
        <div className="flex justify-between text-[9px] text-neutral-600 font-extrabold px-1 mt-0.5 pointer-events-none mb-10 z-10 font-sans tracking-widest">
          <span>000</span>
          <span>050</span>
          <span>100</span>
        </div>

        {/* Underlay Warning text */}
        <div className="absolute inset-x-4 bottom-2 text-center">
          <span className="text-[10px] text-neutral-500 font-sans font-black tracking-widest uppercase">
            {pressure >= targetMin && pressure <= targetMax ? '✨ LEPAS SEKARANG ✨' : 'TAHAN TOMBOL'}
          </span>
        </div>
      </div>

      {/* Tactile Contact Charge Button */}
      <div className="w-full flex flex-col items-center gap-3">
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-36 h-14 rounded-xl font-sans font-black uppercase tracking-widest text-xs border-b-4 flex flex-col items-center justify-center select-none active:scale-95 active:border-b-2 active:mt-0.5 transition-all outline-none ${
            isCharging 
              ? 'bg-neutral-800 text-red-500 border-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
              : 'bg-neutral-800 text-neutral-400 border-neutral-900 shadow-md'
          }`}
          style={{ touchAction: 'none' }}
        >
          <span className="font-sans font-black tracking-widest text-sm">
            {isCharging ? 'MENGISI...' : 'TAHAN'}
          </span>
          <span className="text-[8px] font-black opacity-50 tracking-widest">LEPAS PAS DI TARGET</span>
        </button>

        <button 
          onClick={onCancel}
          disabled={!active}
          className="text-neutral-500 px-3 py-1 text-[10px] font-extrabold border border-neutral-800 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-all uppercase hover:text-neutral-300 tracking-widest"
        >
          Kembali ke Kardus
        </button>
      </div>
    </div>
  );
}
