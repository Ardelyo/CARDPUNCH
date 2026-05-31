import { useState, useEffect } from 'react';
import { CardboardLayer } from './components/CardboardLayer';
import { HiddenItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveLeverHUD } from './components/ActiveLeverHUD';
import { ActiveBombHUD } from './components/ActiveBombHUD';
import { ActiveChestHUD } from './components/ActiveChestHUD';
import { KidLearningZone } from './components/KidLearningZone';
import { ActiveFossilHUD } from './components/ActiveFossilHUD';
import { FossilGallery } from './components/FossilGallery';

function generateItems(level: number): HiddenItem[] {
  const items: HiddenItem[] = [];
  
  const checkOverlap = (x: number, y: number, size: number) => {
    return items.some(item => Math.hypot(item.x - x, item.y - y) < (item.size + size) * 0.55);
  };

  // Create exactly 1 Lever to progress
  let tries = 0;
  let lx = 0.3 + Math.random() * 0.4;
  let ly = 0.3 + Math.random() * 0.4;
  items.push({
     id: `lever-${level}`,
     type: 'lever',
     x: lx,
     y: ly,
     size: 0.15, // 15% width
     discovered: false,
     collected: false,
  });

  // From Level 2 onwards, generate hidden bombs!
  if (level >= 2) {
    const bombCount = Math.min(Math.floor(Math.random() * 1.5) + 1, level - 1);
    for (let i = 0; i < bombCount; i++) {
       let bx = 0, by = 0;
       tries = 0;
       do {
         bx = 0.15 + Math.random() * 0.7;
         by = 0.15 + Math.random() * 0.7;
         tries++;
       } while (checkOverlap(bx, by, 0.14) && tries < 30);

       items.push({
         id: `bomb-${level}-${i}`,
         type: 'bomb',
         x: bx,
         y: by,
         size: 0.14,
         discovered: false,
         collected: false,
         isDefused: false,
         isTriggered: false,
       });
    }
  }

  // Random Treasures (Cutiest little treasure chests!)
  const treasureCount = Math.floor(Math.random() * 2) + 1; // 1-2 treasures
  for(let i = 0; i < treasureCount; i++) {
     let tx = 0, ty = 0;
     tries = 0;
     do {
       tx = 0.12 + Math.random() * 0.76;
       ty = 0.12 + Math.random() * 0.76;
       tries++;
     } while (checkOverlap(tx, ty, 0.1) && tries < 30);

     items.push({
       id: `t-${level}-${i}`,
       type: 'treasure',
       x: tx,
       y: ty,
       size: 0.1,
       discovered: false,
       collected: false,
     });
  }

  // Dinosaur Fossils
  const fossilCount = Math.floor(Math.random() * 2) + 1; // 1-2 fossils
  const fossilSubtypes: ('skull' | 'ribs' | 'spine' | 'leg')[] = ['skull', 'ribs', 'spine', 'leg'];
  for(let i = 0; i < fossilCount; i++) {
     let fx = 0, fy = 0;
     tries = 0;
     do {
       fx = 0.12 + Math.random() * 0.76;
       fy = 0.12 + Math.random() * 0.76;
       tries++;
     } while (checkOverlap(fx, fy, 0.12) && tries < 30);

     items.push({
       id: `f-${level}-${i}`,
       type: 'fossil',
       subtype: fossilSubtypes[Math.floor(Math.random() * fossilSubtypes.length)],
       x: fx,
       y: fy,
       size: 0.12,
       discovered: false,
       collected: false,
     });
  }

  return items;
}

