import React from 'react';

interface Props {
  collected: boolean;
  isDefused?: boolean;
  isTriggered?: boolean;
}

export function Bomb3D({ collected, isDefused, isTriggered }: Props) {
  return (
    <div className="w-16 h-16 relative" style={{ perspective: '400px' }}>
      <div 
        className="w-full h-full relative transition-all duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: 'rotateX(10deg) rotateY(-10deg)',
        }}
      >
        {/* GLOWING AND SPARKS */}
        {isTriggered && !isDefused && !collected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            {/* Pulsing alarm aura */}
            <div className="w-24 h-24 rounded-full bg-red-600/20 blur-lg animate-ping duration-1000" />
            <div className="w-16 h-16 rounded-full bg-red-600/30 blur-md animate-pulse" />
          </div>
        )}

        {/* FUSE CAP / top part */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-3 bg-neutral-700 border border-neutral-900 rounded-t z-20 flex justify-center">
          {/* Spark burning wire */}
          {!isDefused && !collected && (
            <div className="absolute -top-4 w-1 h-4 bg-amber-800 rounded-full origin-bottom">
              {/* Burning flame spark */}
              <div 
                className="absolute -top-1.5 -left-1 w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-[0_0_10px_#ef4444]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fef08a 0%, #f97316 70%, #ef4444 100%)',
                  animationDuration: '0.15s'
                }}
              />
            </div>
          )}
        </div>

        {/* THE MAIN BOMB SPHERE */}
        <div 
          className="absolute inset-x-1 bottom-1 top-2 bg-neutral-800 rounded-full border border-neutral-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle at 35% 35%, #525252 0%, #171717 80%)',
            boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.8), inset 5px 5px 15px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.5)'
          }}
        >
          {/* Metallic horizontal bands */}
          <div className="absolute inset-x-0 h-1 bg-neutral-950/40 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-y-0 w-1 bg-neutral-950/40 left-1/2 -translate-x-1/2" />

          {/* Danger sign or digital clock display */}
          <div className="z-10 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800 flex items-center justify-center scale-90">
            {isDefused ? (
              <span className="text-[10px] text-green-400 font-mono font-bold tracking-wider">OK</span>
            ) : collected ? (
              <span className="text-[10px] text-red-500 font-mono font-bold tracking-wider">X_X</span>
            ) : isTriggered ? (
              <span className="text-[10px] text-red-500 font-mono font-bold animate-pulse">0:01</span>
            ) : (
              <span className="text-[10px] text-yellow-500 font-mono font-bold">READY</span>
            )}
          </div>

          {/* Blinking red alarm light (or green if defused) */}
          <div 
            className={`mt-1.5 w-3.5 h-3.5 rounded-full border border-neutral-950 shadow-inner transition-all duration-300 ${
              isDefused 
                ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' 
                : collected 
                ? 'bg-neutral-900' 
                : isTriggered 
                ? 'bg-red-500 animate-ping shadow-[0_0_12px_#ef4444]' 
                : 'bg-red-700 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
            }`}
          />
        </div>

        {/* BRASS BINDINGS Around Sphere */}
        <div className="absolute inset-x-2 bottom-2 top-3 rounded-full border border-yellow-800/10 pointer-events-none" />
      </div>
    </div>
  );
}
