import React, { useState } from 'react';

interface Props {
  collected: boolean;
}

export function Chest3D({ collected }: Props) {
  return (
    <div className="w-16 h-14 relative" style={{ perspective: '400px' }}>
      <div 
        className={`w-full h-full relative transition-all duration-700`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: collected 
            ? 'rotateX(20deg) rotateY(-15deg) scale(0.9) translateY(-10px)' 
            : 'rotateX(15deg) rotateY(-10deg) hover:scale-105 hover:rotateY(-20deg)',
        }}
      >
        {/* GOLD GLOW SPARKLES WHEN OPENED */}
        {collected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="w-20 h-20 rounded-full bg-yellow-400/30 blur-xl animate-pulse" />
            
            {/* Real flying golden particles! */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 bg-yellow-300 rounded-full shadow-[0_0_8px_#facc15]"
                style={{
                  animation: `chestParticle ${0.6 + i * 0.15}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                  transformOrigin: 'center',
                  '--dx': `${(i - 2.5) * 30}px`,
                  '--dy': `${-70 - Math.random() * 50}px`,
                  '--rot': `${Math.random() * 360}deg`
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* CHEST LID (Rotates upward around its hinge when opened) */}
        <div 
          className="absolute top-0 left-0 w-full h-6 transition-transform duration-1000 ease-out z-20"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center bottom -12px',
            transform: collected ? 'rotateX(-120deg) translateY(-8px)' : 'rotateX(0deg)',
          }}
        >
          {/* Lid Top */}
          <div 
            className="absolute inset-0 bg-amber-900 border border-amber-950 shadow-inner flex justify-between px-1"
            style={{ 
              transform: 'rotateX(90deg) translateZ(12px)',
              backgroundImage: 'linear-gradient(to right, #451a03 10%, #78350f 30%, #451a03 50%, #78350f 70%, #451a03 90%)'
            }}
          >
            <div className="w-1 bg-yellow-600/70 h-full"></div>
            <div className="w-1 bg-yellow-600/70 h-full"></div>
          </div>
          {/* Lid Front */}
          <div 
            className="absolute inset-0 bg-amber-850 border border-amber-950 flex items-end justify-center"
            style={{ 
              transform: 'translateZ(12px)',
              backgroundImage: 'linear-gradient(to bottom, #78350f, #451a03)'
            }}
          >
            {/* Golden Lock latch decoration */}
            <div className="w-3 h-4 bg-yellow-500 rounded-b shadow-md border-t border-yellow-300 mb-[-3px] z-30 flex items-center justify-center">
              <div className="w-1 h-2 bg-neutral-900 rounded-full"></div>
            </div>
            <div className="absolute left-1 right-1 bottom-0 h-1 bg-yellow-600/80"></div>
          </div>
          {/* Lid Back */}
          <div 
            className="absolute inset-0 bg-amber-950"
            style={{ transform: 'rotateY(180deg) translateZ(12px)' }}
          />
          {/* Lid Left */}
          <div 
            className="absolute top-0 left-0 w-6 h-full bg-amber-900"
            style={{ 
              transform: 'rotateY(-90deg) translateZ(12px)',
              backgroundImage: 'linear-gradient(to bottom, #451a03, #1e0900)'
            }}
          />
          {/* Lid Right */}
          <div 
            className="absolute top-0 right-0 w-6 h-full bg-amber-900"
            style={{ 
              transform: 'rotateY(90deg) translateZ(12px)',
              backgroundImage: 'linear-gradient(to bottom, #451a03, #1e0900)'
            }}
          />
        </div>

        {/* CHEST BASE */}
        <div 
          className="absolute top-6 left-0 w-full h-8 z-10"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Base Front with golden trim */}
          <div 
            className="absolute inset-0 bg-amber-950 border border-amber-950 flex justify-between p-1 shadow-inner"
            style={{ 
              transform: 'translateZ(12px)',
              backgroundImage: 'linear-gradient(to bottom, #451a03, #1c0a00)'
            }}
          >
            {/* Lock slot receiver */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-yellow-600 rounded-b border border-yellow-700"></div>

            {/* Brass banding corners */}
            <div className="w-1.5 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 shadow-sm"></div>
            <div className="w-1.5 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 shadow-sm"></div>
          </div>

          {/* Base Back */}
          <div 
            className="absolute inset-0 bg-amber-950"
            style={{ transform: 'rotateY(180deg) translateZ(12px)' }}
          />

          {/* Base Left */}
          <div 
            className="absolute top-0 left-0 w-6 h-full bg-amber-950"
            style={{ 
              transform: 'rotateY(-90deg) translateZ(12px)',
              backgroundImage: 'linear-gradient(to right, #1c0a00, #3a1500)'
            }}
          />

          {/* Base Right */}
          <div 
            className="absolute top-0 right-0 w-6 h-full bg-amber-950"
            style={{ 
              transform: 'rotateY(90deg) translateZ(12px)',
              backgroundImage: 'linear-gradient(to left, #1c0a00, #3a1500)'
            }}
          />

          {/* Base Bottom */}
          <div 
            className="absolute inset-0 bg-neutral-900"
            style={{ transform: 'rotateX(-90deg) translateZ(12px)' }}
          />

          {/* Real gold heap inside the chest, rising up when open */}
          {collected && (
            <div 
              className="absolute inset-x-2 top-0.5 h-3 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_12px_#fbbf24]"
              style={{ transform: 'translateZ(0px) rotateX(25deg)' }}
            >
              <div className="absolute inset-0 bg-amber-400 opacity-80 blur-[1px]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