export default function App() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<HiddenItem[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [boxDimensions, setBoxDimensions] = useState({ width: 350, height: 450 });
  
  // High-level States
  const [learningItem, setLearningItem] = useState<HiddenItem | null>(null);
  const [activeLeverItem, setActiveLeverItem] = useState<HiddenItem | null>(null);
  const [activeBombItem, setActiveBombItem] = useState<HiddenItem | null>(null);
  const [activeChestItem, setActiveChestItem] = useState<HiddenItem | null>(null);
  const [activeFossilItem, setActiveFossilItem] = useState<HiddenItem | null>(null);
  const [collectedFossils, setCollectedFossils] = useState<('skull' | 'ribs' | 'spine' | 'leg')[]>([]);
  const [showFossilGallery, setShowFossilGallery] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'red' | 'white' | null>(null);

  useEffect(() => {
    setItems(generateItems(level));
    setLearningItem(null);
    setActiveLeverItem(null);
    setActiveBombItem(null);
    setActiveChestItem(null);
    setActiveFossilItem(null);
  }, [level]);

  useEffect(() => {
     const updateSize = () => {
         const padding = 20;
         let w = window.innerWidth - padding * 2;
         let h = window.innerHeight - padding * 2 - 120; // reserve space for UI
         
         const maxWidth = 450;
         if (w > maxWidth) w = maxWidth;
         const expectedHeight = w * (4/3); // 3:4 aspect ratio 
         
         if (expectedHeight > h) {
             w = h * (3/4);
         } else {
             h = expectedHeight;
         }
         
         setBoxDimensions({ width: w, height: h });
     };
     
     updateSize();
     window.addEventListener('resize', updateSize);
     return () => window.removeEventListener('resize', updateSize);
  }, []);

  // When a kid taps an item, trigger the educational game first!
  const handleItemClick = (item: HiddenItem) => {
    if (item.collected || isTransitioning) return;
    
    if (item.type === 'bomb') {
       // Bombs skip the learning challenge and instantly trigger!
       setItems(prev => prev.map(i => i.id === item.id ? { ...i, isTriggered: true } : i));
       setActiveBombItem(item);
    } else {
       setLearningItem(item);
    }
  };

  // When the educational challenge is solved correctly
  const handleLearningSuccess = () => {
    if (!learningItem) return;
    const item = learningItem;
    setLearningItem(null); // Close learning window

    // Launch the specific tool's physical HUD game interaction!
    if (item.type === 'treasure') {
       setActiveChestItem(item);
    } else if (item.type === 'lever') {
       setActiveLeverItem(item);
    } else if (item.type === 'fossil') {
       setActiveFossilItem(item);
    } else if (item.type === 'bomb') {
       setItems(prev => prev.map(i => i.id === item.id ? { ...i, isTriggered: true } : i));
       setActiveBombItem(item);
    }
  };

  const handleLeverComplete = () => {
     if (!activeLeverItem) return;
     const targetId = activeLeverItem.id;
     setItems(prev => prev.map(i => i.id === targetId ? { ...i, collected: true } : i));
     setActiveLeverItem(null);

     // Play white flash transition
     setScreenFlash('white');
     setTimeout(() => setScreenFlash(null), 400);

     setIsTransitioning(true);
     setTimeout(() => {
        setLevel(l => l + 1);
        setIsTransitioning(false);
     }, 900);
  };

  const handleBombDisarmComplete = () => {
     if (!activeBombItem) return;
     const targetId = activeBombItem.id;
     setItems(prev => prev.map(i => i.id === targetId ? { ...i, collected: true, isDefused: true } : i));
     setActiveBombItem(null);
     setScore(s => s + 100 * level); // Smart points added
  };

  const handleBombExplode = () => {
     if (!activeBombItem) return;
     const targetId = activeBombItem.id;
     setItems(prev => prev.map(i => i.id === targetId ? { ...i, collected: true, isDefused: false } : i));
     setActiveBombItem(null);
     
     // Subtract some score as penalty
     setScore(s => Math.max(0, s - 50 * level));

     setScreenFlash('red');
     setTimeout(() => setScreenFlash(null), 850);
  };

  const handleChestComplete = () => {
     if (!activeChestItem) return;
     const targetId = activeChestItem.id;
     setItems(prev => prev.map(i => i.id === targetId ? { ...i, collected: true } : i));
     setActiveChestItem(null);
     setScore(s => s + 50 * level);
  };

  const handleFossilComplete = () => {
     if (!activeFossilItem) return;
     const targetId = activeFossilItem.id;
     const subtype = activeFossilItem.subtype as 'skull' | 'ribs' | 'spine' | 'leg';

     setItems(prev => prev.map(i => i.id === targetId ? { ...i, collected: true } : i));
     setActiveFossilItem(null);
     setScore(s => s + 75 * level);

     if (subtype && !collectedFossils.includes(subtype)) {
        const newCollected = [...collectedFossils, subtype];
        setCollectedFossils(newCollected);
        if (newCollected.length === 4) {
           setTimeout(() => setShowFossilGallery(true), 1500);
        }
     }
  };

  return (
    <div className={`fixed inset-0 bg-[#0c0c0c] text-neutral-200 font-sans flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
      screenFlash === 'red' ? 'bg-red-900/60' : screenFlash === 'white' ? 'bg-zinc-100' : ''
    }`}>
      
      {/* Background ambient noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.15] mix-blend-overlay"></div>

      {/* UI Header */}
      <header className="absolute top-0 left-0 right-0 p-5 flex justify-between z-40 max-w-lg mx-auto w-full pointer-events-none">
         <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Lantai Kardus</span>
            <motion.span 
               key={level} 
               initial={{ scale: 0.5, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               className="text-xl font-bold text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans"
            >
               Layer {level}
            </motion.span>
            <span className="text-[9px] text-neutral-400 tracking-wide mt-0.5 max-w-[170px] leading-tight">
              {level === 1 ? 'Lembaran Tipis (1-2 tusuk)' : 
               level === 2 ? 'Kardus Ganda (2-3 tusuk)' : 
               level === 3 ? 'Kardus Super Tebal' : 
               `Pelindung Baja (~${level} tusuk)`}
            </span>
         </div>
         
         <div className="flex flex-col text-right">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Skor Pintar</span>
            <motion.div 
               key={score}
               initial={{ scale: 1.3 }}
               animate={{ scale: 1 }}
               className="text-2xl font-bold text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans flex items-center justify-end gap-1"
            >
               <span className="tabular-nums">{score.toString().padStart(5, '0')}</span>
            </motion.div>
         </div>
      </header>

      {/* Main Game Stage */}
      <main className="z-10 relative flex items-center justify-center flex-1 w-full px-4">
         <AnimatePresence mode="wait">
            {!isTransitioning && items.length > 0 && (
                <motion.div
                   key={`layer-${level}`}
                   initial={{ scale: 0.9, opacity: 0, y: 70 }}
                   animate={{ 
                      scale: 1, 
                      opacity: 1, 
                      y: 0,
                      x: screenFlash === 'red' ? [0, -8, 8, -8, 8, 0] : 0
                   }}
                   exit={{ scale: 1.05, opacity: 0, y: -30 }}
                   transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                   className="relative"
                >
                   <CardboardLayer 
                      levelNum={level}
                      items={items}
                      width={boxDimensions.width}
                      height={boxDimensions.height}
                      onItemClick={handleItemClick}
                   />

                   {/* INTERACTIVE POPUP HUD CORES */}
                   <AnimatePresence>
                     {/* 0. EDUCATION CHALLENGE OVERLAY (LOCKED FIRST!) */}
                     {learningItem && (
                       <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-50 rounded-md overflow-hidden"
                       >
                         <KidLearningZone
                           itemType={learningItem.type}
                           onSuccess={handleLearningSuccess}
                           onCancel={() => setLearningItem(null)}
                         />
                       </motion.div>
                     )}

                     {/* 1. SECRET LEVER INTERACTION HUD */}
                     {activeLeverItem && (
                       <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-50 rounded-md overflow-hidden"
                       >
                         <ActiveLeverHUD 
                           onComplete={handleLeverComplete} 
                           onCancel={() => setActiveLeverItem(null)} 
                         />
                       </motion.div>
                     )}

                     {/* 2. PETASAN / BOMB INTERACTION HUD */}
                     {activeBombItem && (
                       <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-50 rounded-md overflow-hidden"
                       >
                         <ActiveBombHUD 
                           onComplete={handleBombDisarmComplete} 
                           // Handle penalty or explosion
                           onExplode={handleBombExplode}
                           onCancel={() => setActiveBombItem(null)} 
                         />
                       </motion.div>
                     )}

                     {/* 3. VINTAGE BRASS CHEST / HARTA KARUN HUD */}
                     {activeChestItem && (
                       <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-50 rounded-md overflow-hidden"
                       >
                         <ActiveChestHUD 
                           onComplete={handleChestComplete} 
                           onCancel={() => setActiveChestItem(null)} 
                         />
                       </motion.div>
                     )}

                     {/* 4. FOSSIL BRUSHING HUD */}
                     {activeFossilItem && (
                       <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-[60] rounded-md overflow-hidden bg-black/50"
                       >
                         <ActiveFossilHUD 
                           item={activeFossilItem}
                           onComplete={handleFossilComplete} 
                         />
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
            )}
         </AnimatePresence>
      </main>

      {/* Additional Overlays */}
      <AnimatePresence>
         {showFossilGallery && (
            <FossilGallery 
               collectedFossils={collectedFossils} 
               onClose={() => {
                   setShowFossilGallery(false);
                   setCollectedFossils([]); // reset to hunt again!
               }}
            />
         )}
      </AnimatePresence>

      {/* Ambient Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center z-40 pointer-events-none px-4">
         <p className="text-neutral-700 text-xs font-bold tracking-[0.2em] uppercase mix-blend-screen drop-shadow">
            Tusuk. Sobek. Temukan rahasia di dalam kotak.
         </p>
      </footer>
    </div>
  );
}
